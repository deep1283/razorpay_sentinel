import type { Account, CouponRedemption } from "./domain";
import { createServerSupabaseClient } from "./supabase/server";

type CheckoutSignalRow = { merchant_order_id: string; account_id: string; created_at: string; device_hash: string | null; payment_token_hash: string | null; address_hash: string | null; ip_hash: string | null; coupon_code: string; discount_inr: number };
type RawEventRow = { event_type: string; payload: unknown };

function valueOrUnique(value: string | null, field: string, orderId: string) {
  return value?.trim() || `missing:${field}:${orderId}`;
}

export function razorpayOrderId(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as { payload?: { payment?: { entity?: { order_id?: unknown } }; order?: { entity?: { id?: unknown } } } };
  const orderId = body.payload?.payment?.entity?.order_id ?? body.payload?.order?.entity?.id;
  return typeof orderId === "string" && orderId.length > 0 ? orderId : null;
}

export async function loadLiveCheckoutData(): Promise<{ configured: boolean; accounts: Account[]; redemptions: CouponRedemption[] }> {
  const client = createServerSupabaseClient();
  if (!client) return { configured: false, accounts: [], redemptions: [] };

  const [eventsResult, signalsResult] = await Promise.all([
    client.from("raw_events").select("event_type,payload").in("event_type", ["order.paid", "payment.captured"]),
    client.from("checkout_signals").select("merchant_order_id,account_id,created_at,device_hash,payment_token_hash,address_hash,ip_hash,coupon_code,discount_inr"),
  ]);
  if (eventsResult.error || signalsResult.error) {
    throw new Error("Sentinel could not load the latest payment signals.");
  }

  const paidOrderIds = new Set((eventsResult.data as RawEventRow[]).map((event) => razorpayOrderId(event.payload)).filter((id): id is string => Boolean(id)));
  const matchedSignals = (signalsResult.data as CheckoutSignalRow[]).filter((signal) => paidOrderIds.has(signal.merchant_order_id));
  const firstPaidSignalByAccount = new Map<string, CheckoutSignalRow>();
  for (const signal of matchedSignals) {
    const previous = firstPaidSignalByAccount.get(signal.account_id);
    if (!previous || new Date(signal.created_at) < new Date(previous.created_at)) firstPaidSignalByAccount.set(signal.account_id, signal);
  }
  const uniqueSignals = [...firstPaidSignalByAccount.values()];

  return {
    configured: true,
    accounts: uniqueSignals.map((signal) => ({
      id: signal.account_id,
      createdAt: signal.created_at,
      deviceHash: valueOrUnique(signal.device_hash, "device", signal.merchant_order_id),
      paymentTokenHash: valueOrUnique(signal.payment_token_hash, "payment", signal.merchant_order_id),
      addressHash: valueOrUnique(signal.address_hash, "address", signal.merchant_order_id),
      ipHash: valueOrUnique(signal.ip_hash, "ip", signal.merchant_order_id),
    })),
    redemptions: uniqueSignals.map((signal) => ({ accountId: signal.account_id, code: signal.coupon_code, discountInr: signal.discount_inr, redeemedAt: signal.created_at })),
  };
}

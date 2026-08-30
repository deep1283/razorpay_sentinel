import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CheckoutSignalInput = { merchantOrderId?: unknown; accountId?: unknown; createdAt?: unknown; deviceHash?: unknown; paymentTokenHash?: unknown; addressHash?: unknown; ipHash?: unknown; emailHash?: unknown; phoneHash?: unknown; referralCode?: unknown; couponCode?: unknown; discountInr?: unknown };

function authorized(request: Request) {
  const secret = process.env.SENTINEL_INGEST_SECRET;
  const header = request.headers.get("authorization");
  if (!secret || !header?.startsWith("Bearer ")) return false;
  const supplied = header.slice("Bearer ".length);
  return supplied.length === secret.length && timingSafeEqual(Buffer.from(supplied), Buffer.from(secret));
}

function text(value: unknown) { return typeof value === "string" && value.trim() ? value.trim() : null; }
function optionalText(value: unknown) { return value === undefined ? null : text(value); }

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let input: CheckoutSignalInput;
  try { input = await request.json() as CheckoutSignalInput; }
  catch { return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 }); }

  const merchantOrderId = text(input.merchantOrderId);
  const accountId = text(input.accountId);
  const couponCode = text(input.couponCode);
  const createdAt = text(input.createdAt) ?? new Date().toISOString();
  const discountInr = typeof input.discountInr === "number" && Number.isInteger(input.discountInr) && input.discountInr >= 0 ? input.discountInr : null;
  if (!merchantOrderId || !accountId || !couponCode || discountInr === null || Number.isNaN(new Date(createdAt).getTime())) return NextResponse.json({ error: "merchantOrderId, accountId, couponCode, createdAt, and a non-negative integer discountInr are required" }, { status: 400 });

  const client = createServerSupabaseClient();
  if (!client) return NextResponse.json({ error: "Signal storage is not configured" }, { status: 503 });
  const { error } = await client.from("checkout_signals").upsert({ merchant_order_id: merchantOrderId, account_id: accountId, created_at: createdAt, device_hash: optionalText(input.deviceHash), payment_token_hash: optionalText(input.paymentTokenHash), address_hash: optionalText(input.addressHash), ip_hash: optionalText(input.ipHash), email_hash: optionalText(input.emailHash), phone_hash: optionalText(input.phoneHash), referral_code: optionalText(input.referralCode), coupon_code: couponCode, discount_inr: discountInr }, { onConflict: "merchant_order_id" });
  if (error) return NextResponse.json({ error: "Unable to store checkout signals" }, { status: 503 });
  return NextResponse.json({ received: true, action: "observation_only" }, { status: 202 });
}

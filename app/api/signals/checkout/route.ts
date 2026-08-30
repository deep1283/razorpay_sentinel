import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CheckoutSignalInput = { merchantOrderId?: unknown; accountId?: unknown; createdAt?: unknown; deviceHash?: unknown; paymentTokenHash?: unknown; addressHash?: unknown; ipHash?: unknown; emailHash?: unknown; phoneHash?: unknown; referralCode?: unknown; couponCode?: unknown; discountInr?: unknown };
const MAX_SIGNAL_PAYLOAD_BYTES = 32_000;
const MAX_TEXT_LENGTH = 512;

function authorized(request: Request) {
  const secret = process.env.SENTINEL_INGEST_SECRET;
  const header = request.headers.get("authorization");
  if (!secret || !header?.startsWith("Bearer ")) return false;
  const supplied = header.slice("Bearer ".length);
  return supplied.length === secret.length && timingSafeEqual(Buffer.from(supplied), Buffer.from(secret));
}

function text(value: unknown) { const normalized = typeof value === "string" ? value.trim() : ""; return normalized && normalized.length <= MAX_TEXT_LENGTH ? normalized : null; }
function optionalText(value: unknown) { return value === undefined ? null : text(value); }

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_SIGNAL_PAYLOAD_BYTES) return NextResponse.json({ error: "Signal payload is too large" }, { status: 413 });
  let input: CheckoutSignalInput;
  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_SIGNAL_PAYLOAD_BYTES) return NextResponse.json({ error: "Signal payload is too large" }, { status: 413 });
    input = JSON.parse(rawBody) as CheckoutSignalInput;
  }
  catch { return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 }); }

  const merchantOrderId = text(input.merchantOrderId);
  const accountId = text(input.accountId);
  const couponCode = text(input.couponCode);
  const createdAt = text(input.createdAt) ?? new Date().toISOString();
  const discountInr = typeof input.discountInr === "number" && Number.isInteger(input.discountInr) && input.discountInr >= 0 && input.discountInr <= 1_000_000 ? input.discountInr : null;
  if (!merchantOrderId || !accountId || !couponCode || discountInr === null || Number.isNaN(new Date(createdAt).getTime())) return NextResponse.json({ error: "merchantOrderId, accountId, couponCode, createdAt, and a non-negative integer discountInr are required" }, { status: 400 });

  const client = createServerSupabaseClient();
  if (!client) return NextResponse.json({ error: "Signal storage is not configured" }, { status: 503 });
  try {
    const { error } = await client.from("checkout_signals").upsert({ merchant_order_id: merchantOrderId, account_id: accountId, created_at: createdAt, device_hash: optionalText(input.deviceHash), payment_token_hash: optionalText(input.paymentTokenHash), address_hash: optionalText(input.addressHash), ip_hash: optionalText(input.ipHash), email_hash: optionalText(input.emailHash), phone_hash: optionalText(input.phoneHash), referral_code: optionalText(input.referralCode), coupon_code: couponCode, discount_inr: discountInr }, { onConflict: "merchant_order_id" });
    if (error) {
      console.error("signals.storage_failed", { code: error.code });
      return NextResponse.json({ error: "Unable to store checkout signals" }, { status: 503 });
    }
  } catch (error) {
    console.error("signals.storage_unavailable", { message: error instanceof Error ? error.message : "Unknown storage error" });
    return NextResponse.json({ error: "Signal storage is temporarily unavailable" }, { status: 503 });
  }
  return NextResponse.json({ received: true, action: "observation_only" }, { status: 202 });
}

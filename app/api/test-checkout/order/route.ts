import { Buffer } from "buffer";
import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hashSignal } from "@/lib/signal-hash";
import { TEST_PAYMENT_AMOUNT_SUBUNITS } from "@/lib/test-checkout";

type OrderRequest = { accountId?: unknown; couponCode?: unknown; deviceHash?: unknown; email?: unknown; phone?: unknown; deliveryAddress?: unknown; referralCode?: unknown };
const MAX_ORDER_PAYLOAD_BYTES = 16_000;
const MAX_TEXT_LENGTH = 512;

function text(value: unknown) { const normalized = typeof value === "string" ? value.trim() : ""; return normalized && normalized.length <= MAX_TEXT_LENGTH ? normalized : null; }

function hashedNetworkFingerprint(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip");
  const secret = process.env.SENTINEL_IP_HASH_SECRET;
  if (!ip || !secret) return null;
  return `hmac-sha256:${createHmac("sha256", secret).update(ip).digest("hex")}`;
}

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || !keyId.startsWith("rzp_test_")) return NextResponse.json({ error: "Add Razorpay Test Mode API keys to the server environment first." }, { status: 503 });
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_ORDER_PAYLOAD_BYTES) return NextResponse.json({ error: "Checkout request is too large" }, { status: 413 });

  let input: OrderRequest;
  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_ORDER_PAYLOAD_BYTES) return NextResponse.json({ error: "Checkout request is too large" }, { status: 413 });
    input = JSON.parse(rawBody) as OrderRequest;
  }
  catch { return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 }); }
  const accountId = text(input.accountId);
  const couponCode = text(input.couponCode);
  const deviceHash = text(input.deviceHash);
  const ipHash = hashedNetworkFingerprint(request);
  const emailHash = hashSignal("email", text(input.email));
  const phoneHash = hashSignal("phone", text(input.phone));
  const addressHash = hashSignal("address", text(input.deliveryAddress));
  const referralCode = text(input.referralCode)?.toUpperCase() ?? null;
  if (!accountId || !couponCode || !deviceHash) return NextResponse.json({ error: "accountId, couponCode, and deviceHash are required" }, { status: 400 });

  let orderResponse: Response;
  try {
    orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}` },
      body: JSON.stringify({ amount: TEST_PAYMENT_AMOUNT_SUBUNITS, currency: "INR", receipt: `sentinel_${crypto.randomUUID()}`, notes: { source: "sentinel_test_checkout", coupon_code: couponCode } }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return NextResponse.json({ error: "Could not reach Razorpay to create the Test Mode order. Please try again." }, { status: 502 });
  }
  if (!orderResponse.ok) return NextResponse.json({ error: "Razorpay could not create the Test Mode order." }, { status: 502 });
  let order: { id: string; amount: number; currency: string };
  try {
    order = await orderResponse.json() as { id: string; amount: number; currency: string };
  } catch {
    return NextResponse.json({ error: "Razorpay returned an invalid Test Mode order response." }, { status: 502 });
  }
  if (!order.id || !Number.isFinite(order.amount) || !order.currency) return NextResponse.json({ error: "Razorpay returned an incomplete Test Mode order response." }, { status: 502 });

  const client = createServerSupabaseClient();
  if (!client) return NextResponse.json({ error: "Signal storage is not configured" }, { status: 503 });
  try {
    const { error } = await client.from("checkout_signals").insert({ merchant_order_id: order.id, account_id: accountId, created_at: new Date().toISOString(), device_hash: deviceHash, payment_token_hash: null, address_hash: addressHash, ip_hash: ipHash, email_hash: emailHash, phone_hash: phoneHash, referral_code: referralCode, coupon_code: couponCode, discount_inr: Math.round(order.amount / 100) });
    if (error) {
      console.error("test_checkout.storage_failed", { code: error.code });
      return NextResponse.json({ error: "The Test Mode order was created, but Sentinel could not store its signals. Please try again." }, { status: 503 });
    }
  } catch (error) {
    console.error("test_checkout.storage_unavailable", { message: error instanceof Error ? error.message : "Unknown storage error" });
    return NextResponse.json({ error: "The Test Mode order was created, but signal storage is temporarily unavailable. Please try again." }, { status: 503 });
  }

  return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId });
}

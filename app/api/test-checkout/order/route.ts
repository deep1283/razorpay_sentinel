import { Buffer } from "buffer";
import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type OrderRequest = { accountId?: unknown; couponCode?: unknown; deviceHash?: unknown };

function text(value: unknown) { return typeof value === "string" && value.trim() ? value.trim() : null; }

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

  let input: OrderRequest;
  try { input = await request.json() as OrderRequest; }
  catch { return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 }); }
  const accountId = text(input.accountId);
  const couponCode = text(input.couponCode);
  const deviceHash = text(input.deviceHash);
  const ipHash = hashedNetworkFingerprint(request);
  if (!accountId || !couponCode || !deviceHash) return NextResponse.json({ error: "accountId, couponCode, and deviceHash are required" }, { status: 400 });

  let orderResponse: Response;
  try {
    orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}` },
      body: JSON.stringify({ amount: 100, currency: "INR", receipt: `sentinel_${crypto.randomUUID()}`, notes: { source: "sentinel_test_checkout", coupon_code: couponCode } }),
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
  const { error } = await client.from("checkout_signals").insert({ merchant_order_id: order.id, account_id: accountId, created_at: new Date().toISOString(), device_hash: deviceHash, payment_token_hash: null, address_hash: null, ip_hash: ipHash, coupon_code: couponCode, discount_inr: 100 });
  if (error) return NextResponse.json({ error: "Unable to store the checkout signal" }, { status: 503 });

  return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId });
}

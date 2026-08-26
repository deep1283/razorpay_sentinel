import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

function validSignature(raw: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  return expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-razorpay-signature"))) return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  const eventId = request.headers.get("x-razorpay-event-id");
  const event = JSON.parse(raw) as { event?: string };
  // Persist raw event + eventId to Supabase here in production; acknowledge within 5 seconds,
  // then analyze asynchronously. This endpoint intentionally has no money-action code path.
  return NextResponse.json({ received: true, eventId, event: event.event, action: "observation_only" }, { status: 202 });
}

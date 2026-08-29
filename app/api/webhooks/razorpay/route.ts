import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function validSignature(raw: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  return expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-razorpay-signature"))) return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  let event: { event?: unknown; payload?: { payment?: { entity?: { id?: unknown } } } };
  try { event = JSON.parse(raw) as typeof event; }
  catch { return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 }); }

  const eventType = typeof event.event === "string" ? event.event : "unknown";
  const paymentId = event.payload?.payment?.entity?.id;
  const eventId = request.headers.get("x-razorpay-event-id") ?? (typeof paymentId === "string" ? `${eventType}:${paymentId}` : null);
  if (!eventId) return NextResponse.json({ error: "Missing Razorpay event identifier" }, { status: 400 });

  const client = createServerSupabaseClient();
  if (!client) return NextResponse.json({ error: "Webhook storage is not configured" }, { status: 503 });
  const { error } = await client.from("raw_events").insert({ source: "razorpay", external_event_id: eventId, event_type: eventType, payload: event });
  if (error?.code === "23505") return NextResponse.json({ received: true, duplicate: true, eventId, event: eventType, action: "observation_only" }, { status: 200 });
  if (error) return NextResponse.json({ error: "Unable to store webhook event" }, { status: 503 });

  return NextResponse.json({ received: true, eventId, event: eventType, action: "observation_only" }, { status: 202 });
}

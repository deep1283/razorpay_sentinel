"use client";

import { FormEvent, useState } from "react";

declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void }; } }

function browserHash() {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode([navigator.userAgent, navigator.language, screen.width, screen.height, Intl.DateTimeFormat().resolvedOptions().timeZone].join("|"))).then((digest) => `sha256:${Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("")}`);
}

function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise<void>((resolve, reject) => { const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.onload = () => resolve(); script.onerror = () => reject(new Error("Could not load Razorpay Checkout.")); document.body.appendChild(script); });
}

export default function TestCheckoutPage() {
  const [accountId, setAccountId] = useState("test-customer-1");
  const [couponCode, setCouponCode] = useState("NEW500");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function startPayment(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setMessage("");
    try {
      const deviceHash = await browserHash();
      const response = await fetch("/api/test-checkout/order", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ accountId, couponCode, deviceHash }) });
      const order = await response.json() as { error?: string; orderId?: string; amount?: number; currency?: string; keyId?: string };
      if (!response.ok || !order.orderId || !order.keyId) throw new Error(order.error ?? "Could not start the Test Mode payment.");
      await loadCheckout();
      new window.Razorpay!({ key: order.keyId, amount: order.amount, currency: order.currency, name: "Sentinel Test Checkout", description: `Test offer: ${couponCode}`, order_id: order.orderId, handler: () => setMessage("Payment completed. Razorpay will send the verified webhook shortly."), modal: { ondismiss: () => setMessage("Checkout closed. No payment was made.") }, theme: { color: "#2f6d51" } }).open();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not start the Test Mode payment."); }
    finally { setLoading(false); }
  }

  return <main className="test-checkout-page"><section className="test-checkout-card"><p>RAZORPAY TEST MODE</p><h1>Make a test payment</h1><span>Use a different customer ID for each signup. Reusing this browser or network gives Sentinel another shared signal to review.</span><form onSubmit={startPayment}><label>Test customer ID<input value={accountId} onChange={(event) => setAccountId(event.target.value)} required /></label><label>Offer code<input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} required /></label><button type="submit" disabled={loading}>{loading ? "Opening checkout…" : "Pay ₹1 in Test Mode"}</button></form>{message && <div role="status">{message}</div>}<small>Sentinel stores hashed browser and network signals only. It never stores card numbers or CVVs.</small></section></main>;
}

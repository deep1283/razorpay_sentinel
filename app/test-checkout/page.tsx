"use client";

import { FormEvent, useState } from "react";
import { TEST_PAYMENT_AMOUNT_INR } from "@/lib/test-checkout";

declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void }; } }

const browserIdKey = "sentinel_browser_id";

function browserHash() {
  let browserId = localStorage.getItem(browserIdKey);
  if (!browserId) {
    browserId = crypto.randomUUID();
    localStorage.setItem(browserIdKey, browserId);
  }
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode([browserId, navigator.userAgent, navigator.language, screen.width, screen.height, Intl.DateTimeFormat().resolvedOptions().timeZone].join("|"))).then((digest) => `sha256:${Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("")}`);
}

function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise<void>((resolve, reject) => { const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.onload = () => resolve(); script.onerror = () => reject(new Error("Could not load Razorpay Checkout.")); document.body.appendChild(script); });
}

export default function TestCheckoutPage() {
  const [accountId, setAccountId] = useState("test-customer-1");
  const [couponCode, setCouponCode] = useState("NEW500");
  const [email, setEmail] = useState("shared-customer@example.test");
  const [phone, setPhone] = useState("9000000000");
  const [deliveryAddress, setDeliveryAddress] = useState("42 Demo Street, Bengaluru");
  const [referralCode, setReferralCode] = useState("FRIEND500");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function startPayment(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setMessage("");
    try {
      const deviceHash = await browserHash();
      const response = await fetch("/api/test-checkout/order", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ accountId, couponCode, deviceHash, email, phone, deliveryAddress, referralCode }) });
      const order = await response.json() as { error?: string; orderId?: string; amount?: number; currency?: string; keyId?: string };
      if (!response.ok || !order.orderId || !order.keyId) throw new Error(order.error ?? "Could not start the Test Mode payment.");
      await loadCheckout();
      new window.Razorpay!({ key: order.keyId, amount: order.amount, currency: order.currency, name: "Sentinel Test Checkout", description: `Test offer: ${couponCode}`, order_id: order.orderId, handler: () => setMessage("Payment completed. Razorpay will send the verified webhook shortly."), modal: { ondismiss: () => setMessage("Checkout closed. No payment was made.") }, theme: { color: "#2f6d51" } }).open();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not start the Test Mode payment."); }
    finally { setLoading(false); }
  }

  return <main className="test-checkout-page"><section className="test-checkout-card"><p>RAZORPAY TEST MODE</p><h1>Make a test payment</h1><span>Use a different customer ID for each signup. Keep the shared test details below to demonstrate connected evidence.</span><form onSubmit={startPayment}><label>Test customer ID<input value={accountId} onChange={(event) => setAccountId(event.target.value)} required /></label><label>Offer code<input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} required /></label><label>Test email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Test phone<input inputMode="numeric" value={phone} onChange={(event) => setPhone(event.target.value)} required /></label><label>Delivery address<input value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} required /></label><label>Referral code<input value={referralCode} onChange={(event) => setReferralCode(event.target.value)} /></label><button type="submit" disabled={loading}>{loading ? "Opening checkout…" : `Pay ₹${TEST_PAYMENT_AMOUNT_INR} in Test Mode`}</button></form>{message && <div role="status">{message}</div>}<small>Sentinel stores only HMAC-hashed browser, network, identity, address, and payment fingerprints—never card numbers or CVVs.</small></section></main>;
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SentinelLogo } from "@/components/ui/sentinel-logo";

export default function ConnectRazorpayPage() {
  const [webhookUrl, setWebhookUrl] = useState("https://your-public-domain.com/api/webhooks/razorpay");
  useEffect(() => {
    if (window.location.protocol === "https:" && window.location.hostname !== "localhost") setWebhookUrl(`${window.location.origin}/api/webhooks/razorpay`);
  }, []);

  return <main className="connect-page">
    <header className="connect-topbar"><Link href="/dashboard?guest=1" className="brief-brand flex items-center gap-2"><SentinelLogo size={20} className="rounded-md" /> Sentinel</Link><Link href="/dashboard?guest=1">Back to dashboard</Link></header>
    <section className="connect-shell">
      <p className="connect-kicker">RAZORPAY TEST MODE</p>
      <h1>Set up your Test Mode workspace</h1>
      <p className="connect-lede">Guest access opens this Sentinel workspace&apos;s configured Razorpay Test Mode account. Sentinel will show its payment activity—not sample cases.</p>

      <ol className="connect-steps">
        <li><span>1</span><div><b>Add the webhook in your Razorpay account</b><p>In Test Mode, add this URL and select <code>order.paid</code> and <code>payment.captured</code>.</p><code className="connect-url">{webhookUrl}</code></div></li>
        <li><span>2</span><div><b>Use the same webhook secret</b><p>Copy the secret from your Sentinel server configuration into Razorpay&apos;s webhook form. Keep it private.</p></div></li>
        <li><span>3</span><div><b>Send checkout signals from your server</b><p>When your server creates an order, send its hashed customer and offer signals to Sentinel. Never send card numbers or CVVs.</p></div></li>
        <li><span>4</span><div><b>Make a Test Mode payment</b><p>When Razorpay sends the paid-order webhook, your live review data will appear on the dashboard.</p></div></li>
      </ol>

      <a className="connect-test-link" href="/test-checkout" target="_blank" rel="noreferrer">Open Test Checkout in a new tab <b>↗</b></a>

      <aside className="connect-note"><b>Customer-friendly by design.</b> Sentinel only recommends a review. It never blocks, declines, or changes a customer&apos;s offer.</aside>
    </section>
  </main>;
}

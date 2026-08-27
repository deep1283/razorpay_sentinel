"use client";

import Link from "next/link";
import { useState } from "react";

const journeys = [
  {
    label: "Detect promo abuse",
    eyebrow: "SIGNAL ORCHESTRATION",
    title: "Turn every payment signal into a clearer decision.",
    body: "Sentinel reads the signals already present in your Razorpay events and connects the accounts that should never have looked related.",
    metric: "98.4% confidence",
    panel: "signals",
  },
  {
    label: "Investigate rings",
    eyebrow: "CONNECTED EVIDENCE",
    title: "See the whole ring, not just one suspicious order.",
    body: "Move from isolated alerts to an investigation-ready case with shared devices, payment tokens, addresses, and timelines in one view.",
    metric: "4 independent links",
    panel: "graph",
  },
  {
    label: "Protect campaigns",
    eyebrow: "PROMOTION CONTROL",
    title: "Keep the offer. Lose the exploit.",
    body: "Track promotion velocity and repeat redemptions before a limited-time campaign turns into a recurring loss channel.",
    metric: "₹42,800 protected",
    panel: "campaign",
  },
  {
    label: "Review evidence",
    eyebrow: "HUMAN IN CONTROL",
    title: "Every flag comes with its evidence trail.",
    body: "Your team makes the call. Sentinel stays read-only and gives investigators the context they need to act with confidence.",
    metric: "0 checkout changes",
    panel: "review",
  },
];

function SignalVisual({ type }: { type: string }) {
  if (type === "graph") {
    return <div className="primer-graph-visual" aria-hidden="true"><span className="primer-node p-node-a">u_891</span><span className="primer-node p-node-b">device</span><span className="primer-node p-node-c">visa · 4911</span><span className="primer-node p-node-d">u_442</span><i className="p-edge e-one" /><i className="p-edge e-two" /><i className="p-edge e-three" /><div className="primer-risk-chip">Shared payment instrument <b>94</b></div></div>;
  }
  if (type === "campaign") {
    return <div className="primer-campaign-visual" aria-hidden="true"><div className="primer-ticket"><span>WELCOME50</span><b>50% OFF</b><small>Promotion velocity monitored</small></div><div className="primer-campaign-bars"><i /><i /><i /><i className="hot" /><i className="hot" /><i className="hot" /></div><div className="primer-alert-pill">Unusual redemption pattern</div></div>;
  }
  if (type === "review") {
    return <div className="primer-review-visual" aria-hidden="true"><div className="primer-evidence-card"><span>CASE · RN-8042</span><b>Cross-account ring</b><p>3 accounts · 2 shared signals</p><div><i /><i /><i /></div></div><div className="primer-approved">Ready for review <strong>→</strong></div></div>;
  }
  return <div className="primer-signal-visual" aria-hidden="true"><div className="primer-signal-window"><div className="primer-window-bar"><span>LIVE SIGNALS</span><b>● connected</b></div><div className="primer-window-row"><i className="coral" /><span>new device cluster</span><small>2m ago</small></div><div className="primer-window-row"><i className="blue" /><span>token reused</span><small>now</small></div><div className="primer-window-row"><i className="yellow" /><span>promo velocity spike</span><small>now</small></div></div><div className="primer-mini-card">RISK SCORE <b>94</b></div></div>;
}

export function CommerceShowcase() {
  const [active, setActive] = useState(0);
  const journey = journeys[active];

  return (
    <>
      <section className="primer-proof" aria-label="Product overview">
        <p>BUILT FOR TEAMS PROTECTING <span>EVERY</span> RAZORPAY PROMOTION</p>
        <div className="primer-proof-logos"><b>Razorpay</b><b>commerce</b><b>growth</b><b>risk ops</b><b>payments</b></div>
      </section>

      <section className="primer-journeys" id="features">
        <div className="primer-tabs" role="tablist" aria-label="Sentinel capabilities">
          {journeys.map((item, index) => <button key={item.label} type="button" role="tab" aria-selected={active === index} className={active === index ? "active" : ""} onClick={() => setActive(index)}>{item.label}</button>)}
        </div>
        <div className="primer-stage">
          <div className="primer-stage-copy">
            <span>{journey.eyebrow}</span>
            <h2>{journey.title}</h2>
            <p>{journey.body}</p>
            <Link href="/dashboard" className="primer-outline-link">Explore the live workspace <b>→</b></Link>
          </div>
          <div className="primer-stage-visual"><SignalVisual type={journey.panel} /><div className="primer-stage-stat"><span>{journey.metric}</span><i>↗</i></div></div>
        </div>
      </section>

      <section className="primer-products" id="graph">
        <p className="primer-kicker">A BETTER WAY TO INVESTIGATE</p>
        <div className="primer-products-heading"><h2>One calm workspace for the signals that matter.</h2><p>From the first suspicious redemption to a review-ready case, Sentinel keeps every thread connected.</p></div>
        <div className="primer-product-grid">
          <article className="primer-product-card primer-product-coral"><div className="primer-card-ui"><span>PAYMENT EVENT</span><b>order.paid</b><i>→</i></div><h3>Catch repeat abuse in real time</h3><p>Passive webhook ingestion, normalized in moments.</p><Link href="/dashboard">View signals <b>→</b></Link></article>
          <article className="primer-product-card primer-product-yellow"><div className="primer-network"><span>u_148</span><span>card</span><span>u_219</span><i /><i /><i /></div><h3>Follow the shared thread</h3><p>Devices, cards, addresses, and identities become one graph.</p><Link href="/dashboard">Open graph <b>→</b></Link></article>
        </div>
        <div className="primer-rail">
          {["Token intelligence", "Address matching", "Device fingerprints", "Promotion velocity"].map((name, index) => <div key={name}><span className={`primer-rail-icon icon-${index}`}>✦</span><p>{name}</p><b>→</b></div>)}
        </div>
      </section>

      <section className="primer-connections">
        <div><p className="primer-kicker">CONNECTS TO WHAT YOU ALREADY USE</p><h2>Signals in. Clearer decisions out.</h2><Link href="/login" className="primer-outline-link">Request sandbox access <b>→</b></Link></div>
        <div className="primer-connection-orbs" aria-hidden="true">{["R", "◌", "◇", "◎", "◈", "●", "✦", "▣", "◒", "↗", "⊹", "◍"].map((symbol, index) => <i key={`${symbol}-${index}`}>{symbol}</i>)}</div>
      </section>

      <section className="primer-stories" id="safety">
        <p className="primer-kicker">EVIDENCE, NOT BLACK BOXES</p><h2>Know why a case was flagged.</h2>
        <div className="primer-story-grid"><article className="primer-story lavender"><div className="primer-story-chart"><span>RING RISK</span><i /><i /><i /><i /><i /><strong>94</strong></div><h3>Every conclusion is traceable</h3><p>Review the exact signals that connected an account to a suspicious cluster.</p><Link href="/dashboard">See case evidence <b>→</b></Link></article><article className="primer-story mint"><div className="primer-story-list"><span>CASE QUEUE</span><p><i /> Token reused <b>high</b></p><p><i /> Address overlap <b>medium</b></p><p><i /> Device cluster <b>high</b></p></div><h3>Keep people in control</h3><p>Sentinel surfaces the work; your team decides what happens next.</p><Link href="/login">Talk to the team <b>→</b></Link></article></div>
      </section>

      <section className="primer-cta" id="contact"><p className="primer-kicker">READY WHEN YOU ARE</p><h2>Make every promotion harder to exploit.</h2><p>Bring your first webhook event, and we’ll help you find the hidden connections.</p><Link href="/login">Request a demo <b>→</b></Link></section>
      <footer className="primer-footer"><div className="primer-footer-brand"><b>◈ Sentinel</b><p>Fraud intelligence for the teams that keep commerce moving.</p></div><div><b>Product</b><a href="#features">Capabilities</a><Link href="/dashboard">Live workspace</Link><Link href="/login">Sign in</Link></div><div><b>Resources</b><a href="#safety">Evidence trails</a><a href="#contact">Talk to us</a><a href="#features">How it works</a></div><div><b>Stay in the loop</b><p>Product notes and safer-growth ideas, occasionally.</p><Link className="primer-footer-button" href="/login">Get access →</Link></div><small>© {new Date().getFullYear()} Sentinel Intelligence · Built for Razorpay merchants</small></footer>
    </>
  );
}

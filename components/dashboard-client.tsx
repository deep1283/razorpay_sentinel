"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DashboardSnapshot, RingCase } from "@/lib/domain";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

function toneFor(ring: RingCase) {
  if (ring.riskLevel === "high") return "urgent";
  if (ring.riskLevel === "medium") return "soon";
  return "watch";
}

function plainReason(ring: RingCase) {
  const signals = ring.evidence.slice(0, 2).map((item) => item.label.toLowerCase());
  if (signals.length === 0) return "We noticed an unusual pattern in these orders.";
  return `We noticed ${signals.join(" and ")} across these signups.`;
}

export function DashboardClient({ initial }: { initial: DashboardSnapshot }) {
  const [data, setData] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const client = createBrowserSupabaseClient();
    const isGuest = new URLSearchParams(window.location.search).get("guest") === "1";
    if (!client) return;
    client.auth.getSession().then(({ data: { session } }) => {
      if (!session && !isGuest) window.location.assign("/login");
    });
  }, []);

  async function refreshDashboard() {
    setRefreshing(true);
    try {
      const response = await fetch("/api/dashboard");
      if (response.ok) setData(await response.json());
    } finally {
      setRefreshing(false);
    }
  }

  const sortedCases = [...data.cases].sort((a, b) => b.score - a.score);
  const totalExposure = sortedCases.reduce((sum, ring) => sum + ring.exposureInr, 0);
  const accountsToReview = new Set(sortedCases.flatMap((ring) => ring.accountIds)).size;

  return (
    <main className="brief-dashboard">
      <header className="brief-topbar">
        <Link href="/" className="brief-brand"><span>◈</span> Sentinel</Link>
      </header>

      <div className="brief-shell">
        <section className="brief-summary" aria-label="Promotion risk summary">
          <article className="brief-summary-main"><span>Offers to check</span><strong>₹{totalExposure.toLocaleString("en-IN")}</strong><p>in offers where we noticed unusual signup patterns</p></article>
          <article><span>Customers involved</span><strong>{accountsToReview}</strong><p>people connected by one or more signals</p></article>
        </section>

        <section className="brief-list-section">
          {sortedCases.length === 0 ? <Link href="/connect" className="brief-start-tracking">Connect to Razorpay to start tracking <b>→</b></Link> : <><div className="brief-list-heading"><div><p>RISK CHECKS</p><h2>Suspicious activity to review</h2></div><span>{sortedCases.length} groups found</span></div>
          <div className="brief-case-list">
            {sortedCases.map((ring) => {
              const tone = toneFor(ring);
              return <article className="brief-case" key={ring.id}>
                <div className={`brief-case-dot ${tone}`} aria-hidden="true" />
                <div className="brief-case-description"><div><b>{ring.accountIds.length} customers</b></div><p>{plainReason(ring)}</p></div>
                <div className="brief-case-offer"><span>Offer used</span><b>{ring.couponCode}</b></div>
                <div className="brief-case-value"><span>Risk score</span><b>{ring.score}%</b></div>
                <Link href={`/cases/${ring.id}`} aria-label={`View signup pattern ${ring.id}`}>View <b>→</b></Link>
              </article>;
            })}
          </div></>}
        </section>
        <p className="brief-footer-note">A shared network or device is not enough on its own. Sentinel recommends a next step; your team decides.</p>
      </div>
    </main>
  );
}

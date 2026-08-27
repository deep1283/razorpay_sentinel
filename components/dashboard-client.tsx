"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DashboardSnapshot, RingCase } from "@/lib/domain";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

function priorityFor(ring: RingCase) {
  if (ring.score >= 80) return { label: "Review today", tone: "urgent" };
  if (ring.score >= 70) return { label: "Review soon", tone: "soon" };
  return { label: "Keep an eye on it", tone: "watch" };
}

function plainReason(ring: RingCase) {
  const signals = ring.evidence.slice(0, 2).map((item) => item.label.toLowerCase());
  if (signals.length === 0) return "We noticed an unusual pattern in these orders.";
  return `These accounts share ${signals.join(" and ")}.`;
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
  const mainCase = sortedCases[0];
  const totalExposure = sortedCases.reduce((sum, ring) => sum + ring.exposureInr, 0);
  const accountsToReview = new Set(sortedCases.flatMap((ring) => ring.accountIds)).size;

  return (
    <main className="brief-dashboard">
      <header className="brief-topbar">
        <Link href="/" className="brief-brand"><span>◈</span> Sentinel</Link>
        <div className="brief-topbar-actions">
          <span className="brief-demo-note">Demo workspace</span>
          <button type="button" onClick={refreshDashboard} disabled={refreshing}>{refreshing ? "Updating…" : "Refresh"}</button>
        </div>
      </header>

      <div className="brief-shell">
        <section className="brief-summary" aria-label="Promotion risk summary">
          <article className="brief-summary-main"><span>Potential promotion loss</span><strong>₹{totalExposure.toLocaleString("en-IN")}</strong><p>across {sortedCases.length} groups that need a quick look</p></article>
          <article><span>Customers to review</span><strong>{accountsToReview}</strong><p>accounts connected by similar details</p></article>
          <article><span>What Sentinel does</span><p className="brief-reassurance">It flags unusual patterns. Your team stays in control of every decision.</p></article>
        </section>

        {mainCase && <section className="brief-priority">
          <div className="brief-priority-copy"><span className="brief-priority-label">START HERE</span><h2>{mainCase.accountIds.length} customers may be using the same offer together.</h2><p>{plainReason(mainCase)} They used <b>{mainCase.couponCode}</b>, putting ₹{mainCase.exposureInr.toLocaleString("en-IN")} of promotion value at risk.</p><Link href={`/cases/${mainCase.id}`}>Review this group <b>→</b></Link></div>
          <div className="brief-priority-facts"><span>CASE {mainCase.id}</span><div><b>{mainCase.accountIds.length}</b><small>customers linked</small></div><div><b>₹{mainCase.exposureInr.toLocaleString("en-IN")}</b><small>offer value used</small></div></div>
        </section>}

        <section className="brief-list-section">
          <div className="brief-list-heading"><div><p>OTHER GROUPS TO CHECK</p><h2>Keep an eye on these</h2></div><span>{sortedCases.length} groups found</span></div>
          <div className="brief-case-list">
            {sortedCases.map((ring) => {
              const priority = priorityFor(ring);
              return <article className="brief-case" key={ring.id}>
                <div className={`brief-case-dot ${priority.tone}`} aria-hidden="true" />
                <div className="brief-case-description"><div><b>{ring.accountIds.length} linked customers</b><span className={`brief-priority-pill ${priority.tone}`}>{priority.label}</span></div><p>{plainReason(ring)}</p></div>
                <div className="brief-case-offer"><span>Offer used</span><b>{ring.couponCode}</b></div>
                <div className="brief-case-value"><span>Value at risk</span><b>₹{ring.exposureInr.toLocaleString("en-IN")}</b></div>
                <Link href={`/cases/${ring.id}`} aria-label={`Review case ${ring.id}`}>Review <b>→</b></Link>
              </article>;
            })}
          </div>
        </section>
        <p className="brief-footer-note">Sentinel never blocks a customer or changes an order automatically.</p>
      </div>
    </main>
  );
}

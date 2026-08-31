"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SentinelLogo } from "@/components/ui/sentinel-logo";
import type { DashboardSnapshot, RingCase } from "@/lib/domain";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

function toneFor(ring: RingCase) {
  if (ring.riskLevel === "high") return "urgent";
  if (ring.riskLevel === "medium") return "soon";
  return "watch";
}

export function plainReason(ring: RingCase) {
  const signals = [...new Set(ring.evidence.map((item) => item.label.toLowerCase()))].slice(0, 2);
  if (signals.length === 0) return "We noticed an unusual pattern in these orders.";
  return `We noticed ${signals.join(" and ")} across these signups.`;
}

export function DashboardClient({ initial, initialError, isDemo = false }: { initial: DashboardSnapshot | null; initialError?: string; isDemo?: boolean }) {
  const [data, setData] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(initialError ?? "");

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
    setError("");
    try {
      const response = await fetch(`/api/dashboard${isDemo ? "?demo=1" : ""}`);
      const payload = await response.json() as DashboardSnapshot | { error?: string };
      if (!response.ok || !("cases" in payload)) throw new Error("error" in payload ? payload.error : "The dashboard could not be refreshed.");
      setData(payload);
    } catch (error) {
      setError(error instanceof Error ? error.message : "The dashboard could not be refreshed.");
    } finally {
      setRefreshing(false);
    }
  }

  const sortedCases = [...(data?.cases ?? [])].sort((a, b) => b.score - a.score);
  const totalExposure = sortedCases.reduce((sum, ring) => sum + ring.exposureInr, 0);
  const accountsToReview = new Set(sortedCases.flatMap((ring) => ring.accountIds)).size;

  return (
    <main className="brief-dashboard">
      <header className="brief-topbar">
        <Link href="/" className="brief-brand flex items-center gap-2"><SentinelLogo size={22} className="rounded-md" /> Sentinel</Link>
        <nav className="brief-nav" aria-label="Workspace navigation">
          <Link href={`/dashboard?guest=1${isDemo ? "&demo=1" : ""}`} className="active" aria-current="page">Dashboard</Link>
          <Link href="/test-results">Test</Link>
        </nav>
      </header>

      <div className="brief-shell">
        {error && <div className="brief-error" role="alert"><span>{error}</span><button type="button" onClick={refreshDashboard} disabled={refreshing}>{refreshing ? "Retrying…" : "Try again"}</button></div>}
        <section className="brief-summary" aria-label="Promotion risk summary">
          <article className="brief-summary-main"><span>Offers to check</span><strong>₹{totalExposure.toLocaleString("en-IN")}</strong><p>in offers where we noticed unusual signup patterns</p></article>
          <article><span>Customers involved</span><strong>{accountsToReview}</strong><p>people connected by one or more signals</p></article>
        </section>

        <section className="brief-list-section">
          {sortedCases.length === 0 ? <section className="brief-empty-cta"><p>NO ACTIVITY YET</p><h2>Make a demo payment to see Sentinel work.</h2><span>Razorpay will send the payment update and Sentinel will show the result here.</span><Link href="/test-checkout" target="_blank" rel="noreferrer">Make a ₹100 demo payment <b>↗</b></Link></section> : <><div className="brief-list-heading"><div><p>RISK CHECKS</p><h2>Suspicious activity to review</h2></div><span>{sortedCases.length} groups found</span></div>
          <div className="brief-case-list">
            {sortedCases.map((ring) => {
              const tone = toneFor(ring);
              return <article className="brief-case" key={ring.id}>
                <div className={`brief-case-dot ${tone}`} aria-hidden="true" />
                <div className="brief-case-description"><div><b>{ring.accountIds.length} customers</b></div><p>{plainReason(ring)}</p></div>
                <div className="brief-case-offer"><span>Offer used</span><b>{ring.couponCode}</b></div>
                <div className="brief-case-value"><span>Risk score</span><b>{ring.score}%</b></div>
                <Link href={`/cases/${ring.id}${isDemo ? "?demo=1" : ""}`} aria-label={`View signup pattern ${ring.id}`}>View <b>→</b></Link>
              </article>;
            })}
          </div></>}
        </section>
        <p className="brief-footer-note">A shared network or device is not enough on its own. Sentinel recommends a next step; your team decides.</p>
      </div>
    </main>
  );
}

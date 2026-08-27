"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DashboardSnapshot, RingCase } from "@/lib/domain";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function DashboardClient({ initial }: { initial: DashboardSnapshot }) {
  const [data, setData] = useState<DashboardSnapshot>(initial);
  const [filter, setFilter] = useState<"all" | "high" | "monitoring">("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const client = createBrowserSupabaseClient();
    const isGuest =
      typeof window !== "undefined" &&
      (new URLSearchParams(window.location.search).get("guest") === "1" ||
        localStorage.getItem("sentinel_guest") === "1");

    if (!client) return;
    client.auth.getSession().then(({ data: { session } }) => {
      if (!session && !isGuest) {
        window.location.assign("/login");
      }
    });
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {}
    setRefreshing(false);
  }

  const primary: RingCase | undefined = data.cases[0];

  const filteredCases = data.cases.filter((item) => {
    if (filter === "high") return item.score >= 80;
    if (filter === "monitoring") return item.status === "monitoring" || item.score < 80;
    return true;
  });

  const totalExposure = data.cases.reduce((sum, ring) => sum + ring.exposureInr, 0);
  const uniqueAccountsCount = new Set(data.cases.flatMap((c) => c.accountIds)).size;
  const maxScore = Math.max(...data.cases.map((c) => c.score), 0);

  return (
    <main className="dash-root">
      {/* Modern Top Navigation */}
      <header className="dash-topbar">
        <div className="dash-topbar-inner">
          <div className="dash-topbar-left">
            <Link href="/" className="dash-logo">
              <span className="dash-logo-icon">◈</span>
              <span className="dash-logo-text">Sentinel</span>
            </Link>
            <div className="dash-live-badge">
              <span className="live-dot" />
              <span>Passive Ingestion Active</span>
            </div>
          </div>

          <div className="dash-topbar-right">
            <button
              type="button"
              onClick={handleRefresh}
              className="dash-btn-ghost"
              disabled={refreshing}
            >
              {refreshing ? "Refreshing…" : "↻ Refresh Signals"}
            </button>
            <Link href="/" className="dash-btn-outline">
              Exit to Home →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <div className="dash-container">
        {/* Intro Header */}
        <div className="dash-heading-row">
          <div>
            <span className="dash-kicker">INVESTIGATION WORKSPACE</span>
            <h1 className="dash-title">Fraud & Abuse Signals</h1>
            <p className="dash-subtitle">
              Live multi-account identity clustering and promotional abuse detection.
            </p>
          </div>
        </div>

        {/* 4 Essential KPI Cards */}
        <div className="dash-metrics-grid">
          <div className="dash-metric-card">
            <span className="metric-label">Active Clusters</span>
            <b className="metric-val">{data.cases.length}</b>
            <span className="metric-meta">Awaiting review</span>
          </div>

          <div className="dash-metric-card">
            <span className="metric-label">Protected Exposure</span>
            <b className="metric-val">₹{totalExposure.toLocaleString("en-IN")}</b>
            <span className="metric-meta">Across detected rings</span>
          </div>

          <div className="dash-metric-card">
            <span className="metric-label">Flagged Accounts</span>
            <b className="metric-val">{uniqueAccountsCount}</b>
            <span className="metric-meta">Clustered entities</span>
          </div>

          <div className="dash-metric-card">
            <span className="metric-label">Peak Ring Risk</span>
            <b className="metric-val text-red-600">{maxScore}/100</b>
            <span className="metric-meta">Immediate priority</span>
          </div>
        </div>

        {/* Priority Case Spotlight */}
        {primary && (
          <div className="dash-spotlight-card">
            <div className="spotlight-main">
              <div className="spotlight-header">
                <span className="case-id-badge">{primary.id}</span>
                <span className="priority-tag">TOP INVESTIGATION PRIORITY</span>
              </div>

              <h2 className="spotlight-title">
                {primary.accountIds.length} Connected Accounts · Promo Code {primary.couponCode}
              </h2>

              <p className="spotlight-desc">{primary.explanation}</p>

              {/* Signals Breakdown */}
              <div className="spotlight-signals">
                {primary.evidence.map((item, idx) => (
                  <div key={`${item.kind}-${idx}`} className="signal-item">
                    <span className={`strength-indicator ${item.strength}`} />
                    <div className="signal-text">
                      <b>{item.label}</b>
                      <small>{item.detail}</small>
                    </div>
                  </div>
                ))}
              </div>

              <div className="spotlight-actions">
                <Link href={`/cases/${primary.id}`} className="dash-primary-btn">
                  Inspect Evidence Graph →
                </Link>
              </div>
            </div>

            <div className="spotlight-sidebar">
              <span className="sidebar-label">CONFIDENCE SCORE</span>
              <div className="sidebar-score">{primary.confidence}</div>
              <span className="sidebar-scale">out of 100</span>

              <hr className="sidebar-divider" />

              <div className="sidebar-meta">
                <span>VOUCHER EXPOSURE</span>
                <b>₹{primary.exposureInr.toLocaleString("en-IN")}</b>
              </div>

              <div className="sidebar-meta mt-2">
                <span>STATUS</span>
                <b className="status-tag">Needs Analyst Decision</b>
              </div>
            </div>
          </div>
        )}

        {/* Investigation Cases Queue */}
        <div className="dash-queue-section">
          <div className="queue-header">
            <div>
              <h3 className="queue-title">Investigation Queue</h3>
              <p className="queue-subtitle">All detected promo abuse and identity rings.</p>
            </div>

            <div className="queue-filter-tabs">
              <button
                type="button"
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All ({data.cases.length})
              </button>
              <button
                type="button"
                className={`filter-btn ${filter === "high" ? "active" : ""}`}
                onClick={() => setFilter("high")}
              >
                High Risk (≥80)
              </button>
              <button
                type="button"
                className={`filter-btn ${filter === "monitoring" ? "active" : ""}`}
                onClick={() => setFilter("monitoring")}
              >
                Monitoring
              </button>
            </div>
          </div>

          <div className="queue-table-wrap">
            <table className="queue-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Linked Accounts</th>
                  <th>Voucher Code</th>
                  <th>Exposure</th>
                  <th>Risk Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((ring, idx) => (
                  <tr key={`${ring.id}-${idx}`}>
                    <td>
                      <span className="table-case-id">{ring.id}</span>
                    </td>
                    <td>
                      <div className="table-accounts">
                        <b>{ring.accountIds.length} Accounts</b>
                        <small>{ring.accountIds.slice(0, 3).join(", ")}{ring.accountIds.length > 3 ? "…" : ""}</small>
                      </div>
                    </td>
                    <td>
                      <code className="table-promo-code">{ring.couponCode}</code>
                    </td>
                    <td>
                      <span className="table-exposure">₹{ring.exposureInr.toLocaleString("en-IN")}</span>
                    </td>
                    <td>
                      <span className={`risk-badge ${ring.score >= 80 ? "high" : "med"}`}>
                        {ring.score}/100
                      </span>
                    </td>
                    <td>
                      <Link href={`/cases/${ring.id}`} className="table-inspect-link">
                        Inspect Case →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

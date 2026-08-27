"use client";

import Link from "next/link";
import { useState } from "react";
import type { RingCase } from "@/lib/domain";

interface CaseDetailViewProps {
  ring: RingCase;
}

export function CaseDetailView({ ring }: CaseDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"graph" | "accounts" | "proof">("graph");

  // Format realistic account entries for this ring
  const accountsData = ring.accountIds.map((id, index) => {
    const minutes = 2 + index * 3;
    const timeStr = `16 Nov, 10:${String(minutes).padStart(2, "0")} AM`;
    return {
      num: `A${index + 1}`,
      id,
      role: "New User",
      time: timeStr,
      device: "DVC-7821 (iPhone 15)",
      ip: "117.201.214.24",
      payment: "VISA •••• 4421",
      email: `user_${id.toLowerCase()}@gmail.com`,
      phone: `+91 98*** **${20 + index}`,
      address: "Flat 4B, Koramangala 4th Block, Bangalore",
      discount: ring.exposureInr / ring.accountIds.length,
    };
  });

  return (
    <div className="case-detail-shell">
      {/* Top Header Navigation */}
      <header className="case-topbar">
        <div className="case-topbar-inner">
          <Link href="/dashboard" className="case-back-link">
            ← Back to Overview
          </Link>
          <div className="case-top-meta">
            <span className="case-status-chip">INVESTIGATION QUEUE</span>
            <span className="case-id-tag">{ring.id}</span>
          </div>
        </div>
      </header>

      <div className="case-main-body">
        {/* Title & Stats Banner */}
        <div className="case-header-card">
          <div className="case-header-left">
            <span className="case-kicker">COORDINATED PROMOTION ABUSE RING</span>
            <h1 className="case-main-title">
              Ring #{ring.id}: {ring.accountIds.length} Clustered Accounts
            </h1>
            <p className="case-main-desc">
              Multiple customer profiles sharing the same hardware fingerprint, payment token, and delivery coordinates to repeatedly claim <b>{ring.couponCode}</b>.
            </p>
          </div>

          <div className="case-header-stats">
            <div className="stat-pill">
              <span>ACCOUNTS</span>
              <b>{ring.accountIds.length}</b>
            </div>
            <div className="stat-pill">
              <span>VALUE AT RISK</span>
              <b>₹{ring.exposureInr.toLocaleString("en-IN")}</b>
            </div>
            <div className="stat-pill risk">
              <span>RISK SCORE</span>
              <b>{ring.confidence}/100</b>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="case-nav-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "graph" ? "active" : ""}`}
            onClick={() => setActiveTab("graph")}
          >
            ◈ Graph Topology View
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "accounts" ? "active" : ""}`}
            onClick={() => setActiveTab("accounts")}
          >
            👤 Linked Accounts ({ring.accountIds.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "proof" ? "active" : ""}`}
            onClick={() => setActiveTab("proof")}
          >
            📋 Evidence Proofs ({ring.evidence.length})
          </button>
        </div>

        {/* 1. VISUAL GRAPH TOPOLOGY (Matching User Reference Image) */}
        {activeTab === "graph" && (
          <div className="graph-canvas-wrapper">
            <div className="graph-canvas-container">
              {/* SVG Connecting Lines */}
              <svg className="graph-lines-svg" viewBox="0 0 1000 650" preserveAspectRatio="none">
                {/* Account lines (Red Solid) */}
                <line x1="300" y1="95" x2="490" y2="280" stroke="#ef4444" strokeWidth="2" />
                <line x1="300" y1="185" x2="490" y2="295" stroke="#ef4444" strokeWidth="2" />
                <line x1="300" y1="275" x2="490" y2="310" stroke="#ef4444" strokeWidth="2" />
                <line x1="300" y1="365" x2="490" y2="325" stroke="#ef4444" strokeWidth="2" />
                <line x1="300" y1="455" x2="490" y2="340" stroke="#ef4444" strokeWidth="2" />

                {/* Device line (Green Solid) */}
                <line x1="500" y1="140" x2="500" y2="265" stroke="#10b981" strokeWidth="2" />

                {/* IP line (Blue Solid) */}
                <line x1="660" y1="130" x2="530" y2="280" stroke="#3b82f6" strokeWidth="2" />

                {/* Payment Method line (Yellow Solid) */}
                <line x1="700" y1="240" x2="540" y2="305" stroke="#f59e0b" strokeWidth="2" />

                {/* Email Domain line (Purple Dashed) */}
                <line x1="680" y1="360" x2="540" y2="330" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5 5" />

                {/* Phone Number line (Teal Dashed) */}
                <line x1="640" y1="480" x2="530" y2="345" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5 5" />

                {/* Shipping Address line (Pink Solid) */}
                <line x1="500" y1="500" x2="500" y2="360" stroke="#ec4899" strokeWidth="2" />

                {/* Promo Code line (Bronze Solid) */}
                <line x1="370" y1="510" x2="475" y2="350" stroke="#b45309" strokeWidth="2" />
              </svg>

              {/* CENTER ABUSE RING NODE */}
              <div className="node-center-ring">
                <div className="center-icon-wrap">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                </div>
                <span className="center-title">Abuse Ring</span>
                <b className="center-id">#{ring.id}</b>

                {/* Anchor connection dots around circle */}
                <i className="dot-anchor dot-left" />
                <i className="dot-anchor dot-top" />
                <i className="dot-anchor dot-right-top" />
                <i className="dot-anchor dot-right-mid" />
                <i className="dot-anchor dot-right-low" />
                <i className="dot-anchor dot-bottom-right" />
                <i className="dot-anchor dot-bottom" />
                <i className="dot-anchor dot-bottom-left" />
              </div>

              {/* LEFT COLUMN: ACCOUNTS */}
              <div className="accounts-column">
                {accountsData.slice(0, 5).map((acc, idx) => (
                  <div key={acc.id} className="account-card-node" style={{ top: `${idx * 90 + 50}px` }}>
                    <div className="account-avatar">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div className="account-info">
                      <b className="account-title">Account {acc.num} ({acc.id})</b>
                      <span className="account-role">{acc.role}</span>
                      <small className="account-time">{acc.time}</small>
                    </div>
                    <div className="account-device-icon">
                      <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* PERIMETER EVIDENCE SIGNAL NODES */}
              {/* 1. Device Node (Top) */}
              <div className="signal-node-item node-device" style={{ top: "35px", left: "50%", transform: "translateX(-50%)" }}>
                <div className="signal-avatar green">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div className="signal-card-box">
                  <span className="signal-kind">Device</span>
                  <b className="signal-value">DVC-7821</b>
                  <small className="signal-count text-emerald-600">({ring.accountIds.length} Accounts)</small>
                </div>
              </div>

              {/* 2. IP Address Node (Top Right) */}
              <div className="signal-node-item node-ip" style={{ top: "60px", left: "680px" }}>
                <div className="signal-avatar blue">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div className="signal-card-box">
                  <span className="signal-kind">IP Address</span>
                  <b className="signal-value">117.201.***.24</b>
                  <small className="signal-count text-blue-600">({ring.accountIds.length} Accounts)</small>
                </div>
              </div>

              {/* 3. Payment Method Node (Right) */}
              <div className="signal-node-item node-payment" style={{ top: "185px", left: "740px" }}>
                <div className="signal-avatar amber">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div className="signal-card-box">
                  <span className="signal-kind">Payment Method</span>
                  <b className="signal-value">VISA •••• 4421</b>
                  <small className="signal-count text-amber-600">({ring.accountIds.length} Accounts)</small>
                </div>
              </div>

              {/* 4. Email Domain Node (Lower Right) */}
              <div className="signal-node-item node-email" style={{ top: "305px", left: "720px" }}>
                <div className="signal-avatar purple">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="signal-card-box">
                  <span className="signal-kind">Email Domain</span>
                  <b className="signal-value">@gmail.com</b>
                  <small className="signal-count text-purple-600">({ring.accountIds.length} Accounts)</small>
                </div>
              </div>

              {/* 5. Phone Number Node (Bottom Right) */}
              <div className="signal-node-item node-phone" style={{ top: "430px", left: "670px" }}>
                <div className="signal-avatar teal">
                  <svg className="w-4 h-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </div>
                <div className="signal-card-box">
                  <span className="signal-kind">Phone Number</span>
                  <b className="signal-value">+91 98******21</b>
                  <small className="signal-count text-cyan-600">({ring.accountIds.length} Accounts)</small>
                </div>
              </div>

              {/* 6. Shipping Address Node (Bottom) */}
              <div className="signal-node-item node-address" style={{ top: "460px", left: "440px" }}>
                <div className="signal-avatar pink">
                  <svg className="w-4 h-4 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div className="signal-card-box">
                  <span className="signal-kind">Shipping Address</span>
                  <b className="signal-value">Bangalore, KA</b>
                  <small className="signal-count text-pink-600">({ring.accountIds.length} Accounts)</small>
                </div>
              </div>

              {/* 7. Promo Code Node (Bottom Left) */}
              <div className="signal-node-item node-promo" style={{ top: "470px", left: "280px" }}>
                <div className="signal-avatar bronze">
                  <svg className="w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </div>
                <div className="signal-card-box">
                  <span className="signal-kind">Promo Code</span>
                  <b className="signal-value">{ring.couponCode}</b>
                  <small className="signal-count text-amber-800">({ring.accountIds.length} Accounts)</small>
                </div>
              </div>
            </div>

            {/* Bottom Legend Bar */}
            <div className="graph-bottom-legend">
              <div className="legend-connection-types">
                <span className="legend-line solid-red">Strong Connection</span>
                <span className="legend-line dashed-blue">Weak Connection</span>
              </div>
              <div className="legend-badges-list">
                <span><i className="badge-dot red" /> Account</span>
                <span><i className="badge-dot green" /> Device</span>
                <span><i className="badge-dot blue" /> IP Address</span>
                <span><i className="badge-dot yellow" /> Payment Method</span>
                <span><i className="badge-dot purple" /> Email</span>
                <span><i className="badge-dot pink" /> Address</span>
                <span><i className="badge-dot bronze" /> Promo Code</span>
                <span><i className="badge-dot teal" /> Phone</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. ACCOUNTS DETAILED TABLE */}
        {activeTab === "accounts" && (
          <div className="case-content-card">
            <div className="card-header-bar">
              <div>
                <h3>Linked Customer Profiles ({accountsData.length})</h3>
                <p>All accounts sharing identity fingerprints in this cluster.</p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="accounts-detail-table">
                <thead>
                  <tr>
                    <th>Account ID</th>
                    <th>Registration Time</th>
                    <th>Device Signature</th>
                    <th>IP Address</th>
                    <th>Payment Token</th>
                    <th>Delivery Address</th>
                    <th>Discount Claimed</th>
                  </tr>
                </thead>
                <tbody>
                  {accountsData.map((acc) => (
                    <tr key={acc.id}>
                      <td>
                        <span className="acc-id-badge">{acc.id}</span>
                      </td>
                      <td>{acc.time}</td>
                      <td>
                        <code>{acc.device}</code>
                      </td>
                      <td>
                        <code>{acc.ip}</code>
                      </td>
                      <td>
                        <code>{acc.payment}</code>
                      </td>
                      <td>{acc.address}</td>
                      <td>
                        <b>₹{acc.discount.toLocaleString("en-IN")}</b> ({ring.couponCode})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. EVIDENCE PROOFS LEDGER */}
        {activeTab === "proof" && (
          <div className="case-content-card">
            <div className="card-header-bar">
              <div>
                <h3>Deterministic Evidence Ledger</h3>
                <p>Exact technical signals linking these accounts together.</p>
              </div>
            </div>

            <div className="evidence-proofs-grid">
              {ring.evidence.map((ev, idx) => (
                <div key={`${ev.kind}-${idx}`} className="proof-box">
                  <div className="proof-top">
                    <span className={`proof-tag ${ev.strength}`}>{ev.strength.toUpperCase()} LINK</span>
                    <span className="proof-score">+{ev.contribution} Risk Pts</span>
                  </div>
                  <h4 className="proof-title">{ev.label}</h4>
                  <p className="proof-detail">{ev.detail}</p>
                  <div className="proof-accounts">
                    <span>Applies to {ev.accountIds.length} accounts:</span>
                    <div className="proof-pills">
                      {ev.accountIds.map((accId) => (
                        <span key={accId} className="proof-pill">{accId}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

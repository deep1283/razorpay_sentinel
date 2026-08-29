"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { accounts, redemptions } from "@/lib/demo-data";
import type { Account, Evidence, RingCase } from "@/lib/domain";

type Tab = "graph" | "accounts" | "evidence";

const styles: Record<Evidence["kind"], { color: string; label: string }> = {
  device: { color: "#21a574", label: "Device" },
  payment: { color: "#e69120", label: "Payment token" },
  address: { color: "#dc668f", label: "Delivery address" },
  ip: { color: "#5483e7", label: "Network" },
  coupon: { color: "#b56d1e", label: "Promo code" },
  timing: { color: "#8661d4", label: "Redemption timing" },
  referral: { color: "#3193a6", label: "Referral" },
};

function pointOnCircle(index: number, count: number, radius: number, startAngle = -Math.PI / 2) {
  const angle = startAngle + (index * (Math.PI * 2)) / Math.max(count, 1);
  return { x: 350 + Math.cos(angle) * radius, y: 350 + Math.sin(angle) * radius };
}

function formatDate(timestamp: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(timestamp));
}

function plainSignal(signal: Evidence, couponCode: string) {
  if (signal.kind === "device") return "The signups look like they used the same device.";
  if (signal.kind === "payment") return "The signups used the same payment method.";
  if (signal.kind === "address") return "The signups used the same delivery address.";
  if (signal.kind === "ip") return "The signups came from the same network. This can be normal for a home, office, hotel, or mobile network.";
  if (signal.kind === "timing") return `The signups used ${couponCode} within a short time of each other.`;
  return "The signups share another detail worth checking.";
}

export function CaseDetailView({ ring }: { ring: RingCase }) {
  const [activeTab, setActiveTab] = useState<Tab>("graph");
  const members = useMemo(() => ring.members ?? ring.accountIds.map((id) => accounts.find((account) => account.id === id)).filter((account): account is Account => Boolean(account)), [ring.accountIds, ring.members]);
  const signals = ring.evidence.filter((evidence) => evidence.accountIds.length > 1);
  const exposureByAccount = useMemo(() => new Map((ring.redemptions ?? redemptions).filter((item) => ring.accountIds.includes(item.accountId)).map((item) => [item.accountId, item])), [ring.accountIds, ring.redemptions]);

  return <main className="case-page">
    <header className="case-header"><Link href="/dashboard?guest=1">← Back to dashboard</Link><div><span>Customer experience</span><b>{ring.recommendedAction}</b></div></header>
    <div className="case-shell">
      <nav className="case-tabs" aria-label="Case views">
        {(["graph", "accounts", "evidence"] as Tab[]).map((tab) => <button key={tab} type="button" className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab === "graph" ? "Overview" : tab === "accounts" ? `Customers (${members.length})` : "What we noticed"}</button>)}
      </nav>

      {activeTab === "graph" && <section className="case-graph-card">
        <div className="case-risk-summary"><span>Risk score {ring.score}/100 · {ring.riskLevel} risk</span><h1>{ring.recommendedAction}</h1><p>{ring.actionDetail}</p></div>
        <ul className="case-proof-list">{signals.map((signal, index) => <li key={`${signal.kind}-${index}`}>{plainSignal(signal, ring.couponCode)}</li>)}</ul>
        <div className="circle-graph" role="img" aria-label={`Circular evidence map for case ${ring.id}, with ${members.length} accounts and ${signals.length} shared signals`}>
          <svg viewBox="0 0 700 700" aria-hidden="true">
            <circle cx="350" cy="350" r="260" className="circle-guide outer" />
            {members.map((member, index) => { const point = pointOnCircle(index, members.length, 260); return <line key={member.id} x1="350" y1="350" x2={point.x} y2={point.y} className="circle-member-line" />; })}
          </svg>
          {members.map((member, index) => { const point = pointOnCircle(index, members.length, 260); return <div className="circle-account" key={member.id} style={{ left: `${(point.x / 700) * 100}%`, top: `${(point.y / 700) * 100}%` }}><span>Customer</span><b>{member.id}</b></div>; })}
          <div className="circle-center"><span>OFFER</span><b>{ring.couponCode}</b><small>{members.length} customers</small></div>
        </div>
      </section>}

      {activeTab === "accounts" && <section className="case-data-card"><div className="case-data-heading"><h2>Customers in this check</h2><p>These customers used the same offer. They may still be separate people.</p></div><div className="case-table-scroll"><table><thead><tr><th>Customer</th><th>Joined</th><th>Offer used</th></tr></thead><tbody>{members.map((member) => { const redemption = exposureByAccount.get(member.id); return <tr key={member.id}><td><b>{member.id}</b></td><td>{formatDate(member.createdAt)}</td><td>{redemption ? <><b>{redemption.code}</b><small> ₹{redemption.discountInr.toLocaleString("en-IN")}</small></> : "—"}</td></tr>; })}</tbody></table></div></section>}

      {activeTab === "evidence" && <section className="case-evidence-grid">{signals.map((signal, index) => { const style = styles[signal.kind]; return <article key={`${signal.kind}-${index}`}><div><span style={{ backgroundColor: style.color }} />Signal</div><h2>{plainSignal(signal, ring.couponCode)}</h2><p>This appears across all {signal.accountIds.length} customers in this check.</p></article>; })}</section>}

      <aside className="case-caution"><b>Important:</b> Signals help estimate risk. They do not prove who a person is or that anyone did anything wrong.</aside>
    </div>
  </main>;
}

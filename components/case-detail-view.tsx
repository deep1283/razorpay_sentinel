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
  email: { color: "#c65fd6", label: "Email identity" },
  phone: { color: "#328a95", label: "Phone identity" },
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
  if (signal.kind === "device") return "These customers used the same browser.";
  if (signal.kind === "payment") return "These customers used the same way to pay.";
  if (signal.kind === "address") return "These customers used the same delivery address.";
  if (signal.kind === "ip") return "These customers used the same internet connection. This can happen at a home, office, hotel, or on mobile data.";
  if (signal.kind === "email") return "These customers used the same email address.";
  if (signal.kind === "phone") return "These customers used the same phone number.";
  if (signal.kind === "referral") return "These customers used the same referral code.";
  if (signal.kind === "timing") return `These customers used ${couponCode} close together.`;
  return "These customers share another detail worth checking.";
}

function describeConnection(accountIds: string[]) {
  if (accountIds.length === 2) return `${accountIds[0]} ↔ ${accountIds[1]}`;
  return accountIds.join(" ↔ ");
}

export function CaseDetailView({ ring, isDemo = false }: { ring: RingCase; isDemo?: boolean }) {
  const [activeTab, setActiveTab] = useState<Tab>("graph");
  const members = useMemo(() => ring.members ?? ring.accountIds.map((id) => accounts.find((account) => account.id === id)).filter((account): account is Account => Boolean(account)), [ring.accountIds, ring.members]);
  // Keep each graph link for transparency, but group their plain-English
  // explanation by kind so the same sentence is not repeated.
  const signalGroups = useMemo(() => {
    const byKind = new Map<Evidence["kind"], Evidence[]>();
    for (const evidence of ring.evidence) {
      if (evidence.accountIds.length < 2) continue;
      byKind.set(evidence.kind, [...(byKind.get(evidence.kind) ?? []), evidence]);
    }

    return [...byKind.values()].map((links) => ({
      signal: links[0],
      links,
      accountIds: [...new Set(links.flatMap((link) => link.accountIds))],
    }));
  }, [ring.evidence]);
  const memberPoints = useMemo(() => new Map(members.map((member, index) => [member.id, pointOnCircle(index, members.length, 260)])), [members]);
  const graphLinks = useMemo(() => signalGroups.filter((group) => group.signal.kind !== "timing").flatMap((group) => group.links.flatMap((link, linkIndex) => link.accountIds.slice(1).map((accountId) => ({ key: `${group.signal.kind}-${linkIndex}-${accountId}`, kind: group.signal.kind, from: link.accountIds[0], to: accountId })))), [signalGroups]);
  const exposureByAccount = useMemo(() => new Map((ring.redemptions ?? redemptions).filter((item) => ring.accountIds.includes(item.accountId)).map((item) => [item.accountId, item])), [ring.accountIds, ring.redemptions]);

  return <main className="case-page">
    <header className="case-header"><Link href={`/dashboard?guest=1${isDemo ? "&demo=1" : ""}`}>← Back to dashboard</Link><div><span>Risk score</span><b>{ring.score}%</b></div></header>
    <div className="case-shell">
      <nav className="case-tabs" aria-label="Case views">
        {(["graph", "accounts", "evidence"] as Tab[]).map((tab) => <button key={tab} type="button" className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab === "graph" ? "Overview" : tab === "accounts" ? `Customers (${members.length})` : "What we noticed"}</button>)}
      </nav>

      {activeTab === "graph" && <section className="case-graph-card case-split-view">
        <div className="case-reasons-panel">
          <span className="case-reasons-label">Detected patterns</span>
          <p className="case-reasons-intro">All {members.length} customers are linked through separate shared details. Follow the coloured lines to see each connection.</p>
          <ul className="case-reasons-bullets">
            {signalGroups.map((group) => <li key={group.signal.kind}>{plainSignal(group.signal, ring.couponCode)}</li>)}
          </ul>
        </div>
        <div className="case-ring-panel">
          <div className="circle-graph" role="img" aria-label={`Connection map for case ${ring.id}, with ${members.length} accounts and ${graphLinks.length} direct shared-detail links`}>
            <svg viewBox="0 0 700 700" aria-hidden="true">
              <circle cx="350" cy="350" r="260" className="circle-guide outer" />
              {graphLinks.map((link) => { const from = memberPoints.get(link.from); const to = memberPoints.get(link.to); if (!from || !to) return null; return <line key={link.key} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="circle-evidence-line" style={{ stroke: styles[link.kind].color }} />; })}
            </svg>
            {members.map((member) => { const point = memberPoints.get(member.id)!; return <div className="circle-account" key={member.id} style={{ left: `${(point.x / 700) * 100}%`, top: `${(point.y / 700) * 100}%` }}><span>Customer</span><b>{member.id}</b></div>; })}
            <div className="circle-center"><span>OFFER</span><b>{ring.couponCode}</b><small>{members.length} customers</small></div>
          </div>
          <div className="circle-legend" aria-label="Connection line colours">{signalGroups.filter((group) => group.signal.kind !== "timing").map((group) => <span key={group.signal.kind}><i style={{ backgroundColor: styles[group.signal.kind].color }} />{styles[group.signal.kind].label}</span>)}</div>
        </div>
      </section>}

      {activeTab === "accounts" && <section className="case-data-card"><div className="case-data-heading"><h2>Customers in this check</h2><p>These customers used the same offer. They may still be separate people.</p></div><div className="case-table-scroll"><table><thead><tr><th>Customer</th><th>Joined</th><th>Offer used</th></tr></thead><tbody>{members.map((member) => { const redemption = exposureByAccount.get(member.id); return <tr key={member.id}><td><span className="case-customer-id">{member.id}</span></td><td>{formatDate(member.createdAt)}</td><td>{redemption ? <div className="case-offer-cell"><span className="case-coupon-badge">{redemption.code}</span><span className="case-coupon-amount">₹{redemption.discountInr.toLocaleString("en-IN")}</span></div> : "—"}</td></tr>; })}</tbody></table></div></section>}

      {activeTab === "evidence" && <section className="case-evidence-grid">{signalGroups.map((group) => { const style = styles[group.signal.kind]; return <article key={group.signal.kind}><div><span style={{ backgroundColor: style.color }} />Signal</div><h2>{plainSignal(group.signal, ring.couponCode)}</h2><p>{group.links.length === 1 ? `This signal connects ${group.accountIds.length} customers in this check.` : `This type of signal appears in ${group.links.length} separate links, connecting ${group.accountIds.length} customers.`}</p><div className="case-evidence-links"><b>Connections</b><p>{group.links.map((link) => describeConnection(link.accountIds)).join(" · ")}</p></div></article>; })}</section>}
    </div>
  </main>;
}

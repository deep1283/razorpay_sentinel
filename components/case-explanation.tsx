"use client";

import { useState } from "react";

type Explanation = { summary: string; evidence: string[]; recommendation: string; limitations: string[]; source: "openai" | "deterministic" };

export function CaseExplanation({ ringId, initial }: { ringId: string; initial: Explanation }) {
  const [explanation, setExplanation] = useState(initial);
  const [loading, setLoading] = useState(false);
  async function refresh() {
    setLoading(true);
    try { const response = await fetch(`/api/cases/${ringId}/explanation`, { method: "POST" }); setExplanation(await response.json()); }
    finally { setLoading(false); }
  }
  return <section className="explanation-card"><div className="detail-card-heading"><div><span>INVESTIGATOR SUMMARY</span><h2>Why this needs review</h2></div><button onClick={refresh} disabled={loading}>{loading ? "Refreshing…" : "Refresh explanation"}</button></div><p>{explanation.summary}</p><div className="explanation-pills">{explanation.evidence.map((item) => <span key={item}>{item}</span>)}</div><div className="recommendation"><b>Recommended outcome</b><strong>{explanation.recommendation}</strong></div><div className="limitations"><b>Important limitations</b><ul>{explanation.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div><small>Explanation source: {explanation.source === "openai" ? "GPT, constrained to supplied evidence" : "deterministic fallback"}</small></section>;
}

"use client";

import { useState } from "react";

type Explanation = { summary: string; evidence: string[]; recommendation: string; limitations: string[]; source: "openai" | "deterministic" };

export function CaseExplanation({ ringId, initial }: { ringId: string; initial: Explanation }) {
  const [explanation, setExplanation] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/cases/${ringId}/explanation`, { method: "POST" });
      const payload = await response.json() as Explanation | { error?: string };
      if (!response.ok || !("summary" in payload && "evidence" in payload && "limitations" in payload)) throw new Error("error" in payload ? payload.error : "The explanation could not be refreshed.");
      setExplanation(payload);
    } catch (error) { setError(error instanceof Error ? error.message : "The explanation could not be refreshed."); }
    finally { setLoading(false); }
  }
  return <section className="explanation-card"><div className="detail-card-heading"><div><span>INVESTIGATOR SUMMARY</span><h2>Why this needs review</h2></div><button onClick={refresh} disabled={loading}>{loading ? "Refreshing…" : "Refresh explanation"}</button></div>{error && <p className="explanation-error" role="alert">{error}</p>}<p>{explanation.summary}</p><div className="explanation-pills">{explanation.evidence.map((item) => <span key={item}>{item}</span>)}</div><div className="recommendation"><b>Recommended outcome</b><strong>{explanation.recommendation}</strong></div><div className="limitations"><b>Important limitations</b><ul>{explanation.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div><small>Explanation source: {explanation.source === "openai" ? "GPT, constrained to supplied evidence" : "deterministic fallback"}</small></section>;
}

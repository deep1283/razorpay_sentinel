"use client";

import { useState } from "react";

type Explanation = { summary: string; evidence: string[]; recommendation: string; limitations: string[]; source: "openai" | "deterministic" };

export function CaseExplanation({ ringId, initial, isDemo = false }: { ringId: string; initial: Explanation; isDemo?: boolean }) {
  const [explanation, setExplanation] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/cases/${ringId}/explanation${isDemo ? "?demo=1" : ""}`, { method: "POST" });
      const payload = await response.json() as Explanation | { error?: string };
      if (!response.ok || !("summary" in payload && "evidence" in payload && "limitations" in payload)) throw new Error("error" in payload ? payload.error : "The explanation could not be refreshed.");
      setExplanation(payload);
    } catch (error) { setError(error instanceof Error ? error.message : "The explanation could not be refreshed."); }
    finally { setLoading(false); }
  }
  return <section className="explanation-card"><div className="detail-card-heading"><div><span>AI-ASSISTED SUMMARY</span><h2>A simple explanation for the reviewer</h2></div><button type="button" onClick={refresh} disabled={loading}>{loading ? "Preparing…" : explanation.source === "openai" ? "Refresh summary" : "Explain with AI"}</button></div>{error && <p className="explanation-error" role="alert">{error}</p>}<p>{explanation.summary}</p><div className="explanation-pills">{explanation.evidence.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div><div className="recommendation"><b>Suggested next step</b><strong>{explanation.recommendation}</strong></div><div className="limitations"><b>Keep in mind</b><ul>{explanation.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div><small>{explanation.source === "openai" ? "Written by GPT using only the evidence shown above." : "Safe local summary. The detector works even when GPT is unavailable."}</small></section>;
}

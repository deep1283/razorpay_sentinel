import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getCaseById } from "@/lib/scoring";

const fallback = (ring: NonNullable<ReturnType<typeof getCaseById>>) => ({ summary: ring.explanation, evidence: ring.evidence.map((item) => item.label), recommendation: "Manual investigation only", limitations: ring.limitations, source: "deterministic" });

export async function POST(_: Request, { params }: { params: Promise<{ ringId: string }> }) {
  const { ringId } = await params;
  const ring = getCaseById(ringId);
  if (!ring) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json(fallback(ring));
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_EXPLANATION_MODEL ?? "gpt-5-mini",
      store: false,
      instructions: "You are an investigator-assistance writer for a defensive fintech risk product. Use only supplied evidence. Never call customers fraudulent or guilty. Never recommend blocking, cancellation, refund, capture, or punishment. Return concise JSON matching the schema.",
      input: JSON.stringify({ ringId: ring.id, score: ring.score, exposureInr: ring.exposureInr, evidence: ring.evidence, limitations: ring.limitations }),
      text: { format: { type: "json_schema", name: "investigation_explanation", strict: true, schema: { type: "object", additionalProperties: false, properties: { summary: { type: "string" }, evidence: { type: "array", items: { type: "string" } }, recommendation: { type: "string", enum: ["Manual investigation only"] }, limitations: { type: "array", items: { type: "string" } } }, required: ["summary", "evidence", "recommendation", "limitations"] } } },
    });
    return NextResponse.json({ ...JSON.parse(response.output_text), source: "openai" });
  } catch { return NextResponse.json(fallback(ring)); }
}

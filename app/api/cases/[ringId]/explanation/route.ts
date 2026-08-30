import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getCaseById, getDemoCaseById } from "@/lib/scoring";
import type { RingCase } from "@/lib/domain";

const fallback = (ring: RingCase) => ({ summary: ring.explanation, evidence: [...new Set(ring.evidence.map((item) => item.label))], recommendation: ring.actionDetail, limitations: ring.limitations, source: "deterministic" });

export async function POST(request: Request, { params }: { params: Promise<{ ringId: string }> }) {
  const { ringId } = await params;
  const isDemo = new URL(request.url).searchParams.get("demo") === "1";
  let ring: RingCase | undefined;
  try {
    ring = isDemo ? getDemoCaseById(ringId) : await getCaseById(ringId);
  } catch {
    return NextResponse.json({ error: "Case data is temporarily unavailable. Please try again." }, { status: 503 });
  }
  if (!ring) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json(fallback(ring));
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 8_000, maxRetries: 1 });
    const response = await client.responses.create({
      model: process.env.OPENAI_EXPLANATION_MODEL ?? "gpt-5-mini",
      store: false,
      instructions: "You write short case summaries for a defensive promo-offer abuse product. Use only the supplied evidence. Clearly state the connected pattern Sentinel found and why it is strong. Do not hedge with phrases such as 'may be', 'risk signal', or 'not proof'. Never call a customer fraudulent or guilty. Give exactly the supplied recommended action. Include only the supplied short caution. Remove duplicate evidence labels. Return concise JSON matching the schema.",
      input: JSON.stringify({ ringId: ring.id, score: ring.score, recommendedAction: ring.actionDetail, exposureInr: ring.exposureInr, evidence: [...new Set(ring.evidence.map((item) => item.label))], limitations: ring.limitations }),
      text: { format: { type: "json_schema", name: "investigation_explanation", strict: true, schema: { type: "object", additionalProperties: false, properties: { summary: { type: "string" }, evidence: { type: "array", items: { type: "string" } }, recommendation: { type: "string", enum: [ring.actionDetail] }, limitations: { type: "array", items: { type: "string" }, maxItems: 1 } }, required: ["summary", "evidence", "recommendation", "limitations"] } } },
    });
    return NextResponse.json({ ...JSON.parse(response.output_text), source: "openai" });
  } catch (error) {
    console.error("explanation.model_fallback", { message: error instanceof Error ? error.message : "Unknown model error" });
    return NextResponse.json(fallback(ring));
  }
}

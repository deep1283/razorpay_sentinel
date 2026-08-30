import { NextResponse } from "next/server";
import { getCaseById } from "@/lib/scoring";

export async function GET(_: Request, { params }: { params: Promise<{ ringId: string }> }) {
  try {
    const { ringId } = await params;
    const ring = await getCaseById(ringId);
    return ring ? NextResponse.json(ring) : NextResponse.json({ error: "Case not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Case data is temporarily unavailable. Please try again." }, { status: 503 });
  }
}

import { NextResponse } from "next/server";
import { getCaseById } from "@/lib/scoring";

export function GET(_: Request, { params }: { params: Promise<{ ringId: string }> }) {
  return params.then(({ ringId }) => {
    const ring = getCaseById(ringId);
    return ring ? NextResponse.json(ring) : NextResponse.json({ error: "Case not found" }, { status: 404 });
  });
}

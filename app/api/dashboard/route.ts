import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/scoring";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return NextResponse.json(await getDashboardSnapshot());
  } catch {
    return NextResponse.json({ error: "The dashboard is temporarily unavailable. Please try again." }, { status: 503 });
  }
}

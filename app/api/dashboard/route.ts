import { NextResponse } from "next/server";
import { getDashboardSnapshot, getDemoDashboardSnapshot } from "@/lib/scoring";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    return NextResponse.json(new URL(request.url).searchParams.get("demo") === "1" ? getDemoDashboardSnapshot() : await getDashboardSnapshot());
  } catch {
    return NextResponse.json({ error: "The dashboard is temporarily unavailable. Please try again." }, { status: 503 });
  }
}

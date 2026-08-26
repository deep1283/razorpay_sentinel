import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/scoring";

export const dynamic = "force-dynamic";
export function GET() { return NextResponse.json(getDashboardSnapshot()); }

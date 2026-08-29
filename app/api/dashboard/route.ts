import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/scoring";

export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await getDashboardSnapshot()); }

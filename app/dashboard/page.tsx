import { DashboardClient } from "@/components/dashboard-client";
import { getDashboardSnapshot, getDemoDashboardSnapshot } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  try {
    const { demo } = await searchParams;
    const isDemo = demo === "1";
    return <DashboardClient initial={isDemo ? getDemoDashboardSnapshot() : await getDashboardSnapshot()} isDemo={isDemo} />;
  } catch {
    return <DashboardClient initial={null} initialError="The dashboard could not load. Please try again shortly." />;
  }
}

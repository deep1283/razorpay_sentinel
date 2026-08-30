import { DashboardClient } from "@/components/dashboard-client";
import { getDashboardSnapshot, getDemoDashboardSnapshot } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo } = await searchParams;
  const isDemo = demo === "1";
  let initial = null;
  let initialError: string | undefined;
  try {
    initial = isDemo ? getDemoDashboardSnapshot() : await getDashboardSnapshot();
  } catch {
    initialError = "The dashboard could not load. Please try again shortly.";
  }
  return <DashboardClient initial={initial} initialError={initialError} isDemo={isDemo} />;
}

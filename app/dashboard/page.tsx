import { DashboardClient } from "@/components/dashboard-client";
import { getDashboardSnapshot } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    return <DashboardClient initial={await getDashboardSnapshot()} />;
  } catch {
    return <DashboardClient initial={null} initialError="The dashboard could not load. Please try again shortly." />;
  }
}

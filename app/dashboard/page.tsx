import { DashboardClient } from "@/components/dashboard-client";
import { getDashboardSnapshot } from "@/lib/scoring";
export default async function DashboardPage() { return <DashboardClient initial={await getDashboardSnapshot()} />; }

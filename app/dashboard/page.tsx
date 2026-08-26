import { DashboardClient } from "@/components/dashboard-client";
import { getDashboardSnapshot } from "@/lib/scoring";
export default function DashboardPage() { return <DashboardClient initial={getDashboardSnapshot()} />; }

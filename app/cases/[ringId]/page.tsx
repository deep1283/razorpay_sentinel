import { notFound } from "next/navigation";
import { CaseDetailView } from "@/components/case-detail-view";
import { getCaseById, getDemoCaseById } from "@/lib/scoring";

export default async function CaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ ringId: string }>;
  searchParams: Promise<{ demo?: string }>;
}) {
  const { ringId } = await params;
  const { demo } = await searchParams;
  const isDemo = demo === "1";
  const ring = isDemo ? getDemoCaseById(ringId) : await getCaseById(ringId);

  if (!ring) {
    notFound();
  }

  return <CaseDetailView ring={ring} isDemo={isDemo} />;
}

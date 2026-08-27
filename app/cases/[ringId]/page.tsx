import { notFound } from "next/navigation";
import { CaseDetailView } from "@/components/case-detail-view";
import { getCaseById } from "@/lib/scoring";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ ringId: string }>;
}) {
  const { ringId } = await params;
  const ring = getCaseById(ringId);

  if (!ring) {
    notFound();
  }

  return <CaseDetailView ring={ring} />;
}

export type EvidenceKind = "device" | "payment" | "address" | "ip" | "coupon" | "timing" | "referral";
export type CaseStatus = "investigate" | "queued" | "monitoring" | "benign" | "confirmed";

export type Account = { id: string; createdAt: string; deviceHash: string; paymentTokenHash: string; addressHash: string; ipHash: string; referralCode?: string };
export type CouponRedemption = { accountId: string; code: string; discountInr: number; redeemedAt: string };
export type Evidence = { kind: EvidenceKind; label: string; detail: string; strength: "strong" | "medium" | "weak"; contribution: number; accountIds: string[] };
export type RingCase = { id: string; accountIds: string[]; couponCode: string; exposureInr: number; score: number; confidence: number; status: CaseStatus; evidence: Evidence[]; createdAt: string; explanation: string; limitations: string[] };
export type DashboardSnapshot = { generatedAt: string; cases: RingCase[]; metrics: { precision: number; recall: number; f1: number; falsePositiveReviewRate: number; heldOutRings: number } };

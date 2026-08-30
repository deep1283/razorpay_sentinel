export type EvidenceKind = "device" | "payment" | "address" | "ip" | "email" | "phone" | "coupon" | "timing" | "referral";
export type CaseStatus = "investigate" | "queued" | "monitoring" | "benign" | "confirmed";
export type RiskLevel = "low" | "medium" | "high";
export type RecommendedAction = "Keep offer available" | "Keep offer available · optional verification" | "Keep offer available · review";

export type Account = { id: string; createdAt: string; deviceHash: string; paymentTokenHash: string; addressHash: string; ipHash: string; emailHash?: string; phoneHash?: string; referralCode?: string };
export type CouponRedemption = { accountId: string; code: string; discountInr: number; redeemedAt: string };
export type Evidence = { kind: EvidenceKind; label: string; detail: string; strength: "strong" | "medium" | "weak"; contribution: number; accountIds: string[] };
export type RingCase = { id: string; accountIds: string[]; couponCode: string; exposureInr: number; score: number; confidence: number; riskLevel: RiskLevel; recommendedAction: RecommendedAction; actionDetail: string; status: CaseStatus; evidence: Evidence[]; createdAt: string; explanation: string; limitations: string[]; members?: Account[]; redemptions?: CouponRedemption[] };
export type DashboardSnapshot = { generatedAt: string; source: "demo" | "live"; cases: RingCase[]; metrics: { precision: number; recall: number; f1: number; falsePositiveReviewRate: number; heldOutRings: number; truePositives: number; falsePositives: number; falseNegatives: number; falsePositiveReviewCostInr: number } };

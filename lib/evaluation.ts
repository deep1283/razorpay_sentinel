import type { Account, CouponRedemption, DashboardSnapshot } from "./domain";
import { REVIEW_THRESHOLD, scoreRings } from "./scoring";

type Scenario = { id: string; isAbuse: boolean; accounts: Account[]; redemptions: CouponRedemption[] };

function account(id: string, minute: number, overrides: Partial<Account> = {}): Account {
  return { id, createdAt: `2026-08-01T10:${String(minute).padStart(2, "0")}:00Z`, deviceHash: `browser-${id}`, paymentTokenHash: `payment-${id}`, addressHash: `address-${id}`, ipHash: `ip-${id}`, ...overrides };
}

function redemptionsFor(accounts: Account[]): CouponRedemption[] {
  return accounts.map((item) => ({ accountId: item.id, code: "NEW500", discountInr: 500, redeemedAt: item.createdAt }));
}

function linkedAbuse(id: string, detectable = true): Scenario {
  const accounts = [
    account(`${id}-A1`, 1, { deviceHash: detectable ? `${id}-browser` : `${id}-browser-1`, addressHash: `${id}-address` }),
    account(`${id}-A2`, 7, { deviceHash: detectable ? `${id}-browser` : `${id}-browser-2`, paymentTokenHash: detectable ? `${id}-payment` : `${id}-payment-2` }),
    account(`${id}-A3`, 12, { paymentTokenHash: detectable ? `${id}-payment` : `${id}-payment-3`, addressHash: `${id}-address`, referralCode: `${id}-referral` }),
  ];
  return { id, isAbuse: true, accounts, redemptions: redemptionsFor(accounts) };
}

function benignScenario(id: string, falsePositive = false): Scenario {
  const accounts = [
    account(`${id}-A1`, 1, falsePositive ? { paymentTokenHash: `${id}-family-card`, emailHash: `${id}-shared-email` } : { ipHash: `${id}-shared-wifi` }),
    account(`${id}-A2`, 7, falsePositive ? { paymentTokenHash: `${id}-family-card`, emailHash: `${id}-shared-email` } : { ipHash: `${id}-shared-wifi` }),
    account(`${id}-A3`, 12, falsePositive ? { paymentTokenHash: `${id}-family-card`, emailHash: `${id}-shared-email` } : { ipHash: `${id}-shared-wifi` }),
  ];
  return { id, isAbuse: false, accounts, redemptions: redemptionsFor(accounts) };
}

// The development scenarios are separate from the held-out scenarios. Rule weights and
// REVIEW_THRESHOLD are fixed before evaluateHeldOut() is called.
export const developmentSet = Array.from({ length: 24 }, (_, index) => index % 3 === 0 ? benignScenario(`DEV-${index}`) : linkedAbuse(`DEV-${index}`));
export const heldOutSet = [
  ...Array.from({ length: 8 }, (_, index) => linkedAbuse(`TEST-A-${index}`)),
  linkedAbuse("TEST-A-8", false),
  linkedAbuse("TEST-A-9", false),
  benignScenario("TEST-N-0", true),
  ...Array.from({ length: 9 }, (_, index) => benignScenario(`TEST-N-${index + 1}`)),
];

export function evaluateHeldOut(): DashboardSnapshot["metrics"] {
  const allAccounts = heldOutSet.flatMap((scenario) => scenario.accounts);
  const allRedemptions = heldOutSet.flatMap((scenario) => scenario.redemptions);
  const predicted = scoreRings(allAccounts, allRedemptions).filter((ring) => ring.score >= REVIEW_THRESHOLD);
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  for (const scenario of heldOutSet) {
    const hasPrediction = predicted.some((ring) => ring.accountIds.some((id) => id.startsWith(`${scenario.id}-`)));
    if (scenario.isAbuse && hasPrediction) truePositives += 1;
    if (!scenario.isAbuse && hasPrediction) falsePositives += 1;
    if (scenario.isAbuse && !hasPrediction) falseNegatives += 1;
  }
  const precision = truePositives / Math.max(truePositives + falsePositives, 1);
  const recall = truePositives / Math.max(truePositives + falseNegatives, 1);
  return {
    precision: Number((precision * 100).toFixed(1)),
    recall: Number((recall * 100).toFixed(1)),
    f1: Number((2 * precision * recall / Math.max(precision + recall, Number.EPSILON) * 100).toFixed(1)),
    falsePositiveReviewRate: Number((falsePositives / Math.max(truePositives + falsePositives, 1) * 100).toFixed(1)),
    heldOutRings: heldOutSet.length,
    truePositives,
    falsePositives,
    falseNegatives,
    falsePositiveReviewCostInr: falsePositives * 150,
  };
}

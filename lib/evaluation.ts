import type { Account, CouponRedemption, DashboardSnapshot } from "./domain";
import { FALSE_POSITIVE_REVIEW_COST_INR, REVIEW_THRESHOLD } from "./scoring-config";
import { scoreRings } from "./scoring";

export type EvaluationScenario = {
  id: string;
  isAbuse: boolean;
  accounts: Account[];
  redemptions: CouponRedemption[];
};

type EvaluationResult = DashboardSnapshot["metrics"];

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function timestamp(minute: number) {
  return new Date(Date.UTC(2026, 6, 1, 10, minute)).toISOString();
}

function makeAccounts(id: string, count: number, fast: boolean): Account[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${id}-A${index + 1}`,
    createdAt: timestamp(index * (fast ? 4 : 22)),
    deviceHash: `${id}-browser-${index}`,
    paymentTokenHash: `${id}-payment-${index}`,
    addressHash: `${id}-address-${index}`,
    ipHash: `${id}-network-${index}`,
    emailHash: `${id}-email-${index}`,
    phoneHash: `${id}-phone-${index}`,
    referralCode: `${id}-referral-${index}`,
  }));
}

function share(accounts: Account[], key: keyof Account, value: string, indexes = accounts.map((_, index) => index)) {
  for (const index of indexes) accounts[index][key] = value;
}

function redemptionsFor(accounts: Account[]): CouponRedemption[] {
  return accounts.map((account) => ({ accountId: account.id, code: "NEW500", discountInr: 500, redeemedAt: account.createdAt }));
}

function abuseScenario(id: string, archetype: number, count: number, fast: boolean): EvaluationScenario {
  const accounts = makeAccounts(id, count, fast);
  const all = accounts.map((_, index) => index);
  const firstHalf = all.filter((index) => index <= Math.ceil(count / 2));
  const secondHalf = all.filter((index) => index >= Math.floor(count / 2));

  switch (archetype) {
    case 0:
      share(accounts, "deviceHash", `${id}-shared-browser`);
      share(accounts, "paymentTokenHash", `${id}-shared-payment`);
      share(accounts, "addressHash", `${id}-shared-address`);
      break;
    case 1:
      share(accounts, "paymentTokenHash", `${id}-shared-payment`);
      share(accounts, "emailHash", `${id}-shared-email`);
      share(accounts, "ipHash", `${id}-shared-network`);
      break;
    case 2:
      share(accounts, "deviceHash", `${id}-shared-browser`);
      share(accounts, "phoneHash", `${id}-shared-phone`);
      share(accounts, "referralCode", `${id}-shared-referral`);
      break;
    case 3:
      share(accounts, "emailHash", `${id}-shared-email`);
      share(accounts, "phoneHash", `${id}-shared-phone`);
      share(accounts, "addressHash", `${id}-shared-address`);
      break;
    case 4:
      share(accounts, "deviceHash", `${id}-shared-browser`, firstHalf);
      share(accounts, "paymentTokenHash", `${id}-shared-payment`, secondHalf);
      share(accounts, "addressHash", `${id}-shared-address`, [firstHalf.at(-1)!, secondHalf[0]]);
      share(accounts, "referralCode", `${id}-shared-referral`);
      break;
    case 5:
      share(accounts, "paymentTokenHash", `${id}-shared-payment`);
      share(accounts, "addressHash", `${id}-shared-address`);
      share(accounts, "referralCode", `${id}-shared-referral`);
      break;
    case 6:
      share(accounts, "deviceHash", `${id}-shared-browser`);
      share(accounts, "addressHash", `${id}-shared-address`);
      share(accounts, "ipHash", `${id}-shared-network`);
      break;
    default:
      share(accounts, "emailHash", `${id}-shared-email`);
      share(accounts, "ipHash", `${id}-shared-network`);
      share(accounts, "referralCode", `${id}-shared-referral`);
  }
  return { id, isAbuse: true, accounts, redemptions: redemptionsFor(accounts) };
}

function benignScenario(id: string, archetype: number, count: number, fast: boolean): EvaluationScenario {
  const accounts = makeAccounts(id, count, fast);
  switch (archetype) {
    case 0: // Shared household or office network.
      share(accounts, "ipHash", `${id}-shared-network`);
      share(accounts, "addressHash", `${id}-shared-address`);
      break;
    case 1: // Referral campaign delivered to one building.
      share(accounts, "addressHash", `${id}-shared-address`);
      share(accounts, "referralCode", `${id}-shared-referral`);
      break;
    case 2: // Family members sharing a card and address.
      share(accounts, "paymentTokenHash", `${id}-family-payment`);
      share(accounts, "addressHash", `${id}-family-address`);
      break;
    case 3: // Public kiosk or shared browser on one network.
      share(accounts, "deviceHash", `${id}-shared-browser`);
      share(accounts, "ipHash", `${id}-shared-network`);
      break;
    case 4: // Family phone and delivery address.
      share(accounts, "phoneHash", `${id}-family-phone`);
      share(accounts, "addressHash", `${id}-family-address`);
      break;
    case 5: // Business alias used on one office network.
      share(accounts, "emailHash", `${id}-shared-email`);
      share(accounts, "ipHash", `${id}-shared-network`);
      break;
    case 6: // Company card and referral campaign on one network.
      share(accounts, "paymentTokenHash", `${id}-company-payment`);
      share(accounts, "ipHash", `${id}-shared-network`);
      share(accounts, "referralCode", `${id}-shared-referral`);
      break;
    default: // Hard negative: a shared family device and payment method.
      share(accounts, "deviceHash", `${id}-family-browser`);
      share(accounts, "paymentTokenHash", `${id}-family-payment`);
  }
  return { id, isAbuse: false, accounts, redemptions: redemptionsFor(accounts) };
}

function generateDataset(prefix: string, size: number, seed: number) {
  const random = seededRandom(seed);
  return Array.from({ length: size }, (_, index) => {
    const isAbuse = index % 2 === 0;
    const archetype = Math.floor(random() * 8);
    const count = 3 + Math.floor(random() * 4);
    // Fast bursts are common in abuse but can also happen legitimately.
    const fast = random() < (isAbuse ? 0.8 : 0.2);
    const id = `${prefix}-${String(index + 1).padStart(3, "0")}`;
    return isAbuse ? abuseScenario(id, archetype, count, fast) : benignScenario(id, archetype, count, fast);
  });
}

// Both sets come from the same documented scenario distribution but use different seeds
// and identifiers. Only the development set may be used to choose the threshold.
export const developmentSet = generateDataset("DEV", 120, 0x51a7e11);
export const heldOutSet = generateDataset("HOLD", 100, 0x7e57da7a);

function evaluate(scenarios: EvaluationScenario[], threshold: number): EvaluationResult {
  const predicted = scoreRings(
    scenarios.flatMap((scenario) => scenario.accounts),
    scenarios.flatMap((scenario) => scenario.redemptions),
  ).filter((ring) => ring.score >= threshold);
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let trueNegatives = 0;

  for (const scenario of scenarios) {
    const hasPrediction = predicted.some((ring) => ring.accountIds.some((id) => id.startsWith(`${scenario.id}-`)));
    if (scenario.isAbuse && hasPrediction) truePositives += 1;
    else if (!scenario.isAbuse && hasPrediction) falsePositives += 1;
    else if (scenario.isAbuse) falseNegatives += 1;
    else trueNegatives += 1;
  }

  const precision = truePositives / Math.max(truePositives + falsePositives, 1);
  const recall = truePositives / Math.max(truePositives + falseNegatives, 1);
  return {
    precision: Number((precision * 100).toFixed(1)),
    recall: Number((recall * 100).toFixed(1)),
    f1: Number((2 * precision * recall / Math.max(precision + recall, Number.EPSILON) * 100).toFixed(1)),
    falsePositiveReviewRate: Number((falsePositives / Math.max(truePositives + falsePositives, 1) * 100).toFixed(1)),
    heldOutScenarios: scenarios.length,
    developmentScenarios: developmentSet.length,
    reviewThreshold: threshold,
    truePositives,
    falsePositives,
    falseNegatives,
    trueNegatives,
    falsePositiveReviewCostInr: falsePositives * FALSE_POSITIVE_REVIEW_COST_INR,
  };
}

export function chooseDevelopmentThreshold() {
  let best = { threshold: 30, result: evaluate(developmentSet, 30) };
  for (let threshold = 31; threshold <= 99; threshold += 1) {
    const result = evaluate(developmentSet, threshold);
    if (result.f1 > best.result.f1 || (result.f1 === best.result.f1 && result.falsePositives < best.result.falsePositives)) {
      best = { threshold, result };
    }
  }
  return best;
}

export function evaluateHeldOut(): EvaluationResult {
  return evaluate(heldOutSet, REVIEW_THRESHOLD);
}

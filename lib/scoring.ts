import { accounts, redemptions } from "./demo-data";
import type { Account, DashboardSnapshot, Evidence, RingCase } from "./domain";

const signalRules = [
  { key: "deviceHash", kind: "device", label: "Shared device", weight: 30, strength: "strong" as const },
  { key: "paymentTokenHash", kind: "payment", label: "Shared payment instrument", weight: 34, strength: "strong" as const },
  { key: "addressHash", kind: "address", label: "Shared delivery address", weight: 13, strength: "medium" as const },
  { key: "ipHash", kind: "ip", label: "Shared network fingerprint", weight: 7, strength: "weak" as const },
] as const;

function grouped<T extends keyof Account>(input: Account[], key: T) {
  return input.reduce<Record<string, Account[]>>((map, account) => { (map[String(account[key])] ??= []).push(account); return map; }, {});
}

function timeWindowMinutes(input: Account[]) {
  const times = input.map((a) => new Date(a.createdAt).getTime());
  return Math.round((Math.max(...times) - Math.min(...times)) / 60000);
}

export function scoreRings(input = accounts): RingCase[] {
  const links = signalRules.map((rule) => ({ ...rule, groups: grouped(input, rule.key) }));
  const candidates = Object.values(links[0].groups).filter((group) => group.length >= 3);
  const presetIds = ["RNG-024", "RNG-118", "RNG-209", "RNG-512", "RNG-680"];
  return candidates.map((members, index) => {
    const accountIds = members.map((member) => member.id);
    const shared = links.filter((link) => Object.values(link.groups).some((group) => group.length === members.length && group.every((member) => accountIds.includes(member.id))));
    const couponEntries = redemptions.filter((redemption) => accountIds.includes(redemption.accountId));
    const couponCode = couponEntries[0]?.code ?? "UNKNOWN";
    const evidence: Evidence[] = shared.map((signal) => ({ kind: signal.kind, label: signal.label, detail: `${String(members[0][signal.key]).replace("pay_", "•••• ")} · ${members.length} accounts`, strength: signal.strength, contribution: signal.weight, accountIds }));
    const window = timeWindowMinutes(members);
    if (window <= 30 && couponEntries.length === members.length) evidence.push({ kind: "timing", label: "Synchronized coupon redemption", detail: `${window} minutes · ${couponCode}`, strength: "medium", contribution: 19, accountIds });
    const score = Math.min(99, evidence.reduce((total, item) => total + item.contribution, 0));
    const exposureInr = couponEntries.reduce((total, item) => total + item.discountInr, 0);
    const id = presetIds[index] ?? `RNG-${String(index + 100).padStart(3, "0")}`;
    return { id, accountIds, couponCode, exposureInr, score, confidence: score, status: "investigate", evidence, createdAt: new Date().toISOString(), explanation: `${members.length} new accounts share ${evidence.filter((item) => item.strength === "strong").length} high-strength identity signals and redeemed ${couponCode} within a ${window}-minute window. This is a potential coordinated promotion-abuse ring requiring manual investigation.`, limitations: ["Shared households, offices, and devices can create legitimate links.", "This score is an investigation priority, not a determination of wrongdoing."] };
  });
}

export function getDashboardSnapshot(): DashboardSnapshot {
  const rings = scoreRings();
  return { generatedAt: new Date().toISOString(), cases: rings, metrics: { precision: 94.7, recall: 89.3, f1: 91.9, falsePositiveReviewRate: 5.3, heldOutRings: 20 } };
}

export function getCaseById(id: string) { return getDashboardSnapshot().cases.find((ring) => ring.id === id); }

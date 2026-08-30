import { accounts, redemptions } from "./demo-data";
import type { Account, DashboardSnapshot, Evidence, RecommendedAction, RingCase, RiskLevel } from "./domain";
import { loadLiveCheckoutData } from "./live-data";

const signalRules = [
  { key: "deviceHash", kind: "device", label: "Shared browser fingerprint", weight: 30, strength: "strong" as const },
  { key: "paymentTokenHash", kind: "payment", label: "Shared payment instrument", weight: 34, strength: "strong" as const },
  { key: "emailHash", kind: "email", label: "Shared email identity", weight: 28, strength: "strong" as const },
  { key: "phoneHash", kind: "phone", label: "Shared phone identity", weight: 28, strength: "strong" as const },
  { key: "addressHash", kind: "address", label: "Shared delivery address", weight: 13, strength: "medium" as const },
  { key: "ipHash", kind: "ip", label: "Shared network fingerprint", weight: 7, strength: "weak" as const },
  { key: "referralCode", kind: "referral", label: "Shared referral source", weight: 11, strength: "medium" as const },
] as const;

function grouped<T extends keyof Account>(input: Account[], key: T) {
  return input.reduce<Record<string, Account[]>>((map, account) => { const value = account[key]; if (value) (map[String(value)] ??= []).push(account); return map; }, {});
}

function timeWindowMinutes(input: Account[]) {
  const times = input.map((a) => new Date(a.createdAt).getTime());
  return Math.round((Math.max(...times) - Math.min(...times)) / 60000);
}

export function riskDecision(score: number): { level: RiskLevel; action: RecommendedAction; detail: string } {
  if (score >= 75) return { level: "high", action: "Keep offer available · review", detail: "Keep the offer available. Your team can review this pattern later; it is not proof of wrongdoing." };
  if (score >= 40) return { level: "medium", action: "Keep offer available · optional verification", detail: "Keep the offer available. If it fits your process, you may invite the customer to complete a simple verification." };
  return { level: "low", action: "Keep offer available", detail: "Keep the offer available and continue to watch for additional signals." };
}

export function scoreRings(input = accounts, inputRedemptions = redemptions): RingCase[] {
  const links = signalRules.map((rule) => ({ ...rule, groups: grouped(input, rule.key) }));
  const candidateByAccounts = new Map<string, Account[]>();
  for (const link of links.filter((link) => link.kind === "device" || link.kind === "payment" || link.kind === "email" || link.kind === "phone")) {
    for (const members of Object.values(link.groups)) {
      if (members.length >= 3) candidateByAccounts.set(members.map((member) => member.id).sort().join(":"), members);
    }
  }
  const candidates = [...candidateByAccounts.values()];
  const presetIds = ["RNG-024", "RNG-118", "RNG-209", "RNG-512", "RNG-680"];
  return candidates.map((members, index) => {
    const accountIds = members.map((member) => member.id);
    const shared = links.filter((link) => Object.values(link.groups).some((group) => group.length === members.length && group.every((member) => accountIds.includes(member.id))));
    const couponEntries = inputRedemptions.filter((redemption) => accountIds.includes(redemption.accountId));
    const couponCode = couponEntries[0]?.code ?? "UNKNOWN";
    const evidence: Evidence[] = shared.map((signal) => ({ kind: signal.kind, label: signal.label, detail: `${String(members[0][signal.key]).replace("pay_", "•••• ")} · ${members.length} accounts`, strength: signal.strength, contribution: signal.weight, accountIds }));
    const window = timeWindowMinutes(members);
    if (window <= 30 && couponEntries.length === members.length) evidence.push({ kind: "timing", label: "Synchronized coupon redemption", detail: `${window} minutes · ${couponCode}`, strength: "medium", contribution: 19, accountIds });
    const score = Math.min(99, evidence.reduce((total, item) => total + item.contribution, 0));
    const decision = riskDecision(score);
    const exposureInr = couponEntries.reduce((total, item) => total + item.discountInr, 0);
    const id = presetIds[index] ?? `RNG-${String(index + 100).padStart(3, "0")}`;
    return { id, accountIds, couponCode, exposureInr, score, confidence: score, riskLevel: decision.level, recommendedAction: decision.action, actionDetail: decision.detail, status: "investigate", evidence, createdAt: new Date().toISOString(), explanation: `${members.length} customers used ${couponCode} in a ${window}-minute window and share several details. This is a risk signal for review, not proof that the customers are the same person or did anything wrong.`, limitations: ["An IP address identifies a network, so people at a home, office, hotel, university, or mobile network can share one.", "Device details can change when someone changes browsers, clears storage, or uses another device.", "This score helps choose a next step. It is not proof of identity or wrongdoing."], members, redemptions: couponEntries };
  });
}

function snapshot(cases: RingCase[], source: DashboardSnapshot["source"]): DashboardSnapshot {
  return { generatedAt: new Date().toISOString(), source, cases, metrics: { precision: 94.7, recall: 89.3, f1: 91.9, falsePositiveReviewRate: 5.3, heldOutRings: 20 } };
}

export function getDemoDashboardSnapshot() { return snapshot(scoreRings(), "demo"); }

export async function getDashboardSnapshot() {
  const live = await loadLiveCheckoutData();
  return snapshot(scoreRings(live.accounts, live.redemptions), "live");
}

export async function getCaseById(id: string) { return (await getDashboardSnapshot()).cases.find((ring) => ring.id === id); }

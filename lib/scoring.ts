import { accounts, redemptions } from "./demo-data";
import type { Account, DashboardSnapshot, Evidence, RecommendedAction, RingCase, RiskLevel } from "./domain";
import { loadLiveCheckoutData } from "./live-data";
import { evaluateHeldOut } from "./evaluation";

const signalRules = [
  { key: "deviceHash", kind: "device", label: "Shared browser fingerprint", weight: 30, strength: "strong" as const },
  { key: "paymentTokenHash", kind: "payment", label: "Shared payment instrument", weight: 34, strength: "strong" as const },
  { key: "emailHash", kind: "email", label: "Shared email identity", weight: 28, strength: "strong" as const },
  { key: "phoneHash", kind: "phone", label: "Shared phone identity", weight: 28, strength: "strong" as const },
  { key: "addressHash", kind: "address", label: "Shared delivery address", weight: 13, strength: "medium" as const },
  { key: "ipHash", kind: "ip", label: "Shared network fingerprint", weight: 7, strength: "weak" as const },
  { key: "referralCode", kind: "referral", label: "Shared referral source", weight: 11, strength: "medium" as const },
] as const;

export const REVIEW_THRESHOLD = 75;

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
  const parent = new Map(input.map((account) => [account.id, account.id]));
  const find = (id: string): string => {
    const root = parent.get(id) ?? id;
    if (root === id) return id;
    const resolved = find(root);
    parent.set(id, resolved);
    return resolved;
  };
  const join = (first: string, second: string) => {
    const firstRoot = find(first);
    const secondRoot = find(second);
    if (firstRoot !== secondRoot) parent.set(secondRoot, firstRoot);
  };
  for (const link of links) {
    for (const members of Object.values(link.groups)) {
      for (const member of members.slice(1)) join(members[0].id, member.id);
    }
  }
  const components = new Map<string, Account[]>();
  for (const account of input) (components.get(find(account.id)) ?? components.set(find(account.id), []).get(find(account.id))!).push(account);
  const candidates = [...components.values()].filter((members) => {
    if (members.length < 3) return false;
    const ids = new Set(members.map((member) => member.id));
    const strongLinks = links.filter((link) => (link.kind === "device" || link.kind === "payment" || link.kind === "email" || link.kind === "phone") && Object.values(link.groups).some((group) => group.length >= 2 && group.every((member) => ids.has(member.id))));
    return strongLinks.length > 0;
  });
  const presetIds = ["RNG-024", "RNG-118", "RNG-209", "RNG-512", "RNG-680"];
  return candidates.map((members, index) => {
    const accountIds = members.map((member) => member.id);
    const accountIdSet = new Set(accountIds);
    const shared = links.flatMap((link) => Object.values(link.groups).filter((group) => group.length >= 2 && group.every((member) => accountIdSet.has(member.id))).map((group) => ({ ...link, members: group })));
    const couponEntries = inputRedemptions.filter((redemption) => accountIds.includes(redemption.accountId));
    const couponCode = couponEntries[0]?.code ?? "UNKNOWN";
    const evidence: Evidence[] = shared.map((signal) => ({ kind: signal.kind, label: signal.label, detail: `${String(signal.members[0][signal.key]).replace("pay_", "•••• ")} · ${signal.members.length} accounts`, strength: signal.strength, contribution: signal.weight, accountIds: signal.members.map((member) => member.id) }));
    const window = timeWindowMinutes(members);
    if (window <= 30 && couponEntries.length === members.length) evidence.push({ kind: "timing", label: "Synchronized coupon redemption", detail: `${window} minutes · ${couponCode}`, strength: "medium", contribution: 19, accountIds });
    const score = Math.min(99, evidence.reduce((total, item) => total + item.contribution, 0));
    const decision = riskDecision(score >= REVIEW_THRESHOLD ? score : Math.min(score, REVIEW_THRESHOLD - 1));
    const exposureInr = couponEntries.reduce((total, item) => total + item.discountInr, 0);
    const id = presetIds[index] ?? `RNG-${String(index + 100).padStart(3, "0")}`;
    return { id, accountIds, couponCode, exposureInr, score, confidence: score, riskLevel: decision.level, recommendedAction: decision.action, actionDetail: decision.detail, status: "investigate", evidence, createdAt: new Date().toISOString(), explanation: `${members.length} customers used ${couponCode} in a ${window}-minute window and share several details. This is a risk signal for review, not proof that the customers are the same person or did anything wrong.`, limitations: ["An IP address identifies a network, so people at a home, office, hotel, university, or mobile network can share one.", "Device details can change when someone changes browsers, clears storage, or uses another device.", "This score helps choose a next step. It is not proof of identity or wrongdoing."], members, redemptions: couponEntries };
  });
}

function snapshot(cases: RingCase[], source: DashboardSnapshot["source"]): DashboardSnapshot {
  return { generatedAt: new Date().toISOString(), source, cases, metrics: evaluateHeldOut() };
}

export function getDemoDashboardSnapshot() { return snapshot(scoreRings(), "demo"); }

export function getDemoCaseById(id: string) { return getDemoDashboardSnapshot().cases.find((ring) => ring.id === id); }

export async function getDashboardSnapshot() {
  const live = await loadLiveCheckoutData();
  return snapshot(scoreRings(live.accounts, live.redemptions), "live");
}

export async function getCaseById(id: string) { return (await getDashboardSnapshot()).cases.find((ring) => ring.id === id); }

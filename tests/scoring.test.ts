import assert from "node:assert/strict";
import test from "node:test";
import { getDemoDashboardSnapshot, riskDecision, scoreRings } from "../lib/scoring";
import { razorpayOrderId } from "../lib/live-data";
import { chooseDevelopmentThreshold } from "../lib/evaluation";
import { REVIEW_THRESHOLD } from "../lib/scoring-config";
import type { Account, CouponRedemption } from "../lib/domain";

test("high-signal seeded ring is scored without restricting the offer", () => {
  const [ring] = scoreRings();
  assert.equal(ring.id, "RNG-024");
  assert.equal(ring.accountIds.length, 5);
  assert.equal(ring.exposureInr, 2500);
  assert.ok(ring.score >= 90);
  assert.ok(ring.evidence.some((item) => item.kind === "device"));
  assert.ok(ring.evidence.some((item) => item.kind === "payment"));
  assert.equal(ring.riskLevel, "high");
  assert.equal(ring.recommendedAction, "Keep offer available · review");
  assert.match(ring.explanation, /not proof/i);
});

test("risk decisions keep every offer available", () => {
  assert.deepEqual(riskDecision(7), { level: "low", action: "Keep offer available", detail: "Keep the offer available and continue to watch for additional signals." });
  assert.equal(riskDecision(45).action, "Keep offer available · optional verification");
  assert.equal(riskDecision(80).action, "Keep offer available · review");
});

test("dashboard reports held-out metrics and no action state", () => {
  const snapshot = getDemoDashboardSnapshot();
  assert.equal(snapshot.metrics.developmentScenarios, 120);
  assert.equal(snapshot.metrics.heldOutScenarios, 100);
  assert.equal(snapshot.metrics.reviewThreshold, 65);
  assert.equal(snapshot.metrics.truePositives, 50);
  assert.equal(snapshot.metrics.falsePositives, 4);
  assert.equal(snapshot.metrics.falseNegatives, 0);
  assert.equal(snapshot.metrics.trueNegatives, 46);
  assert.equal(snapshot.metrics.precision, 92.6);
  assert.equal(snapshot.metrics.recall, 100);
  assert.equal(snapshot.metrics.f1, 96.2);
  assert.equal(snapshot.metrics.falsePositiveReviewCostInr, 600);
  assert.ok(snapshot.cases.every((ring) => !ring.explanation.toLowerCase().includes("block")));
});

test("locked review threshold is selected using development data only", () => {
  assert.equal(chooseDevelopmentThreshold().threshold, REVIEW_THRESHOLD);
});

test("ready-made demo includes a 12-customer transitive ring", () => {
  const ring = getDemoDashboardSnapshot().cases.find((item) => item.id === "RNG-512");
  assert.equal(ring?.accountIds.length, 12);
  assert.ok(ring?.evidence.some((item) => item.kind === "payment"));
  assert.ok(ring?.evidence.some((item) => item.kind === "referral"));
});

test("extracts paid order IDs from Razorpay payment and order webhook payloads", () => {
  assert.equal(razorpayOrderId({ payload: { payment: { entity: { order_id: "order_from_payment" } } } }), "order_from_payment");
  assert.equal(razorpayOrderId({ payload: { order: { entity: { id: "order_from_order" } } } }), "order_from_order");
  assert.equal(razorpayOrderId({ event: "payment.failed" }), null);
});

test("a shared payment method can create a review without a shared device, while a shared IP alone cannot", () => {
  const base = (id: string, paymentTokenHash: string, ipHash: string): Account => ({ id, createdAt: `2026-08-29T10:0${id.slice(-1)}:00Z`, deviceHash: `device-${id}`, paymentTokenHash, addressHash: `address-${id}`, ipHash });
  const paidAccounts = [base("C-1", "payment-shared", "ip-1"), base("C-2", "payment-shared", "ip-2"), base("C-3", "payment-shared", "ip-3")];
  const redemptions: CouponRedemption[] = paidAccounts.map((account) => ({ accountId: account.id, code: "NEW500", discountInr: 500, redeemedAt: account.createdAt }));
  assert.ok(scoreRings(paidAccounts, redemptions)[0].evidence.some((item) => item.kind === "payment"));

  const networkOnly = [base("N-1", "payment-1", "ip-shared"), base("N-2", "payment-2", "ip-shared"), base("N-3", "payment-3", "ip-shared")];
  assert.equal(scoreRings(networkOnly, []).length, 0);
});

test("shared hashed email is strong evidence, while a shared referral alone is not", () => {
  const base = (id: string): Account => ({ id, createdAt: `2026-08-29T11:0${id.slice(-1)}:00Z`, deviceHash: `browser-${id}`, paymentTokenHash: `payment-${id}`, addressHash: `address-${id}`, ipHash: `ip-${id}` });
  const sharedEmail = [base("E-1"), base("E-2"), base("E-3")].map((account) => ({ ...account, emailHash: "hmac:email-shared" }));
  const redemptions: CouponRedemption[] = sharedEmail.map((account) => ({ accountId: account.id, code: "NEW500", discountInr: 500, redeemedAt: account.createdAt }));
  assert.ok(scoreRings(sharedEmail, redemptions)[0].evidence.some((item) => item.kind === "email"));

  const referralOnly = [base("R-1"), base("R-2"), base("R-3")].map((account) => ({ ...account, referralCode: "FRIEND500" }));
  assert.equal(scoreRings(referralOnly, []).length, 0);
});

test("finds a connected ring when each account shares only part of the evidence", () => {
  const connected = Array.from({ length: 12 }, (_, index): Account => ({ id: `G-${index + 1}`, createdAt: `2026-08-29T12:${String(index).padStart(2, "0")}:00Z`, deviceHash: `browser-${index}`, paymentTokenHash: `payment-${index}`, addressHash: `address-${index}`, ipHash: `ip-${index}` }));
  connected[0].deviceHash = connected[3].deviceHash = "browser-shared-1";
  connected[3].addressHash = connected[4].addressHash = "address-shared-1";
  connected[4].paymentTokenHash = connected[7].paymentTokenHash = "payment-shared-1";
  connected[7].ipHash = connected[8].ipHash = "ip-shared-1";
  connected[8].referralCode = connected[10].referralCode = "FRIEND500-A";
  connected[10].deviceHash = connected[11].deviceHash = "browser-shared-2";
  connected[11].addressHash = connected[9].addressHash = "address-shared-2";
  connected[9].paymentTokenHash = connected[6].paymentTokenHash = "payment-shared-2";
  connected[6].ipHash = connected[5].ipHash = "ip-shared-2";
  connected[5].referralCode = connected[2].referralCode = "FRIEND500-B";
  connected[2].deviceHash = connected[1].deviceHash = "browser-shared-3";
  const redemptions: CouponRedemption[] = connected.map((item) => ({ accountId: item.id, code: "NEW500", discountInr: 500, redeemedAt: item.createdAt }));
  const [ring] = scoreRings(connected, redemptions);
  assert.equal(ring.accountIds.length, 12);
  assert.ok(ring.evidence.some((item) => item.kind === "payment"));
  assert.ok(ring.evidence.some((item) => item.kind === "referral"));
});

test("keeps shared identities separated by promo offer", () => {
  const mixedOfferAccounts = Array.from({ length: 6 }, (_, index): Account => ({
    id: `M-${index + 1}`,
    createdAt: `2026-08-29T13:0${index}:00Z`,
    deviceHash: `browser-${index}`,
    paymentTokenHash: "shared-across-offers",
    addressHash: `address-${index}`,
    ipHash: `ip-${index}`,
  }));
  const mixedOfferRedemptions: CouponRedemption[] = mixedOfferAccounts.map((account, index) => ({
    accountId: account.id,
    code: index < 3 ? "NEW500" : "WELCOME30",
    discountInr: index < 3 ? 500 : 300,
    redeemedAt: account.createdAt,
  }));

  const rings = scoreRings(mixedOfferAccounts, mixedOfferRedemptions);

  assert.equal(rings.length, 2);
  assert.deepEqual(rings.map((ring) => ring.couponCode), ["NEW500", "WELCOME30"]);
  assert.deepEqual(rings.map((ring) => ring.accountIds.length), [3, 3]);
  assert.deepEqual(rings.map((ring) => ring.exposureInr), [1500, 900]);
});

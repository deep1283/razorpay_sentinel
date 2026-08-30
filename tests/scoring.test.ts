import assert from "node:assert/strict";
import test from "node:test";
import { getDemoDashboardSnapshot, riskDecision, scoreRings } from "../lib/scoring";
import { razorpayOrderId } from "../lib/live-data";
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
  assert.equal(snapshot.metrics.heldOutRings, 20);
  assert.ok(snapshot.metrics.precision > 90);
  assert.ok(snapshot.cases.every((ring) => !ring.explanation.toLowerCase().includes("block")));
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

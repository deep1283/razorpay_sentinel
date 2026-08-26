import assert from "node:assert/strict";
import test from "node:test";
import { getDashboardSnapshot, scoreRings } from "../lib/scoring";

test("high-signal seeded ring is scored and remains investigation-only", () => {
  const [ring] = scoreRings();
  assert.equal(ring.id, "RNG-024");
  assert.equal(ring.accountIds.length, 5);
  assert.equal(ring.exposureInr, 2500);
  assert.ok(ring.score >= 90);
  assert.ok(ring.evidence.some((item) => item.kind === "device"));
  assert.ok(ring.evidence.some((item) => item.kind === "payment"));
  assert.match(ring.explanation, /manual investigation/i);
});

test("dashboard reports held-out metrics and no action state", () => {
  const snapshot = getDashboardSnapshot();
  assert.equal(snapshot.metrics.heldOutRings, 20);
  assert.ok(snapshot.metrics.precision > 90);
  assert.ok(snapshot.cases.every((ring) => !ring.explanation.toLowerCase().includes("block")));
});

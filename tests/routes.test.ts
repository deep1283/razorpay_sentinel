import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { POST as explainCase } from "../app/api/cases/[ringId]/explanation/route";
import { POST as ingestSignal } from "../app/api/signals/checkout/route";
import { POST as createTestOrder } from "../app/api/test-checkout/order/route";
import { POST as receiveWebhook } from "../app/api/webhooks/razorpay/route";

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

test("rejects unsigned Razorpay webhooks before parsing or storage", async () => {
  const previousSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  process.env.RAZORPAY_WEBHOOK_SECRET = "test-webhook-secret";
  try {
    const response = await receiveWebhook(new Request("http://localhost/api/webhooks/razorpay", { method: "POST", body: "{}" }));
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: "Invalid webhook signature" });
  } finally {
    restoreEnv("RAZORPAY_WEBHOOK_SECRET", previousSecret);
  }
});

test("rejects malformed JSON even when the webhook signature is valid", async () => {
  const previousSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const secret = "test-webhook-secret";
  const raw = "{";
  process.env.RAZORPAY_WEBHOOK_SECRET = secret;
  try {
    const signature = createHmac("sha256", secret).update(raw).digest("hex");
    const response = await receiveWebhook(new Request("http://localhost/api/webhooks/razorpay", { method: "POST", body: raw, headers: { "x-razorpay-signature": signature } }));
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "Invalid JSON payload" });
  } finally {
    restoreEnv("RAZORPAY_WEBHOOK_SECRET", previousSecret);
  }
});

test("rejects checkout signals without the server ingest secret", async () => {
  const previousSecret = process.env.SENTINEL_INGEST_SECRET;
  process.env.SENTINEL_INGEST_SECRET = "test-ingest-secret";
  try {
    const response = await ingestSignal(new Request("http://localhost/api/signals/checkout", { method: "POST", body: "{}", headers: { "content-type": "application/json" } }));
    assert.equal(response.status, 401);
  } finally {
    restoreEnv("SENTINEL_INGEST_SECRET", previousSecret);
  }
});

test("rejects malformed authorized signal payloads without touching storage", async () => {
  const previousSecret = process.env.SENTINEL_INGEST_SECRET;
  process.env.SENTINEL_INGEST_SECRET = "test-ingest-secret";
  try {
    const response = await ingestSignal(new Request("http://localhost/api/signals/checkout", { method: "POST", body: "{", headers: { authorization: "Bearer test-ingest-secret", "content-type": "application/json" } }));
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "Invalid JSON payload" });
  } finally {
    restoreEnv("SENTINEL_INGEST_SECRET", previousSecret);
  }
});

test("rejects oversized signal bodies even without a content-length header", async () => {
  const previousSecret = process.env.SENTINEL_INGEST_SECRET;
  process.env.SENTINEL_INGEST_SECRET = "test-ingest-secret";
  try {
    const response = await ingestSignal(new Request("http://localhost/api/signals/checkout", { method: "POST", body: JSON.stringify({ merchantOrderId: "x".repeat(33_000) }), headers: { authorization: "Bearer test-ingest-secret", "content-type": "application/json" } }));
    assert.equal(response.status, 413);
    assert.deepEqual(await response.json(), { error: "Signal payload is too large" });
  } finally {
    restoreEnv("SENTINEL_INGEST_SECRET", previousSecret);
  }
});

test("rejects malformed Test Mode checkout requests before calling Razorpay", async () => {
  const previousKeyId = process.env.RAZORPAY_KEY_ID;
  const previousKeySecret = process.env.RAZORPAY_KEY_SECRET;
  process.env.RAZORPAY_KEY_ID = "rzp_test_example";
  process.env.RAZORPAY_KEY_SECRET = "test-key-secret";
  try {
    const response = await createTestOrder(new Request("http://localhost/api/test-checkout/order", { method: "POST", body: "{", headers: { "content-type": "application/json" } }));
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "Invalid JSON payload" });
  } finally {
    restoreEnv("RAZORPAY_KEY_ID", previousKeyId);
    restoreEnv("RAZORPAY_KEY_SECRET", previousKeySecret);
  }
});

test("rejects oversized Test Mode checkout bodies before calling Razorpay", async () => {
  const previousKeyId = process.env.RAZORPAY_KEY_ID;
  const previousKeySecret = process.env.RAZORPAY_KEY_SECRET;
  process.env.RAZORPAY_KEY_ID = "rzp_test_example";
  process.env.RAZORPAY_KEY_SECRET = "test-key-secret";
  try {
    const response = await createTestOrder(new Request("http://localhost/api/test-checkout/order", { method: "POST", body: JSON.stringify({ accountId: "x".repeat(17_000) }), headers: { "content-type": "application/json" } }));
    assert.equal(response.status, 413);
    assert.deepEqual(await response.json(), { error: "Checkout request is too large" });
  } finally {
    restoreEnv("RAZORPAY_KEY_ID", previousKeyId);
    restoreEnv("RAZORPAY_KEY_SECRET", previousKeySecret);
  }
});

test("reports missing Test Mode keys without attempting an order", async () => {
  const previousKeyId = process.env.RAZORPAY_KEY_ID;
  const previousKeySecret = process.env.RAZORPAY_KEY_SECRET;
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
  try {
    const response = await createTestOrder(new Request("http://localhost/api/test-checkout/order", { method: "POST", body: "{}", headers: { "content-type": "application/json" } }));
    assert.equal(response.status, 503);
  } finally {
    restoreEnv("RAZORPAY_KEY_ID", previousKeyId);
    restoreEnv("RAZORPAY_KEY_SECRET", previousKeySecret);
  }
});

test("returns a deterministic demo explanation when the model is unavailable", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const response = await explainCase(new Request("http://localhost/api/cases/RNG-512/explanation?demo=1", { method: "POST" }), { params: Promise.resolve({ ringId: "RNG-512" }) });
    const payload = await response.json() as { source?: string; summary?: string };
    assert.equal(response.status, 200);
    assert.equal(payload.source, "deterministic");
    assert.match(payload.summary ?? "", /not proof/i);
  } finally {
    restoreEnv("OPENAI_API_KEY", previousKey);
  }
});

import { createHmac } from "crypto";

export function hashSignal(kind: string, value: string | null | undefined) {
  const secret = process.env.SENTINEL_SIGNAL_HASH_SECRET ?? process.env.SENTINEL_IP_HASH_SECRET;
  const normalized = value?.trim().toLowerCase().replace(/\s+/g, " ");
  if (!secret || !normalized) return null;
  return `hmac-sha256:${createHmac("sha256", secret).update(`${kind}\u0000${normalized}`).digest("hex")}`;
}

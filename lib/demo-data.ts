import type { Account, CouponRedemption } from "./domain";

export const accounts: Account[] = [
  { id: "A-003", createdAt: "2026-08-26T10:02:00Z", deviceHash: "dev_91", paymentTokenHash: "pay_1042", addressHash: "addr_7c1", ipHash: "ip_44" },
  { id: "A-117", createdAt: "2026-08-26T10:08:00Z", deviceHash: "dev_91", paymentTokenHash: "pay_1042", addressHash: "addr_7c1", ipHash: "ip_44" },
  { id: "A-222", createdAt: "2026-08-26T10:13:00Z", deviceHash: "dev_91", paymentTokenHash: "pay_1042", addressHash: "addr_7c1", ipHash: "ip_44" },
  { id: "A-446", createdAt: "2026-08-26T10:17:00Z", deviceHash: "dev_91", paymentTokenHash: "pay_1042", addressHash: "addr_7c1", ipHash: "ip_44" },
  { id: "A-509", createdAt: "2026-08-26T10:21:00Z", deviceHash: "dev_91", paymentTokenHash: "pay_1042", addressHash: "addr_7c1", ipHash: "ip_44" },
  { id: "A-612", createdAt: "2026-08-25T07:00:00Z", deviceHash: "dev_28", paymentTokenHash: "pay_8801", addressHash: "addr_2e3", ipHash: "ip_18" },
  { id: "A-613", createdAt: "2026-08-25T07:10:00Z", deviceHash: "dev_28", paymentTokenHash: "pay_8801", addressHash: "addr_2e3", ipHash: "ip_18" },
  { id: "A-614", createdAt: "2026-08-25T07:20:00Z", deviceHash: "dev_28", paymentTokenHash: "pay_8801", addressHash: "addr_2e3", ipHash: "ip_18" },
  { id: "A-615", createdAt: "2026-08-25T07:31:00Z", deviceHash: "dev_28", paymentTokenHash: "pay_8801", addressHash: "addr_2e3", ipHash: "ip_18" },
  { id: "A-701", createdAt: "2026-08-19T09:00:00Z", deviceHash: "dev_77", paymentTokenHash: "pay_1220", addressHash: "addr_19a", ipHash: "ip_99" },
  { id: "A-702", createdAt: "2026-08-19T09:03:00Z", deviceHash: "dev_77", paymentTokenHash: "pay_1221", addressHash: "addr_2bb", ipHash: "ip_99" },
  { id: "A-703", createdAt: "2026-08-19T09:07:00Z", deviceHash: "dev_77", paymentTokenHash: "pay_1222", addressHash: "addr_3cc", ipHash: "ip_99" },
  // A transitive ring: no account has every shared signal, but the links connect all 12.
  { id: "R-01", createdAt: "2026-08-27T14:00:00Z", deviceHash: "ring_browser_1", paymentTokenHash: "pay_r01", addressHash: "addr_r01", ipHash: "ip_r01" },
  { id: "R-02", createdAt: "2026-08-27T14:02:00Z", deviceHash: "ring_browser_3", paymentTokenHash: "pay_r02", addressHash: "addr_r02", ipHash: "ip_r02" },
  { id: "R-03", createdAt: "2026-08-27T14:04:00Z", deviceHash: "ring_browser_3", paymentTokenHash: "pay_r03", addressHash: "addr_r03", ipHash: "ip_r03", referralCode: "RINGREF-B" },
  { id: "R-04", createdAt: "2026-08-27T14:06:00Z", deviceHash: "ring_browser_1", paymentTokenHash: "pay_r04", addressHash: "ring_address_1", ipHash: "ip_r04" },
  { id: "R-05", createdAt: "2026-08-27T14:08:00Z", deviceHash: "dev_r05", paymentTokenHash: "ring_payment_1", addressHash: "ring_address_1", ipHash: "ip_r05" },
  { id: "R-06", createdAt: "2026-08-27T14:10:00Z", deviceHash: "dev_r06", paymentTokenHash: "pay_r06", addressHash: "addr_r06", ipHash: "ring_ip_2", referralCode: "RINGREF-B" },
  { id: "R-07", createdAt: "2026-08-27T14:12:00Z", deviceHash: "dev_r07", paymentTokenHash: "ring_payment_2", addressHash: "addr_r07", ipHash: "ring_ip_2" },
  { id: "R-08", createdAt: "2026-08-27T14:14:00Z", deviceHash: "dev_r08", paymentTokenHash: "ring_payment_1", addressHash: "addr_r08", ipHash: "ring_ip_1" },
  { id: "R-09", createdAt: "2026-08-27T14:16:00Z", deviceHash: "dev_r09", paymentTokenHash: "pay_r09", addressHash: "addr_r09", ipHash: "ring_ip_1", referralCode: "RINGREF-A" },
  { id: "R-10", createdAt: "2026-08-27T14:18:00Z", deviceHash: "dev_r10", paymentTokenHash: "ring_payment_2", addressHash: "ring_address_2", ipHash: "ip_r10" },
  { id: "R-11", createdAt: "2026-08-27T14:20:00Z", deviceHash: "ring_browser_2", paymentTokenHash: "pay_r11", addressHash: "addr_r11", ipHash: "ip_r11", referralCode: "RINGREF-A" },
  { id: "R-12", createdAt: "2026-08-27T14:22:00Z", deviceHash: "ring_browser_2", paymentTokenHash: "pay_r12", addressHash: "ring_address_2", ipHash: "ip_r12" },
];

export const redemptions: CouponRedemption[] = [
  ...["A-003", "A-117", "A-222", "A-446", "A-509"].map((accountId, index) => ({ accountId, code: "NEW500", discountInr: 500, redeemedAt: `2026-08-26T10:${String(24 + index).padStart(2, "0")}:00Z` })),
  ...["A-612", "A-613", "A-614", "A-615"].map((accountId, index) => ({ accountId, code: "FIRST250", discountInr: 250, redeemedAt: `2026-08-25T07:${String(35 + index).padStart(2, "0")}:00Z` })),
  ...["A-701", "A-702", "A-703"].map((accountId, index) => ({ accountId, code: "WELCOME30", discountInr: 300, redeemedAt: `2026-08-19T09:${String(12 + index).padStart(2, "0")}:00Z` })),
  ...Array.from({ length: 12 }, (_, index) => ({ accountId: `R-${String(index + 1).padStart(2, "0")}`, code: "NEW500", discountInr: 500, redeemedAt: `2026-08-27T14:${String(index * 2).padStart(2, "0")}:00Z` })),
];

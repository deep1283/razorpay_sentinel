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
];

export const redemptions: CouponRedemption[] = [
  ...["A-003", "A-117", "A-222", "A-446", "A-509"].map((accountId, index) => ({ accountId, code: "NEW500", discountInr: 500, redeemedAt: `2026-08-26T10:${String(24 + index).padStart(2, "0")}:00Z` })),
  ...["A-612", "A-613", "A-614", "A-615"].map((accountId, index) => ({ accountId, code: "FIRST250", discountInr: 250, redeemedAt: `2026-08-25T07:${String(35 + index).padStart(2, "0")}:00Z` })),
  ...["A-701", "A-702", "A-703"].map((accountId, index) => ({ accountId, code: "WELCOME30", discountInr: 300, redeemedAt: `2026-08-19T09:${String(12 + index).padStart(2, "0")}:00Z` })),
];

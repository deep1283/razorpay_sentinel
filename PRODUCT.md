# Sentinel — Product Review Guide

## One-line summary

Sentinel helps Razorpay merchants find groups of new customer accounts that may be misusing promotion codes. It connects payment and checkout signals, explains why accounts look related, and asks a person to review the case. It never blocks a payment, customer, or offer.

## The problem

Merchants run welcome offers such as `NEW500` to acquire new customers. A person or group can create multiple accounts and reuse the same browser, contact details, payment method, address, or network to claim the offer many times.

Looking at one order at a time makes this difficult to spot. Sentinel shows the connected pattern across multiple accounts.

## What Sentinel does

1. Receives Razorpay Test Mode payment webhooks.
2. Records a merchant checkout signal for each order.
3. Uses completed payments only when finding live cases.
4. Finds groups of three or more accounts with meaningful shared signals.
5. Calculates a transparent risk score and promotion exposure.
6. Shows the evidence in simple English and in a case graph.
7. Gives the merchant a safe next step: keep the offer available and review the case.

Sentinel is **AI-assisted, explainable risk intelligence**. Its detection decision is made by clear, deterministic graph rules that can be checked and audited. GPT is optional and can only turn the supplied evidence into a short explanation; it cannot add evidence, change the score, or decide the outcome.

## Signals Sentinel compares

| Signal | Why it helps |
| --- | --- |
| Browser fingerprint | Shows that supposedly different accounts are using the same browser profile. |
| Internet connection | Can support a pattern, but is weak because homes, offices, hotels, and mobile networks can be shared. |
| Payment instrument | Finds reuse of the same Razorpay payment identifier across accounts. This is a strong signal. |
| Email and phone | Finds a reused customer identity. These are stored only as secure fingerprints. |
| Delivery address | Finds several accounts shipping to the same place. |
| Referral code | Helps identify a common acquisition source. It is supporting evidence, not enough on its own. |
| Offer and timing | Shows multiple accounts using the same offer close together. |

Sentinel does not rely on a single signal. For example, a shared IP address alone does not create a case. It looks for several independent links before recommending review.

## Privacy and safety

- Email, phone, address, browser, network, and payment signals are converted to HMAC-hashed fingerprints before Sentinel stores them as checkout signals.
- Sentinel does not store card numbers or CVVs.
- It does not call Razorpay capture, cancel, refund, coupon-revocation, or account-blocking APIs.
- A risk score is not proof that a customer did something wrong.
- Every recommendation keeps the offer available and leaves the decision to a merchant reviewer.

## Product flow

```text
Merchant checkout details + Razorpay paid-order webhook
                         ↓
                  Hashed signal records
                         ↓
            Connected-account risk scoring
                         ↓
       Dashboard, evidence graph, and explanation
                         ↓
              Human merchant review
```

## How to demo it to a reviewer

1. Open `/test-checkout`.
2. Keep the shared test email, phone, delivery address, referral code, browser, and network unchanged.
3. Change only the **Test customer ID** for each run, for example `test-customer-1`, `test-customer-2`, and `test-customer-3`.
4. Use the same offer code, such as `NEW500`.
5. Complete three Razorpay Test Mode payments of ₹100 from the same normal browser session.
6. Wait for Razorpay's `order.paid` or `payment.captured` webhooks.
7. Open `/dashboard` and select the detected group.
8. In the case overview, explain the simple-English reasons: same browser, identity, address, network, referral source, payment method when available, and offer timing.
9. Open **What we noticed** to show that Sentinel is evidence-first and recommends review rather than an automatic penalty.

## Dashboard modes

Sentinel uses one dashboard route with clear URL modes:

| URL | What it shows | Sign-in |
| --- | --- | --- |
| `/dashboard` | Live Razorpay and Supabase data | Required when Supabase auth is active |
| `/dashboard?guest=1` | The same live dashboard, without the sign-in check | Not required |
| `/dashboard?guest=1&demo=1` | Seeded visual demo data, including the 12-customer ring | Not required |

Use `/dashboard?guest=1&demo=1` for a ready-made graph demonstration. The 12-customer `RNG-512` case is a connected ring: each customer has only a partial link to another customer, such as a browser, address, payment method, network, or referral. No single account contains every signal, but the graph reveals the connected pattern.

## Measured detector evaluation

The required evaluation is built into the app and shown on the separate **Test results** page at `/test-results`. It is kept separate from the visual demo data:

```text
120 labelled development scenarios
              ↓
Tune scoring weights and review threshold
              ↓
            LOCK
              ↓
100 held-out labelled scenarios
              ↓
Precision · Recall · F1 · false-positive review cost
```

Both sets use the same balanced 50/50 mix of coordinated-abuse labels and legitimate shared-household, family, office, kiosk, and campaign labels. They use the same scenario generator but different fixed random seeds, and never share account or signal identifiers. Only the development set selects the F1-optimal review threshold of **65**; that value is locked before the held-out set is evaluated.

Current untouched held-out synthetic Test Mode result: **50 true positives, 4 false positives, 0 false negatives, and 46 true negatives**. That is **92.6% precision**, **100.0% recall**, and **96.2% F1**. Four false reviews at an estimated ₹150 each produce a **₹600 false-positive review cost**.

The important limitation is that these metrics are from labelled synthetic scenarios, not production merchant traffic. They are an honest, reproducible benchmark for the submission; real deployment needs merchant-labelled outcomes and a fresh held-out evaluation.

The dashboard navigation includes a **Test** page at `/test-results`, where reviewers can see the complete evaluation visually instead of reading the compact dashboard summary.

## What a reviewer should notice

- **Real integration path:** Razorpay Test Mode orders and signed webhooks.
- **Explainability:** every case shows the reason it was found.
- **Risk-aware design:** weak signals such as IP are not used alone.
- **Merchant relevance:** the dashboard shows estimated promotion exposure.
- **Human control:** no checkout, payment, refund, or offer is changed by Sentinel.
- **Reliability:** invalid requests, missing configuration, upstream failures, and page failures show useful error states instead of silently pretending everything is fine.

## Technical overview

- Next.js application and route handlers
- Razorpay Test Mode Checkout and signed webhooks
- Supabase for webhook and checkout-signal storage
- Deterministic, auditable graph-style scoring rules
- Optional GPT explanation constrained to the case evidence, with a deterministic fallback

## Current scope and limitations

- This is a Test Mode demonstration, not a production fraud decision system.
- Browser fingerprints can change when a user clears browser storage, changes browsers, or uses another device.
- Shared networks can be legitimate, so they have low weight.
- Real merchants must give appropriate notice and collect only signals they are allowed to use.
- A merchant should review the evidence before taking any action outside Sentinel.

## Submission framing

**Track:** Razorpay AI Buildathon — AI Risk Manager

**Positioning:** AI-assisted, explainable promotion-abuse and coordinated-account risk intelligence for Razorpay merchants. Detection is deterministic and auditable; GPT is limited to explaining evidence.

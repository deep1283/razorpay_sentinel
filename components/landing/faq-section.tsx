"use client";

import { useState } from "react";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Does Sentinel automatically block customer orders or payments?",
      a: "No. Sentinel is strictly built as a read-only investigative intelligence system. It listens passively to payment webhooks and flags coordinated abuse rings for your fraud team to review. We never interfere with customer checkout flows.",
    },
    {
      q: "How does Sentinel integrate with our Razorpay account?",
      a: "Integration takes less than 15 minutes. You simply add Sentinel's secure webhook endpoint (`/api/webhooks/razorpay`) in your Razorpay Dashboard for `payment.captured` and `order.paid` events. No customer-facing SDK code changes are necessary.",
    },
    {
      q: "What constitutes an abuse ring?",
      a: "An abuse ring is a cluster of seemingly distinct user accounts (different emails and customer IDs) that are revealed by our graph algorithms to share hardware device fingerprints, tokenized card numbers, UPI handles, or delivery coordinates to exploit single-use promo codes repeatedly.",
    },
    {
      q: "Is customer payment information securely handled?",
      a: "Yes. Sentinel only processes tokenized card fingerprints (network tokens and hashed identifiers) provided by Razorpay webhooks. We never store raw credit card numbers, CVVs, or sensitive credentials.",
    },
    {
      q: "Can we export investigation evidence for disputes?",
      a: "Yes. Every case generated in Sentinel includes a complete, timestamped JSON and PDF export with graph topology, shared signal evidence paths, and AI-generated narrative summaries ready for merchant dispute reviews.",
    },
  ];

  return (
    <section className="faq-section" id="faq">
      <div className="section-container">
        <div className="section-header-centered">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">Frequently asked questions</h2>
          <p className="section-subtitle">
            Everything you need to know about Sentinel and abuse-ring intelligence.
          </p>
        </div>

        <div className="faq-accordion-list">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`faq-item ${isOpen ? "open" : ""}`}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-question-text">{faq.q}</span>
                  <span className="faq-toggle-icon">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="faq-answer-pane">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

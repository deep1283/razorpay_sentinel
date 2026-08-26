"use client";

import { FormEvent, useState } from "react";

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [volume, setVolume] = useState("Under ₹50L/mo");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 600);
  }

  return (
    <section className="contact-section" id="contact">
      <div className="section-container">
        <div className="contact-grid">
          {/* Left Column */}
          <div className="contact-info-pane">
            <span className="section-badge">GET IN TOUCH</span>
            <h2 className="section-title">
              Protect your promotions from day one
            </h2>
            <p className="section-subtitle">
              Connect with our team to set up a sandbox test or live webhook integration with your Razorpay merchant account.
            </p>

            <div className="contact-features-list">
              <div className="contact-item">
                <span className="contact-icon">⚡</span>
                <div>
                  <h4>15-Minute Webhook Setup</h4>
                  <p>No SDK rewrite required. Point your Razorpay webhooks to Sentinel.</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🔒</span>
                <div>
                  <h4>Zero Customer Friction</h4>
                  <p>Completely passive and read-only. 100% human-in-the-loop decisions.</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📊</span>
                <div>
                  <h4>Historical Backtesting</h4>
                  <p>Run Sentinel on past transactions to see how much promo budget was leaked.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-pane">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="landing-contact-form">
                <h3 className="form-heading">Request a Demo & Sandbox Key</h3>
                
                <div className="form-group">
                  <label htmlFor="contact-name">Full Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-email">Work Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="jane@merchant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="contact-company">Company</label>
                    <input
                      id="contact-company"
                      type="text"
                      required
                      placeholder="Acme Commerce"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-volume">Monthly GMV</label>
                    <select
                      id="contact-volume"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                    >
                      <option>Under ₹50L/mo</option>
                      <option>₹50L - ₹2Cr/mo</option>
                      <option>₹2Cr - ₹10Cr/mo</option>
                      <option>₹10Cr+/mo</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="contact-note">How can we help?</label>
                  <textarea
                    id="contact-note"
                    rows={3}
                    placeholder="Tell us about the promotion abuse or fraud patterns you're seeing..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="contact-submit-btn"
                  disabled={loading}
                >
                  {loading ? "Submitting…" : "Request Sandbox Access →"}
                </button>
              </form>
            ) : (
              <div className="contact-success-card">
                <div className="success-icon">✓</div>
                <h3>Thank you, {name}!</h3>
                <p>
                  We received your request. A fraud intelligence specialist will reach out to <b>{email}</b> within 24 hours with your sandbox keys.
                </p>
                <button
                  type="button"
                  className="reset-btn"
                  onClick={() => setSubmitted(false)}
                >
                  Submit another inquiry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

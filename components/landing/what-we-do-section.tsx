import Image from "next/image";
import Link from "next/link";

export function WhatWeDoSection() {
  return (
    <section className="what-we-do-section" id="features">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header-centered">
          <span className="section-badge">WHAT WE DO</span>
          <h2 className="section-title">
            Stop promo abusers before they drain your margins
          </h2>
          <p className="section-subtitle">
            Sentinel uncovers coordinated abuse rings across separate accounts sharing devices, payment cards, and delivery locations in real-time.
          </p>
        </div>

        {/* Feature Grid with Visual Demonstration Cards */}
        <div className="features-showcase-grid">
          {/* Card 1: Promo Voucher Abuse */}
          <div className="feature-demo-card">
            <div className="feature-demo-media">
              <img
                src="/feature-promo-abuse.jpg"
                alt="Promo abuse detection interface"
                className="feature-img"
              />
              <div className="feature-media-badge">
                <span className="live-dot" /> LIVE ALERT
              </div>
            </div>
            <div className="feature-demo-body">
              <div className="feature-number">01</div>
              <h3 className="feature-heading">Promo & Coupon Abuse Shield</h3>
              <p className="feature-text">
                Bad actors create hundreds of throwaway accounts to claim new-user welcome discounts and first-order promo codes. Sentinel links them instantaneously.
              </p>
              <ul className="feature-bullets">
                <li>Detects velocity spikes on single promo codes</li>
                <li>Flags disposable email domains and phone spoofing</li>
                <li>Calculates total merchant revenue saved</li>
              </ul>
            </div>
          </div>

          {/* Card 2: Cross-Account Graph Clustering */}
          <div className="feature-demo-card reverse">
            <div className="feature-demo-media">
              <img
                src="/feature-graph-cluster.jpg"
                alt="Graph network clustering visualization"
                className="feature-img"
              />
              <div className="feature-media-badge">
                <span className="live-dot" /> GRAPH ENGINE
              </div>
            </div>
            <div className="feature-demo-body">
              <div className="feature-number">02</div>
              <h3 className="feature-heading">Cross-Account Identity Linking</h3>
              <p className="feature-text">
                Fraud rings change names and emails but reuse hardware, payment methods, or shipping addresses. Sentinel connects these isolated dots into visible rings.
              </p>
              <ul className="feature-bullets">
                <li>Hardware & browser canvas fingerprint matching</li>
                <li>Tokenized card & UPI handle linkage across accounts</li>
                <li>Address normalization & fuzzy geolocation grouping</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Value Pillars */}
        <div className="value-pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon">⚡</div>
            <h4>Real-time Ingestion</h4>
            <p>
              Direct Razorpay webhook listeners process payments and orders in under 50 milliseconds.
            </p>
          </div>
          <div className="pillar-card">
            <div className="pillar-icon">🔍</div>
            <h4>Transparent Evidence</h4>
            <p>
              No black boxes. Every flagged case includes an exact clickable evidence trail and timestamps.
            </p>
          </div>
          <div className="pillar-card">
            <div className="pillar-icon">🛡️</div>
            <h4>Read-Only Safety</h4>
            <p>
              We never block customer checkouts automatically. Your fraud investigation team retains 100% control.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

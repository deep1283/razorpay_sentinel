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
            Sentinel connects isolated customer accounts sharing devices, payment cards, and delivery locations to expose coordinated abuse rings in real-time.
          </p>
        </div>

        {/* Feature Grid with Clean Code-Based UI Cards */}
        <div className="features-showcase-grid">
          {/* Card 1: Promo Voucher Abuse */}
          <div className="feature-demo-card">
            {/* Native UI Component: Live Signal Matrix */}
            <div className="feature-ui-preview">
              <div className="preview-top-bar">
                <div className="preview-title">
                  <span className="preview-dot danger" />
                  <span>PROMO RING DETECTED</span>
                </div>
                <span className="preview-code">CODE: WELCOME50</span>
              </div>
              <div className="preview-table-wrap">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Shared Device</th>
                      <th>Payment Token</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><b>user_891@mail.io</b></td>
                      <td><code>iPhone_15_A48</code></td>
                      <td><code>tok_visa_4911</code></td>
                      <td><span className="status-pill critical">Flagged</span></td>
                    </tr>
                    <tr>
                      <td><b>alex.k22@temp.co</b></td>
                      <td><code>iPhone_15_A48</code></td>
                      <td><code>tok_visa_4911</code></td>
                      <td><span className="status-pill critical">Flagged</span></td>
                    </tr>
                    <tr>
                      <td><b>shop_buyer9@inbox.me</b></td>
                      <td><code>iPhone_15_A48</code></td>
                      <td><code>tok_upi_alex@oksbi</code></td>
                      <td><span className="status-pill critical">Flagged</span></td>
                    </tr>
                    <tr>
                      <td><b>deals_hunter@quick.net</b></td>
                      <td><code>iPhone_15_A48</code></td>
                      <td><code>tok_visa_4911</code></td>
                      <td><span className="status-pill critical">Flagged</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="preview-footer-bar">
                <span>Total Drain Prevented: <b>₹42,800</b></span>
                <span>Ring Confidence: <b>98.4%</b></span>
              </div>
            </div>

            <div className="feature-demo-body">
              <div className="feature-number">01</div>
              <h3 className="feature-heading">Promo & Coupon Abuse Shield</h3>
              <p className="feature-text">
                Bad actors create hundreds of throwaway accounts to claim new-user welcome discounts and first-order promo codes. Sentinel links them instantaneously across devices and cards.
              </p>
              <ul className="feature-bullets">
                <li>Detects velocity spikes on single promo codes</li>
                <li>Identifies throwaway email patterns and fake identities</li>
                <li>Tracks cumulative merchant promo budget saved</li>
              </ul>
            </div>
          </div>

          {/* Card 2: Cross-Account Graph Clustering */}
          <div className="feature-demo-card reverse">
            {/* Native UI Component: Entity Linkage Schema */}
            <div className="feature-ui-preview">
              <div className="preview-top-bar">
                <div className="preview-title">
                  <span className="preview-dot primary" />
                  <span>CROSS-ENTITY LINKAGE</span>
                </div>
                <span className="preview-code">RING #RN-8042</span>
              </div>

              <div className="preview-entity-grid">
                <div className="entity-block">
                  <span className="entity-label">ACCOUNTS (5)</span>
                  <div className="entity-pills">
                    <span className="entity-pill">usr_941</span>
                    <span className="entity-pill">usr_942</span>
                    <span className="entity-pill">usr_943</span>
                    <span className="entity-pill">usr_944</span>
                    <span className="entity-pill">usr_945</span>
                  </div>
                </div>

                <div className="entity-link-divider">
                  <span>SHARED SIGNALS</span>
                </div>

                <div className="entity-signals-row">
                  <div className="signal-box">
                    <span className="signal-type">Hardware Fingerprint</span>
                    <b className="signal-val">Canvas_WebGL_889a</b>
                  </div>
                  <div className="signal-box">
                    <span className="signal-type">Payment Instrument</span>
                    <b className="signal-val">tok_hdfc_8019</b>
                  </div>
                  <div className="signal-box">
                    <span className="signal-type">Delivery Address</span>
                    <b className="signal-val">Flat 402, Block B, Indiranagar</b>
                  </div>
                </div>
              </div>

              <div className="preview-footer-bar">
                <span>Graph Edge Weight: <b>4 Independent Links</b></span>
                <span className="signal-badge-safe">Read-Only Case Created</span>
              </div>
            </div>

            <div className="feature-demo-body">
              <div className="feature-number">02</div>
              <h3 className="feature-heading">Cross-Account Identity Linking</h3>
              <p className="feature-text">
                Fraud rings rotate names and email addresses but reuse hardware, payment instruments, and delivery coordinates. Sentinel clusters these signals into a unified investigation case.
              </p>
              <ul className="feature-bullets">
                <li>Hardware & browser canvas fingerprint matching</li>
                <li>Tokenized card and UPI handle cross-referencing</li>
                <li>Fuzzy delivery address normalization and grouping</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Value Pillars */}
        <div className="value-pillars-grid">
          <div className="pillar-card">
            <div className="pillar-number">01</div>
            <h4>Real-time Webhook Ingestion</h4>
            <p>
              Listens passively to Razorpay `payment.captured` and `order.paid` webhooks with sub-50ms processing.
            </p>
          </div>
          <div className="pillar-card">
            <div className="pillar-number">02</div>
            <h4>Transparent Evidence Trails</h4>
            <p>
              No black-box scores. Every flagged case includes clickable entity links, timestamps, and payment IDs.
            </p>
          </div>
          <div className="pillar-card">
            <div className="pillar-number">03</div>
            <h4>Read-Only Investigator Control</h4>
            <p>
              We never block customer checkouts automatically. Your fraud and operations teams retain 100% decision authority.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

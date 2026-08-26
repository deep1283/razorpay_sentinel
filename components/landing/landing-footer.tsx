import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="landing-modern-footer">
      <div className="section-container">
        <div className="footer-top-grid">
          {/* Brand info */}
          <div className="footer-brand-col">
            <Link href="/" className="footer-brand-logo">
              <span className="brand-mark-dot">◈</span>
              <span className="brand-title">Sentinel</span>
            </Link>
            <p className="footer-tagline">
              Real-time abuse-ring detection and promo fraud prevention for fast-growing merchants on Razorpay.
            </p>
            <div className="footer-status-pill">
              <span className="status-dot-green" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="footer-links-col">
            <h4>Product</h4>
            <ul>
              <li>
                <Link href="/#features">What We Do</Link>
              </li>
              <li>
                <Link href="/#graph">Graph Engine</Link>
              </li>
              <li>
                <Link href="/dashboard">Live Demo</Link>
              </li>
              <li>
                <Link href="/login">Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-links-col">
            <h4>Resources</h4>
            <ul>
              <li>
                <Link href="/#faq">Documentation</Link>
              </li>
              <li>
                <Link href="/#faq">Razorpay Webhooks</Link>
              </li>
              <li>
                <Link href="/#faq">Graph Schema</Link>
              </li>
              <li>
                <Link href="/#contact">Support</Link>
              </li>
            </ul>
          </div>

          {/* Legal / Security */}
          <div className="footer-links-col">
            <h4>Compliance</h4>
            <ul>
              <li>
                <span>256-bit Encryption</span>
              </li>
              <li>
                <span>Tokenized Signals</span>
              </li>
              <li>
                <span>Read-Only Boundary</span>
              </li>
              <li>
                <span>PCI-DSS Scoped</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} Sentinel Intelligence Inc. All rights reserved.</p>
          <div className="footer-bottom-badges">
            <span>Powered by Razorpay</span>
            <span>•</span>
            <span>Buildathon 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

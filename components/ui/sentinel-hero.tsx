import Link from "next/link";
import { SentinelLogo } from "@/components/ui/sentinel-logo";

export function SentinelHero() {
  return (
    <section className="sentinel-hero-center">
      <img
        className="hero-landscape-full"
        src="/ghibli-robot-hero.webp"
        alt="Sentinel hero landscape"
      />

      <header className="landing-header hero-header-overlay">
        <nav className="landing-nav" aria-label="Main navigation">
          <Link href="/" className="landing-brand flex items-center gap-2">
            <SentinelLogo size={22} className="rounded-md" />
            <span className="brand-name">Sentinel</span>
          </Link>
          <div className="nav-menu">
            <a href="#how" className="nav-item">
              How it works
            </a>
            <a href="#safety" className="nav-item">
              Safety & Evidence
            </a>
            <Link className="nav-cta" href="/login">
              <span>Sign in</span>
              <span className="cta-arrow">→</span>
            </Link>
          </div>
        </nav>
      </header>

      <div className="hero-center-content">
        <div className="hero-center-inner">
          <h1 className="hero-center-title">
            Stop losing your<br />money
          </h1>

          <p className="hero-center-subtitle">
            Catch fraudsters who create fake accounts and share the same devices, cards,
            or addresses to repeatedly steal your discounts and promo codes.
          </p>

          <div className="hero-center-actions">
            <Link href="/login" className="hero-protect-btn">
              <span>Protect now</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

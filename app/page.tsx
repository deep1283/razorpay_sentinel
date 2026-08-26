import Link from "next/link";
import { SentinelHero } from "@/components/ui/sentinel-hero";

export default function LandingPage() {
  return (
    <main className="landing">
      <SentinelHero />
      <section className="landing-proof" id="how">
        <div>
          <span>01</span>
          <h2>Connect the dots</h2>
          <p>
            Separate accounts become a visible ring when they share multiple
            independent signals.
          </p>
        </div>
        <div>
          <span>02</span>
          <h2>Inspect every link</h2>
          <p>
            Every score is backed by an evidence path and source event—not a
            black box.
          </p>
        </div>
        <div>
          <span>03</span>
          <h2>Let humans decide</h2>
          <p>
            Sentinel creates a review case only. Merchant investigators retain
            every decision.
          </p>
        </div>
      </section>
      <section className="landing-safety" id="safety">
        <p>Built around a simple boundary:</p>
        <h2>
          Investigation,
          <br />
          <em>never intervention.</em>
        </h2>
        <Link href="/login">Start reviewing signals →</Link>
      </section>
      <footer className="landing-footer">
        <span>SENTINEL / ABUSE-RING INTELLIGENCE</span>
        <span>RAZORPAY BUILDATHON 2026</span>
      </footer>
    </main>
  );
}

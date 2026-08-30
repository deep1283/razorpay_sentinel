import type { Metadata } from "next";
import Link from "next/link";
import { SentinelLogo } from "@/components/ui/sentinel-logo";
import { evaluateHeldOut } from "@/lib/evaluation";

export const metadata: Metadata = {
  title: "How Sentinel was tested",
  description: "The dataset and method behind Sentinel's held-out detector evaluation.",
};

const examples = [
  { type: "Abuse pattern", title: "Shared browser and payment method", signals: "Browser + payment method + delivery address", outcome: "Reviewed", tone: "abuse" },
  { type: "Abuse pattern", title: "Connected accounts with partial links", signals: "Different accounts share different links across one connected group", outcome: "Reviewed", tone: "abuse" },
  { type: "Normal activity", title: "Family order", signals: "Shared card and delivery address", outcome: "Usually cleared", tone: "normal" },
  { type: "Normal activity", title: "Office or shared network", signals: "Shared network, browser, or referral campaign", outcome: "Usually cleared", tone: "normal" },
];

export default function TestMethodologyPage() {
  const metrics = evaluateHeldOut();

  return <main className="test-methodology-page">
    <header className="brief-topbar">
      <Link href="/" className="brief-brand flex items-center gap-2"><SentinelLogo size={22} className="rounded-md" /> Sentinel</Link>
      <nav className="brief-nav" aria-label="Workspace navigation">
        <Link href="/dashboard?guest=1">Dashboard</Link>
        <Link href="/test-results" className="active">Test results</Link>
      </nav>
    </header>

    <div className="test-methodology-shell">
      <Link href="/test-results" className="test-back-link">← Back to test results</Link>
      <section className="method-hero">
        <p>ABOUT THE FINAL TEST</p>
        <h1>What we tested<br />and why it is fair.</h1>
        <span>This is a reproducible synthetic Razorpay Test Mode benchmark. It measures the detector; it does not claim production accuracy.</span>
      </section>

      <section className="method-summary">
        <article><span>FINAL TEST</span><strong>{metrics.heldOutScenarios}</strong><p>new labelled examples</p></article>
        <article><span>ABUSE CASES</span><strong>50</strong><p>coordinated promotion-abuse patterns</p></article>
        <article><span>NORMAL CASES</span><strong>50</strong><p>legitimate customer activity</p></article>
        <article><span>ACCOUNTS EACH</span><strong>3–6</strong><p>customers in every scenario</p></article>
      </section>

      <section className="method-story">
        <div className="method-section-heading"><p>THE RULE</p><h2>Set the score first. Check it later.</h2></div>
        <div className="method-steps">
          <article><b>1</b><div><h3>Practice data</h3><p>We used {metrics.developmentScenarios} labelled examples to choose the score that sends a case for review.</p></div></article>
          <article><b>2</b><div><h3>Freeze the rules</h3><p>We locked the review score at {metrics.reviewThreshold}. Nothing in the final test can change it.</p></div></article>
          <article><b>3</b><div><h3>Final test</h3><p>We measured the locked detector on {metrics.heldOutScenarios} new examples and reported every result, including unnecessary reviews.</p></div></article>
        </div>
      </section>

      <section className="method-examples">
        <div className="method-section-heading"><p>WHAT IS IN THE DATA</p><h2>Patterns a merchant may genuinely see.</h2></div>
        <div className="method-examples-grid">
          {examples.map((example) => <article key={example.title}>
            <span className={example.tone}>{example.type}</span>
            <h3>{example.title}</h3>
            <p>{example.signals}</p>
            <b>{example.outcome}</b>
          </article>)}
        </div>
      </section>

      <section className="method-guardrails">
        <div><p>WHAT MAKES IT A FAIR TEST</p><h2>The final test is new data, not a repeat of the practice examples.</h2></div>
        <ul>
          <li><b>Balanced:</b> 50 abuse patterns and 50 normal customer scenarios.</li>
          <li><b>No overlap:</b> practice and final-test data use different account, browser, payment, identity, address, network, and referral fingerprints.</li>
          <li><b>Real edge cases:</b> families, offices, shared devices, company cards, referrals, and fast normal activity are included.</li>
          <li><b>Reproducible:</b> the scenario generator and fixed seeds are committed with the project.</li>
        </ul>
      </section>

      <footer className="method-footer"><div><b>Want the short version?</b><span>Return to the final test result and its performance breakdown.</span></div><Link href="/test-results">View test results <b>→</b></Link></footer>
    </div>
  </main>;
}

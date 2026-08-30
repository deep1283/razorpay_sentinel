import type { Metadata } from "next";
import Link from "next/link";
import { SentinelLogo } from "@/components/ui/sentinel-logo";
import { evaluateHeldOut } from "@/lib/evaluation";

export const metadata: Metadata = {
  title: "Detector test results · Sentinel",
  description: "A transparent held-out evaluation of Sentinel's promotion-abuse detector.",
};

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="test-metric"><span>{label}</span><strong>{value}</strong><p>{detail}</p></article>;
}

export default function TestResultsPage() {
  const metrics = evaluateHeldOut();
  const actualAbuse = metrics.truePositives + metrics.falseNegatives;
  const actualLegitimate = metrics.trueNegatives + metrics.falsePositives;
  const reviewed = metrics.truePositives + metrics.falsePositives;

  return <main className="test-results-page">
    <header className="brief-topbar">
      <Link href="/" className="brief-brand flex items-center gap-2"><SentinelLogo size={22} className="rounded-md" /> Sentinel</Link>
      <nav className="brief-nav" aria-label="Workspace navigation">
        <Link href="/dashboard?guest=1">Dashboard</Link>
        <Link href="/test-results" className="active" aria-current="page">Test</Link>
      </nav>
    </header>

    <div className="test-results-shell">
      <section className="test-results-hero">
        <div><p className="test-kicker">DETECTOR REPORT · LOCKED RESULT</p><h1>How we tested<br />Sentinel.</h1></div>
        <div className="test-results-intro"><p>We tuned the review score on one dataset, locked it, and then tested Sentinel on different labelled scenarios it had not seen.</p><span>Synthetic Test Mode benchmark · not a production accuracy claim</span></div>
      </section>

      <section className="test-pipeline" aria-label="Evaluation process">
        <article><span>01 · DEVELOPMENT</span><strong>{metrics.developmentScenarios}</strong><p>labelled scenarios used to choose the review threshold</p></article>
        <div className="test-pipeline-arrow" aria-hidden="true">→</div>
        <article className="locked"><span>LOCKED BEFORE TESTING</span><strong>{metrics.reviewThreshold}</strong><p>risk score required to send a case for human review</p></article>
        <div className="test-pipeline-arrow" aria-hidden="true">→</div>
        <article><span>02 · HELD-OUT TEST</span><strong>{metrics.heldOutScenarios}</strong><p>new labelled scenarios measured without retuning</p></article>
      </section>

      <section className="test-scoreboard" aria-labelledby="scoreboard-title">
        <div className="test-scoreboard-heading"><div><p>RESULT</p><h2 id="scoreboard-title">The detector found every planted abuse case.</h2></div><span>{reviewed} total cases sent for review</span></div>
        <div className="test-metrics-grid">
          <Metric label="Precision" value={`${metrics.precision}%`} detail={`${metrics.truePositives} of ${reviewed} reviews were correct.`} />
          <Metric label="Recall" value={`${metrics.recall}%`} detail={`${metrics.truePositives} of ${actualAbuse} abuse cases were found.`} />
          <Metric label="F1 score" value={`${metrics.f1}%`} detail="One score balancing precision and recall." />
        </div>
      </section>

      <section className="test-evidence-grid">
        <div className="test-confusion-card">
          <div className="test-section-heading"><p>WHAT HAPPENED</p><h2>Every prediction, accounted for</h2></div>
          <div className="confusion-matrix" role="table" aria-label="Held-out test confusion matrix">
            <div className="matrix-corner" />
            <div role="columnheader">Sent to review</div><div role="columnheader">Not sent</div>
            <div role="rowheader">Actual abuse <small>{actualAbuse} cases</small></div>
            <div className="matrix-cell correct" role="cell"><strong>{metrics.truePositives}</strong><span>correctly found</span></div>
            <div className="matrix-cell missed" role="cell"><strong>{metrics.falseNegatives}</strong><span>missed</span></div>
            <div role="rowheader">Legitimate <small>{actualLegitimate} cases</small></div>
            <div className="matrix-cell false" role="cell"><strong>{metrics.falsePositives}</strong><span>false reviews</span></div>
            <div className="matrix-cell correct" role="cell"><strong>{metrics.trueNegatives}</strong><span>correctly cleared</span></div>
          </div>
        </div>

        <aside className="test-cost-card">
          <p>FALSE-POSITIVE COST</p><strong>₹{metrics.falsePositiveReviewCostInr.toLocaleString("en-IN")}</strong><span>{metrics.falsePositives} unnecessary reviews × ₹150 estimated staff cost</span><hr />
          <p>WHY IT MATTERS</p><span>High recall protects offer money. High precision keeps the review queue useful for the merchant team.</span>
        </aside>
      </section>

      <section className="test-method">
        <div className="test-section-heading"><p>FAIR TEST DESIGN</p><h2>Same rules. Different data.</h2></div>
        <div className="test-method-grid">
          <article><span>50 / 50</span><h3>Balanced labels</h3><p>Half of the held-out scenarios are coordinated abuse and half are legitimate activity.</p></article>
          <article><span>NO OVERLAP</span><h3>Separate identities</h3><p>Development and test data never share account IDs or browser, payment, identity, address, network, or referral fingerprints.</p></article>
          <article><span>REAL HARD CASES</span><h3>Legitimate sharing</h3><p>The test includes families, offices, shared devices, company cards, referrals, and fast legitimate activity.</p></article>
          <article><span>REPRODUCIBLE</span><h3>Fixed generation</h3><p>The scenario generator and random seeds are committed, so anyone can run the same evaluation again.</p></article>
        </div>
      </section>

      <footer className="test-results-footer"><div><b>Want to see what the detector found?</b><span>Open the 12-customer transitive ring in the visual demo.</span></div><Link href="/dashboard?guest=1&demo=1">Open visual demo <b>→</b></Link></footer>
    </div>
  </main>;
}

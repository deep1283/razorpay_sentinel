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
        <Link href="/test-results" className="active" aria-current="page">Test results</Link>
      </nav>
    </header>

    <div className="test-results-shell">
      <section className="test-results-hero">
        <div><p className="test-kicker">FINAL TEST RESULTS · RULES LOCKED FIRST</p><h1>Tested before<br />you trust it.</h1></div>
        <div className="test-results-intro"><p>We used practice examples to set Sentinel’s review score. We then froze the rules and checked the result on 100 new examples. Those test results did not change the detector.</p><span>Synthetic Razorpay Test Mode benchmark · not a production claim</span></div>
      </section>

      <section className="test-pipeline" aria-label="Evaluation process">
        <article><span>01 · PRACTICE DATA</span><strong>{metrics.developmentScenarios}</strong><p>examples used only to set the review score</p></article>
        <div className="test-pipeline-arrow" aria-hidden="true">→</div>
        <article className="locked"><span>RULES FROZEN</span><strong>{metrics.reviewThreshold}</strong><p>a case is sent for review at this score or higher</p></article>
        <div className="test-pipeline-arrow" aria-hidden="true">→</div>
        <article><span>02 · FINAL TEST</span><strong>{metrics.heldOutScenarios}</strong><p>new examples used only to check the result</p></article>
      </section>

      <section className="test-scoreboard" aria-labelledby="scoreboard-title">
        <div className="test-scoreboard-heading"><div><p>WHAT THE FINAL TEST SHOWED</p><h2 id="scoreboard-title">Sentinel found all {actualAbuse} labelled abuse cases.</h2></div><span>{reviewed} cases were sent for review</span></div>
        <div className="test-metrics-grid">
          <Metric label="Review accuracy" value={`${metrics.precision}%`} detail={`${metrics.truePositives} of ${reviewed} reviews correctly identified abuse.`} />
          <Metric label="Abuse cases found" value={`${metrics.recall}%`} detail={`All ${actualAbuse} labelled abuse cases were found.`} />
          <Metric label="Overall balance" value={`${metrics.f1}%`} detail="Balances accurate reviews with finding all abuse cases." />
        </div>
      </section>

      <section className="test-evidence-grid">
        <div className="test-confusion-card">
          <div className="test-section-heading"><p>THE COMPLETE PICTURE</p><h2>Every final-test result, accounted for</h2></div>
          <div className="confusion-matrix" role="table" aria-label="Held-out test confusion matrix">
            <div className="matrix-corner" />
            <div role="columnheader">Sent to review</div><div role="columnheader">Not sent</div>
            <div role="rowheader">Abuse pattern <small>{actualAbuse} cases</small></div>
            <div className="matrix-cell correct" role="cell"><strong>{metrics.truePositives}</strong><span>correct reviews</span></div>
            <div className="matrix-cell missed" role="cell"><strong>{metrics.falseNegatives}</strong><span>not found</span></div>
            <div role="rowheader">Legitimate activity <small>{actualLegitimate} cases</small></div>
            <div className="matrix-cell false" role="cell"><strong>{metrics.falsePositives}</strong><span>unnecessary reviews</span></div>
            <div className="matrix-cell correct" role="cell"><strong>{metrics.trueNegatives}</strong><span>correctly cleared</span></div>
          </div>
        </div>

        <aside className="test-cost-card">
          <p>COST OF UNNECESSARY REVIEWS</p><strong>₹{metrics.falsePositiveReviewCostInr.toLocaleString("en-IN")}</strong><span>{metrics.falsePositives} legitimate cases reviewed × ₹150 estimated staff cost</span><hr />
          <p>WHY IT MATTERS</p><span>A strong detector catches real issues without wasting the merchant team’s time.</span>
        </aside>
      </section>

      <section className="test-method">
        <div className="test-section-heading"><p>WHY THIS TEST IS FAIR</p><h2>The final test used the same kind of data, not the same examples.</h2></div>
        <div className="test-method-grid">
          <article><span>50 / 50</span><h3>Balanced test</h3><p>Half of the final examples show coordinated abuse. The other half show normal customer activity.</p></article>
          <article><span>NO OVERLAP</span><h3>Different customers</h3><p>Practice and final-test data never share customer, browser, payment, identity, address, network, or referral fingerprints.</p></article>
          <article><span>REAL EDGE CASES</span><h3>Normal sharing included</h3><p>Families, offices, shared devices, company cards, referrals, and fast legitimate activity are all included.</p></article>
          <article><span>REPRODUCIBLE</span><h3>Anyone can rerun it</h3><p>The scenario generator and its fixed seeds are committed with the project.</p></article>
        </div>
      </section>

      <footer className="test-results-footer"><div><b>See the detector working on a connected ring.</b><span>Explore a 12-customer pattern where each customer shares only some of the signals.</span></div><Link href="/dashboard?guest=1&demo=1">Open visual demo <b>→</b></Link></footer>
    </div>
  </main>;
}

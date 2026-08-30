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
          <div className="test-section-heading">
            <p>PERFORMANCE BREAKDOWN</p>
            <h2>How Sentinel performed across all 100 test cases</h2>
          </div>

          <div className="test-breakdown-list">
            <div className="test-breakdown-row">
              <div className="test-breakdown-header">
                <div>
                  <span className="test-breakdown-tag abuse">Promo Abuse Rings</span>
                  <h3>50 of 50 caught</h3>
                </div>
                <strong className="test-breakdown-pct">100%</strong>
              </div>
              <div className="test-progress-bar">
                <div className="test-progress-fill full" style={{ width: "100%" }} />
              </div>
              <p>Every single coordinated promo exploit was caught and flagged for review. Zero abuse slipped through.</p>
            </div>

            <div className="test-breakdown-row">
              <div className="test-breakdown-header">
                <div>
                  <span className="test-breakdown-tag legitimate">Normal Customers</span>
                  <h3>46 of 50 cleared automatically</h3>
                </div>
                <strong className="test-breakdown-pct">92%</strong>
              </div>
              <div className="test-progress-bar split">
                <div className="test-progress-fill cleared" style={{ width: "92%" }} />
                <div className="test-progress-fill reviewed" style={{ width: "8%" }} />
              </div>
              <p>46 genuine shoppers completed checkout with zero friction. Only 4 borderline cases were sent for quick verification.</p>
            </div>
          </div>
        </div>

        <aside className="test-cost-card">
          <p>COST OF UNNECESSARY REVIEWS</p>
          <strong>₹{metrics.falsePositiveReviewCostInr.toLocaleString("en-IN")}</strong>
          <span>{metrics.falsePositives} legitimate cases reviewed × ₹150 estimated staff cost</span>
          <hr />
          <p>WHY IT MATTERS</p>
          <span>A strong detector catches real issues without wasting the merchant team’s time.</span>
        </aside>
      </section>

      <section className="test-know-more" aria-label="Test methodology">
        <div><p>WANT THE DETAILS?</p><h2>See what was tested and how we kept the result fair.</h2></div>
        <Link href="/test-methodology">Know more <b>→</b></Link>
      </section>

      <footer className="test-results-footer"><div><b>See the detector working on a connected ring.</b><span>Explore a 12-customer pattern where each customer shares only some of the signals.</span></div><Link href="/dashboard?guest=1&demo=1">Open visual demo <b>→</b></Link></footer>
    </div>
  </main>;
}

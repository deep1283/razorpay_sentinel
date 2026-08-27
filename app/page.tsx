import { SentinelHero } from "@/components/ui/sentinel-hero";
import { CommerceShowcase } from "@/components/landing/commerce-showcase";

export default function LandingPage() {
  return (
    <main className="landing-root">
      <SentinelHero />
      <CommerceShowcase />
    </main>
  );
}

import { SentinelHero } from "@/components/ui/sentinel-hero";
import { WhatWeDoSection } from "@/components/landing/what-we-do-section";
import { GraphEngineSection } from "@/components/landing/graph-engine-section";
import { ContactSection } from "@/components/landing/contact-section";
import { FAQSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  return (
    <main className="landing-root">
      {/* 1. Fullscreen Hero Section with background and navigation */}
      <SentinelHero />

      {/* 2. What We Do: Light green background with visual demonstration cards */}
      <WhatWeDoSection />

      {/* 3. Graph Engine: How We Build the Graph */}
      <GraphEngineSection />

      {/* 4. Contact / Request Demo */}
      <ContactSection />

      {/* 5. Frequently Asked Questions */}
      <FAQSection />

      {/* 6. Modern Footer */}
      <LandingFooter />
    </main>
  );
}

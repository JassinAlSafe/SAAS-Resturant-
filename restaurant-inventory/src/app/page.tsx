"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";
import {
  Header,
  HeroSection,
  DashboardPreview,
  HowItWorksSection,
  FeaturesSection,
  TestimonialsSection,
  PricingSection,
  CTASection,
} from "@/components/landing-page";

export default function HomePage() {
  const { setTheme } = useTheme();

  // Force light theme on component mount
  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      <Header />
      <main>
        {/* Full-height hero section */}
        <div className="h-screen">
          <HeroSection />
        </div>

        {/* Rest of the content */}
        <div className="bg-[#FFFBF5] relative">
          <DashboardPreview />
          <HowItWorksSection />
          <FeaturesSection />
          <TestimonialsSection />
          <PricingSection />
          <CTASection />
        </div>
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Pricing from "@/components/marketing/Pricing";
import FAQ from "@/components/marketing/FAQ";
import FinalCTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";
import A from "@/components/marketing/AnimateOnScroll";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: "Rezlo Pricing — Free and Pro Plans for Job Seekers" },
  description:
    "Compare Rezlo's Free and Pro plans. Start building ATS-optimized resumes for free, upgrade for unlimited AI tailoring, outreach, and premium templates.",
  alternates: {
    canonical: `${siteConfig.url}/pricing`,
  },
  openGraph: {
    url: `${siteConfig.url}/pricing`,
    title: "Rezlo Pricing — Free and Pro Plans for Job Seekers",
    description:
      "Compare Rezlo's Free and Pro plans. Start building ATS-optimized resumes for free, upgrade for unlimited AI tailoring, outreach, and premium templates.",
  },
};

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Pricing />
        <A>
          <FAQ />
        </A>
        <A>
          <FinalCTA />
        </A>
      </main>
      <Footer />
    </div>
  );
}

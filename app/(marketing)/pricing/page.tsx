import type { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Pricing from "@/components/marketing/Pricing";
import FAQ from "@/components/marketing/FAQ";
import FinalCTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";
import A from "@/components/marketing/AnimateOnScroll";
import { siteConfig, pageOpenGraph, pageTwitter } from "@/config/site";
import { getPlanConfig } from "@/lib/subscription/planConfig";

const title = "Rezlo Pricing — Free and Pro Plans for Job Seekers";
const description =
  "Compare Rezlo's Free and Pro plans. Start building ATS-optimized resumes for free, upgrade for unlimited AI tailoring, outreach, and premium templates.";
const ogDescription =
  "Free and Pro plans for AI resume building, job tracking, and outreach. Compare and pick what fits.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: `${siteConfig.url}/pricing`,
  },
  openGraph: pageOpenGraph({ title, description: ogDescription, path: "/pricing" }),
  twitter: pageTwitter({ title, description }),
};

export default async function PricingPage() {
  const planConfig = await getPlanConfig();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Pricing
          proPriceInr={planConfig.proPriceInr}
          freeResumeLimit={planConfig.freeResumeLimit}
          freeAiGenerationLimit={planConfig.freeAiGenerationLimit}
        />
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

import Navbar from "@/components/marketing/Navbar";
import Features from "@/components/marketing/Features";
import AIFeatures from "@/components/marketing/AIFeatures";
import HowItWorks from "@/components/marketing/HowItWorks";
import BeforeAfter from "@/components/marketing/BeforeAfter";
import FinalCTA from "@/components/marketing/CTA";
import Footer from "@/components/landing/Footer";
import A from "@/components/marketing/AnimateOnScroll";

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Features />
        <A>
          <HowItWorks />
        </A>
        <A>
          <BeforeAfter />
        </A>
        <A>
          <AIFeatures />
        </A>
        <A>
          <FinalCTA />
        </A>
      </main>
      <Footer />
    </div>
  );
}

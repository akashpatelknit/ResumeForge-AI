import Navbar from "@/components/marketing/Navbar";
import Pricing from "@/components/marketing/Pricing";
import FAQ from "@/components/marketing/FAQ";
import FinalCTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";
import A from "@/components/marketing/AnimateOnScroll";

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

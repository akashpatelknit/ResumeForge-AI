import Header from "@/components/marketing/Header";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import HowItWorks from "@/components/marketing/HowItWorks";
import BeforeAfter from "@/components/marketing/BeforeAfter";
import TemplateShowcase from "@/components/marketing/TemplateShowcase";
import Stats from "@/components/marketing/Stats";
import Testimonials from "@/components/marketing/Testimonials";
import Integrations from "@/components/marketing/Integrations";
import FinalCTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";
import A from "@/components/marketing/AnimateOnScroll";
import LogoCloud from "@/components/marketing/LogoCloud";
import Pricing from "@/components/marketing/Pricing";
import FAQ from "@/components/marketing/FAQ";
import AIFeatures from "@/components/marketing/AIFeatures";

const Index = () => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <main className="flex-1">
      <Hero />
      <A>
        <LogoCloud />
      </A>
      <A>
        <Features />
      </A>
      <A>
        <HowItWorks />
      </A>
      <A>
        <BeforeAfter />
      </A>
      <A>
        <TemplateShowcase />
      </A>
      <A>
        <AIFeatures />
      </A>
      <A>
        <Stats />
      </A>
      <A>
        <Testimonials />
      </A>
      <A>
        <Pricing />
      </A>
      <A>
        <FAQ />
      </A>
      <A>
        <Integrations />
      </A>
      <A>
        <FinalCTA />
      </A>
    </main>
    <Footer />
  </div>
);

export default Index;

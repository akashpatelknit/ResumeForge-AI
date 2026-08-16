import Navbar from "@/components/marketing/Navbar";
import Stats from "@/components/marketing/Stats";
import Testimonials from "@/components/marketing/Testimonials";
import Integrations from "@/components/marketing/Integrations";
import LogoCloud from "@/components/marketing/LogoCloud";
import FinalCTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";
import A from "@/components/marketing/AnimateOnScroll";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <A>
          <LogoCloud />
        </A>
        <A>
          <Stats />
        </A>
        <A>
          <Testimonials />
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
}

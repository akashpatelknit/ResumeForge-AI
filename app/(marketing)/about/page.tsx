import type { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Stats from "@/components/marketing/Stats";
import Testimonials from "@/components/marketing/Testimonials";
import Integrations from "@/components/marketing/Integrations";
import LogoCloud from "@/components/marketing/LogoCloud";
import FinalCTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";
import A from "@/components/marketing/AnimateOnScroll";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: "About Rezlo — Our Mission to Help You Get Hired Faster" },
  description:
    "Rezlo builds AI-powered tools that help job seekers write ATS-optimized resumes, track applications, and land interviews faster. Learn what drives us.",
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
  openGraph: {
    url: `${siteConfig.url}/about`,
    title: "About Rezlo — Our Mission to Help You Get Hired Faster",
    description:
      "Rezlo builds AI-powered tools that help job seekers write ATS-optimized resumes, track applications, and land interviews faster. Learn what drives us.",
  },
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4 text-center lg:px-6">
            <h1 className="mx-auto mb-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              About <span className="text-gradient">Rezlo</span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              We build AI-powered tools that help job seekers write better resumes, apply
              faster, and land more interviews.
            </p>
          </div>
        </section>
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

import type { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Stats from "@/components/marketing/Stats";
import Testimonials from "@/components/marketing/Testimonials";
import Integrations from "@/components/marketing/Integrations";
import LogoCloud from "@/components/marketing/LogoCloud";
import FinalCTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";
import A from "@/components/marketing/AnimateOnScroll";
import { siteConfig, pageOpenGraph, pageTwitter } from "@/config/site";

const title = "About Rezlo — Our Mission to Help You Get Hired Faster";
const description =
  "Rezlo builds AI-powered tools that help job seekers write ATS-optimized resumes, track applications, and land interviews faster. Learn what drives us.";
const ogDescription =
  "Rezlo builds AI tools that help job seekers write standout resumes and land interviews faster.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
  openGraph: pageOpenGraph({ title, description: ogDescription, path: "/about" }),
  twitter: pageTwitter({ title, description }),
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

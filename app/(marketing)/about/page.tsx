import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/landing/Footer";
import A from "@/components/marketing/AnimateOnScroll";
import { Button } from "@/components/ui/button";
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

const stats = [
  { value: "10,000+", label: "Resumes created" },
  { value: "95%", label: "ATS pass rate" },
  { value: "3x", label: "Faster than traditional" },
  { value: "4.9★", label: "Average rating" },
];

const steps = [
  {
    number: 1,
    title: "Drop your resume",
    description: "Upload your existing resume in seconds — or build one from scratch.",
  },
  {
    number: 2,
    title: "AI analyzes and optimizes",
    description: "Our AI scores it against real job descriptions and tailors it for maximum impact.",
  },
  {
    number: 3,
    title: "Apply with confidence",
    description: "Download an ATS-ready resume and track every application in one place.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <section className="py-16 lg:py-20">
          <div className="container mx-auto max-w-2xl px-4 text-center lg:px-6">
            <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Helping people tell their <span className="text-gradient">story</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Rezlo was built to make job searching less painful — for everyone.
            </p>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              We believe your resume is more than a document — it&apos;s your story, your work, and your
              potential. Our AI removes the friction from resume writing and job applications so you can
              focus on what matters: landing the right opportunity.
            </p>
          </div>
        </section>

        <A>
          <section className="py-12">
            <div className="container mx-auto px-4 lg:px-6">
              <div className="mx-auto grid max-w-4xl grid-cols-2 divide-y divide-border sm:grid-cols-4 sm:divide-x sm:divide-y-0">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1 px-4 py-6 text-center">
                    <span className="text-3xl font-extrabold text-brand-purple sm:text-4xl">{s.value}</span>
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </A>

        <A>
          <section className="py-16 lg:py-20">
            <div className="container mx-auto px-4 lg:px-6">
              <h2 className="mb-12 text-center text-2xl font-bold tracking-tight sm:text-3xl">
                How it works
              </h2>

              <div className="relative mx-auto max-w-4xl">
                <div className="absolute left-0 right-0 top-6 hidden h-px bg-border sm:block" />
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
                  {steps.map((step) => (
                    <div key={step.number} className="relative flex flex-col items-center text-center">
                      <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-lg font-bold text-brand-purple">
                        {step.number}
                      </div>
                      <h3 className="mb-1.5 font-semibold">
                        {step.number}. {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </A>

        <A>
          <section className="pb-20 lg:pb-28">
            <div className="container mx-auto px-4 lg:px-6">
              <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-hero-soft px-6 py-14 text-center sm:px-12">
                <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">Ready to get started?</h2>
                <p className="mb-8 text-muted-foreground">
                  Join thousands of job seekers building better resumes and getting more interviews.
                </p>
                <Button asChild size="lg" className="bg-gradient-hero px-8 text-base font-semibold text-white hover:opacity-90">
                  <Link href="/">Try Rezlo</Link>
                </Button>
              </div>
            </div>
          </section>
        </A>
      </main>
      <Footer />
    </div>
  );
}

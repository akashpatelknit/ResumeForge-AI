"use client";

import { motion, useReducedMotion } from "framer-motion";
import Navbar from "@/components/marketing/Navbar";
import HeroIllustration from "@/components/landing/HeroIllustration";
import HeroHeading from "@/components/landing/HeroHeading";
import HeroSubtitle from "@/components/landing/HeroSubtitle";
import ResumeDropzone from "@/components/landing/ResumeDropzone";
import BuildFromScratch from "@/components/landing/BuildFromScratch";
import Footer from "@/components/landing/Footer";
import { useResumeUpload } from "@/hooks/useResumeUpload";

export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion();
  const upload = useResumeUpload();

  // Staggered entrance timings — navbar, illustration, heading, subtitle,
  // CTA each fade/slide in slightly after the last (see globals.css hero
  // motion system for the rest of the animation vocabulary these share).
  const enter = (delay: number) => ({
    initial: prefersReducedMotion ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      {/* Barely-visible ambient tint — the background should read as
          near-white, not colorful. Drifts extremely slowly so the page
          feels alive without the motion ever being obvious. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-150 w-150 -translate-x-1/2 rounded-full bg-brand-purple/4 blur-3xl animate-ambient-drift-a"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -left-40 h-120 w-120 rounded-full bg-brand-blue/3 blur-3xl animate-ambient-drift-b"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-20 -right-32 h-120 w-120 rounded-full bg-brand-pink/3 blur-3xl animate-ambient-drift-c"
      />

      <div className="relative z-10">
        <motion.div {...enter(0)}>
          <Navbar />
        </motion.div>
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 min-h-[70vh] sm:min-h-[72vh] sm:py-10 lg:min-h-[75vh]">
        <motion.div {...enter(0.15)} className="mb-8 w-full sm:mb-10">
          <HeroIllustration upload={upload} />
        </motion.div>

        <motion.div {...enter(0.3)}>
          <HeroHeading />
        </motion.div>

        <motion.div {...enter(0.45)} className="mb-8 sm:mb-10">
          <HeroSubtitle />
        </motion.div>

        <motion.div
          id="resume-dropzone"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut", delay: 0.08 }}
          className="w-full scroll-mt-28"
        >
          <ResumeDropzone upload={upload} />
        </motion.div>

        <motion.div {...enter(0.6)} className="mt-4">
          <BuildFromScratch />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

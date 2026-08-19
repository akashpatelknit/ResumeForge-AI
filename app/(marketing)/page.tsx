"use client";

import { motion, useReducedMotion } from "framer-motion";
import Navbar from "@/components/marketing/Navbar";
import FloatingResumePreview from "@/components/landing/FloatingResumePreview";
import HeroHeading from "@/components/landing/HeroHeading";
import HeroSubtitle from "@/components/landing/HeroSubtitle";
import ResumeDropzone from "@/components/landing/ResumeDropzone";
import BuildFromScratch from "@/components/landing/BuildFromScratch";
import Footer from "@/components/landing/Footer";
import { useResumeUpload } from "@/hooks/useResumeUpload";

export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion();
  const upload = useResumeUpload();

  // Staggered entrance — headline, subtitle, preview, dropzone, CTA each
  // fade/slide in ~90ms after the last, short individual durations (~500ms)
  // so the whole sequence reads as one calm, premium entrance rather than
  // a slow reveal.
  const enter = (delay: number) => ({
    initial: prefersReducedMotion ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white">
      {/* Barely-visible ambient wash, confined to the upper portion behind
          the headline only — purple/blue, no pink, and pulled in tight so
          the rest of the page reads as plain white. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-110 w-110 -translate-x-1/2 rounded-full bg-brand-purple/5 blur-3xl animate-ambient-drift-a"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/3 h-90 w-90 -translate-x-1/2 rounded-full bg-brand-blue/4 blur-3xl animate-ambient-drift-b"
      />

      <div className="relative z-10 shrink-0">
        <motion.div {...enter(0)}>
          <Navbar />
        </motion.div>
      </div>

      <main className="relative z-10 mx-auto flex max-w-300 flex-1 min-h-0 flex-col items-center justify-center px-4 pt-10 pb-10">
        <motion.div {...enter(0.09)}>
          <HeroHeading />
        </motion.div>

        <motion.div {...enter(0.18)} className="mt-9 mb-14">
          <HeroSubtitle />
        </motion.div>

        <motion.div {...enter(0.27)} className="mb-10 w-full">
          <FloatingResumePreview />
        </motion.div>

        <motion.div id="resume-dropzone" {...enter(0.36)} className="w-full scroll-mt-28">
          <ResumeDropzone upload={upload} />
        </motion.div>

        <motion.div {...enter(0.45)} className="mt-10">
          <BuildFromScratch />
        </motion.div>
      </main>

      <div className="shrink-0">
        <Footer />
      </div>
    </div>
  );
}

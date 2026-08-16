"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText } from "lucide-react";

const PHRASES = [
  "Uploading your file...",
  "Reading your resume...",
  "Extracting your experience...",
  "Almost done...",
];

// Shown inside the dropzone while the file is being extracted + parsed by
// Gemini. A spinning gradient ring + breathing glow read as "actively
// uploading/processing", and the scan line sweeping down the page icon
// keeps the "reading a document" motif for the extraction phase. The
// cycling caption gives a sense of progress through a call whose real
// duration isn't known upfront.
export default function LoadingResume() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => Math.min(i + 1, PHRASES.length - 1));
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="relative flex h-18 w-18 items-center justify-center">
        <div className="animate-glow-breathe absolute inset-0 rounded-full bg-linear-to-br from-brand-purple/30 to-brand-blue/20 blur-xl" />
        <div className="motion-reduce:animate-none absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-purple border-r-brand-blue" />
        <div className="relative flex h-13 w-13 items-center justify-center rounded-2xl bg-linear-to-br from-brand-purple to-brand-blue shadow-[0_8px_24px_rgba(124,58,237,0.25)]">
          <FileText className="h-6 w-6 text-white" strokeWidth={1.75} />
          <div className="absolute inset-x-2 top-2 bottom-2 overflow-hidden rounded-lg">
            <div className="animate-scan-line h-8 w-full bg-linear-to-b from-transparent via-white/50 to-transparent" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-base font-semibold text-foreground"
          >
            {PHRASES[phraseIndex]}
          </motion.p>
        </AnimatePresence>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
          <div className="animate-shimmer h-full w-full bg-linear-to-r from-transparent via-brand-purple to-transparent bg-size-[200%_100%]" />
        </div>
      </div>
    </div>
  );
}

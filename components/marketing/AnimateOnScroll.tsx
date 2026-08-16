"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  animation?: "fade-in" | "fade-in-left" | "fade-in-right" | "scale-in";
  delay?: number;
  threshold?: number;
}

const OFFSETS: Record<NonNullable<AnimateOnScrollProps["animation"]>, { x: number; y: number; scale: number }> = {
  "fade-in": { x: 0, y: 24, scale: 1 },
  "fade-in-left": { x: -32, y: 0, scale: 1 },
  "fade-in-right": { x: 32, y: 0, scale: 1 },
  "scale-in": { x: 0, y: 0, scale: 0.94 },
};

// Same public API as the previous IntersectionObserver-based version (used
// throughout /pricing, /about, /features via the `A` wrapper) — swapped the
// engine underneath to framer-motion's whileInView for a spring-based
// reveal instead of a linear CSS keyframe, which reads as noticeably more
// premium for the same call sites.
const AnimateOnScroll = ({
  children,
  className = "",
  animation = "fade-in",
  delay = 0,
  threshold = 0.15,
}: AnimateOnScrollProps) => {
  const prefersReducedMotion = useReducedMotion();
  const offset = OFFSETS[animation];

  const variants: Variants = {
    hidden: { opacity: 0, x: offset.x, y: offset.y, scale: offset.scale },
    visible: { opacity: 1, x: 0, y: 0, scale: 1 },
  };

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      variants={variants}
      transition={{ type: "spring", stiffness: 120, damping: 20, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
};

export default AnimateOnScroll;

"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Award, Briefcase, Code2, Upload, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumeUpload } from "@/hooks/useResumeUpload";

// Coordinate system for the whole diagram — every node/line below is
// expressed in this space, then converted to percentages so the diagram
// scales with its container while staying pixel-accurate (the container's
// aspect ratio is locked to VIEW_W:VIEW_H via the aspect-[...] class below).
const VIEW_W = 720;
const VIEW_H = 280;

const pctX = (x: number) => `${(x / VIEW_W) * 100}%`;
const pctY = (y: number) => `${(y / VIEW_H) * 100}%`;
const pctW = (w: number) => `${(w / VIEW_W) * 100}%`;
const pctH = (h: number) => `${(h / VIEW_H) * 100}%`;

type Shape = "square" | "circle";

interface Node {
  cx: number;
  cy: number;
  size: number;
  shape: Shape;
  className: string;
  icon: React.ReactNode;
  interactive?: boolean;
  // Independent idle motion so the six nodes don't read as one synchronized
  // group — each gets its own animation, duration and delay.
  animClass?: string;
  animDuration?: number;
  animDelay?: number;
}

const CENTER: Node = {
  cx: 360,
  cy: 140,
  size: 110,
  shape: "square",
  className: "bg-linear-to-br from-brand-purple to-brand-blue",
  icon: <Upload className="h-11 w-11 text-white" strokeWidth={1.6} />,
  interactive: true,
};

const decorativeNodes: Node[] = [
  // Left — same height as center, straight connector (mirrors the
  // reference's left photo node)
  {
    cx: 70,
    cy: 140,
    size: 64,
    shape: "circle",
    className: "bg-linear-to-br from-slate-300 to-slate-400",
    icon: <User className="h-6 w-6 text-white" strokeWidth={1.75} />,
    animClass: "animate-hero-icon-float",
    animDuration: 4.5,
    animDelay: 0,
  },
  // Top-left — Skills
  {
    cx: 185,
    cy: 55,
    size: 56,
    shape: "square",
    className: "bg-amber-400",
    icon: <Zap className="h-6 w-6 text-white" strokeWidth={1.75} />,
    animClass: "animate-hero-icon-float",
    animDuration: 3.2,
    animDelay: 0.2,
  },
  // Bottom-left — Experience
  {
    cx: 195,
    cy: 225,
    size: 56,
    shape: "square",
    className: "bg-sky-400",
    icon: <Briefcase className="h-6 w-6 text-white" strokeWidth={1.75} />,
    animClass: "animate-hero-icon-float-x",
    animDuration: 3.5,
    animDelay: 0.4,
  },
  // Top-right — Achievements
  {
    cx: 535,
    cy: 55,
    size: 56,
    shape: "square",
    className: "bg-orange-400",
    icon: <Award className="h-6 w-6 text-white" strokeWidth={1.75} />,
    animClass: "animate-hero-icon-rotate",
    animDuration: 4.2,
    animDelay: 0.1,
  },
  // Bottom-right — placeholder profile
  {
    cx: 525,
    cy: 225,
    size: 56,
    shape: "circle",
    className: "bg-linear-to-br from-slate-300 to-slate-400",
    icon: <User className="h-5 w-5 text-white" strokeWidth={1.75} />,
    animClass: "animate-hero-icon-float",
    animDuration: 4,
    animDelay: 0.3,
  },
  // Far right — Projects
  {
    cx: 650,
    cy: 140,
    size: 64,
    shape: "square",
    className: "bg-violet-300",
    icon: <Code2 className="h-6 w-6 text-white" strokeWidth={1.75} />,
    animClass: "animate-hero-icon-float",
    animDuration: 3.8,
    animDelay: 0.5,
  },
];

// Each line runs from an outer node's inner edge to the center node's edge;
// a small dot sits at the midpoint, matching the reference's line-junction
// connectors.
const lines = [
  { x1: 102, y1: 140, x2: 305, y2: 140 }, // left avatar -> center
  { x1: 213, y1: 83, x2: 305, y2: 115 }, // skills -> center
  { x1: 223, y1: 197, x2: 305, y2: 165 }, // experience -> center
  { x1: 415, y1: 115, x2: 507, y2: 83 }, // center -> achievements
  { x1: 415, y1: 165, x2: 497, y2: 197 }, // center -> bottom-right avatar
  { x1: 415, y1: 140, x2: 618, y2: 140 }, // center -> projects
];

// A handful of low-opacity data particles drifting around the illustration
// — deliberately a static, hand-placed set (not Math.random()) so SSR and
// client markup match exactly and there's no hydration mismatch.
const particles = [
  { left: "8%", top: "20%", size: 3, color: "bg-brand-purple/30", duration: 7, delay: 0, tx: 6, ty: -8 },
  { left: "15%", top: "72%", size: 2, color: "bg-brand-blue/25", duration: 8.5, delay: 1.2, tx: -5, ty: 6 },
  { left: "28%", top: "12%", size: 3, color: "bg-brand-purple/25", duration: 6.5, delay: 0.6, tx: 4, ty: 7 },
  { left: "35%", top: "86%", size: 2, color: "bg-brand-blue/20", duration: 9, delay: 2, tx: -6, ty: -5 },
  { left: "50%", top: "6%", size: 4, color: "bg-brand-purple/20", duration: 7.5, delay: 0.3, tx: 5, ty: 6 },
  { left: "48%", top: "94%", size: 2, color: "bg-brand-blue/25", duration: 6, delay: 1.5, tx: -4, ty: -7 },
  { left: "65%", top: "14%", size: 3, color: "bg-brand-blue/25", duration: 8, delay: 0.9, tx: 6, ty: -6 },
  { left: "72%", top: "80%", size: 2, color: "bg-brand-purple/25", duration: 7, delay: 2.4, tx: -5, ty: 5 },
  { left: "85%", top: "22%", size: 3, color: "bg-brand-blue/20", duration: 9.5, delay: 0.5, tx: 4, ty: 8 },
  { left: "90%", top: "68%", size: 2, color: "bg-brand-purple/30", duration: 6.8, delay: 1.8, tx: -6, ty: -4 },
  { left: "20%", top: "45%", size: 2, color: "bg-brand-purple/20", duration: 8.2, delay: 1, tx: 5, ty: -5 },
  { left: "78%", top: "48%", size: 3, color: "bg-brand-blue/20", duration: 7.2, delay: 2.1, tx: -4, ty: 6 },
];

interface HeroIllustrationProps {
  upload: ResumeUpload;
}

// The center node drives the exact same shared upload state as the main
// dropzone (see hooks/useResumeUpload.ts) — clicking or dropping a file on
// it triggers the real parse flow, and the result plays out in the
// dropzone below, scrolled into view.
export default function HeroIllustration({ upload }: HeroIllustrationProps) {
  const prefersReducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { status, isDragOver, handleDrop, handleDragEnter, handleDragLeave, handleDragOver, handleInputChange } =
    upload;

  const isBusy = status === "uploading" || status === "gated";
  const showActiveDrag = isDragOver && !isBusy;

  const scrollToDropzone = () => {
    document.getElementById("resume-dropzone")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleCenterClick = () => {
    if (isBusy) return;
    inputRef.current?.click();
  };

  const handleCenterKeyDown = (e: React.KeyboardEvent) => {
    if (!isBusy && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      handleCenterClick();
    }
  };

  const handleCenterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
    scrollToDropzone();
  };

  const handleCenterDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDrop(e);
    scrollToDropzone();
  };

  // Cursor parallax — the central element and the ring of icons drift a
  // few px toward the pointer. Driven by CSS custom properties set
  // directly on the DOM node (no re-render per mousemove) and eased with
  // a CSS transition, so it stays cheap and GPU-friendly. Skipped
  // entirely under reduced motion.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty("--px", `${nx * 16}px`);
    el.style.setProperty("--py", `${ny * 16}px`);
    el.style.setProperty("--px-sm", `${nx * 8}px`);
    el.style.setProperty("--py-sm", `${ny * 8}px`);
  };

  const handleMouseLeave = () => {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty("--px", "0px");
    el.style.setProperty("--py", "0px");
    el.style.setProperty("--px-sm", "0px");
    el.style.setProperty("--py-sm", "0px");
  };

  return (
    <motion.div
      ref={containerRef}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative mx-auto w-full max-w-131 aspect-720/280 sm:max-w-147 md:max-w-159 lg:max-w-189"
    >
      {/* Soft blurred glow anchored behind the center node — breathes
          slowly and brightens a touch on hover. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-70 w-70 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl animate-glow-breathe"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.10), rgba(79,70,229,0.04), transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-70 w-70 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-70"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.14), rgba(236,72,153,0.05), transparent 65%)",
        }}
      />

      {/* Ambient data particles */}
      {!prefersReducedMotion &&
        particles.map((p, i) => (
          <div
            key={i}
            aria-hidden
            className={cn("absolute rounded-full blur-[1px] animate-hero-particle", p.color)}
            style={
              {
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                "--particle-x": `${p.tx}px`,
                "--particle-y": `${p.ty}px`,
              } as React.CSSProperties
            }
          />
        ))}

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {lines.map((line, i) => {
          const midX = (line.x1 + line.x2) / 2;
          const midY = (line.y1 + line.y2) / 2;
          // Data travels from the outer node toward the center — figure
          // out which endpoint is which so the flow direction is always
          // "inward", regardless of how x1/y1 vs x2/y2 happen to be listed.
          const dOuterFirst = Math.hypot(line.x1 - CENTER.cx, line.y1 - CENTER.cy);
          const dOuterSecond = Math.hypot(line.x2 - CENTER.cx, line.y2 - CENTER.cy);
          const outer = dOuterFirst > dOuterSecond ? { x: line.x1, y: line.y1 } : { x: line.x2, y: line.y2 };
          const inner = dOuterFirst > dOuterSecond ? { x: line.x2, y: line.y2 } : { x: line.x1, y: line.y1 };
          const travelPath = `M ${outer.x} ${outer.y} L ${inner.x} ${inner.y}`;

          return (
            <g key={i}>
              <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#E5E5E5" strokeWidth={1.5} />
              <circle
                cx={midX}
                cy={midY}
                r={3.5}
                fill="#A855F7"
                className="transition-transform duration-300 group-hover:scale-125"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
              {!prefersReducedMotion && (
                <circle r={2.5} fill={i % 2 === 0 ? "#A855F7" : "#6366F1"} opacity={0}>
                  <animateMotion
                    path={travelPath}
                    dur="2.4s"
                    begin={`${i * 0.35}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.15;0.75;1"
                    dur="2.4s"
                    begin={`${i * 0.35}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      <div
        className="absolute inset-0 transition-transform duration-200 ease-out"
        style={{ transform: "translate(var(--px-sm, 0px), var(--py-sm, 0px))" }}
      >
        {decorativeNodes.map((node, i) => (
          <div
            key={i}
            aria-hidden
            className={cn(
              "absolute flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
              node.shape === "circle" ? "rounded-full" : "rounded-2xl",
              node.className,
              !prefersReducedMotion && node.animClass,
            )}
            style={{
              left: pctX(node.cx - node.size / 2),
              top: pctY(node.cy - node.size / 2),
              width: pctW(node.size),
              height: pctH(node.size),
              animationDuration: node.animDuration ? `${node.animDuration}s` : undefined,
              animationDelay: node.animDelay ? `${node.animDelay}s` : undefined,
            }}
          >
            {node.icon}
          </div>
        ))}
      </div>

      {/* Pulsing "click me" ring — the only sustained motion in the
          illustration, and only while there's actually something to click. */}
      {!isBusy && !prefersReducedMotion && (
        <motion.div
          aria-hidden
          className="absolute rounded-2xl bg-brand-purple"
          style={{
            left: pctX(CENTER.cx - CENTER.size / 2),
            top: pctY(CENTER.cy - CENTER.size / 2),
            width: pctW(CENTER.size),
            height: pctH(CENTER.size),
          }}
          animate={{ scale: [1, 1.35, 1.35], opacity: [0.35, 0, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      )}

      <div
        className="absolute transition-transform duration-200 ease-out"
        style={{
          left: pctX(CENTER.cx - CENTER.size / 2),
          top: pctY(CENTER.cy - CENTER.size / 2),
          width: pctW(CENTER.size),
          height: pctH(CENTER.size),
          transform: "translate(var(--px, 0px), var(--py, 0px))",
        }}
      >
        <motion.div
          role="button"
          tabIndex={isBusy ? -1 : 0}
          aria-label="Upload your resume"
          onClick={handleCenterClick}
          onKeyDown={handleCenterKeyDown}
          onDrop={handleCenterDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          whileHover={!isBusy ? { scale: 1.08 } : undefined}
          whileTap={!isBusy ? { scale: 0.96 } : undefined}
          animate={
            isBusy || prefersReducedMotion
              ? { y: 0, scale: 1, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }
              : showActiveDrag
                ? { y: 0, scale: 1.08, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }
                : {
                    y: [0, -8, 0],
                    scale: [1, 1, 1.03, 1, 1],
                    boxShadow: [
                      "0 8px 24px rgba(0,0,0,0.08)",
                      "0 8px 24px rgba(0,0,0,0.08)",
                      "0 8px 32px rgba(0,0,0,0.10), 0 0 32px rgba(124,58,237,0.35)",
                      "0 8px 24px rgba(0,0,0,0.08)",
                      "0 8px 24px rgba(0,0,0,0.08)",
                    ],
                  }
          }
          transition={
            isBusy || showActiveDrag || prefersReducedMotion
              ? { duration: 0.2 }
              : {
                  y: { duration: 3.6, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.46, 0.56, 1] },
                  boxShadow: { duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.46, 0.56, 1] },
                }
          }
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-2xl",
            "bg-linear-to-br from-brand-purple to-brand-blue",
            isBusy ? "cursor-not-allowed opacity-70" : "cursor-pointer",
            showActiveDrag && "ring-4 ring-brand-purple/25",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            className="sr-only"
            onChange={handleCenterInputChange}
            disabled={isBusy}
          />
          {CENTER.icon}
        </motion.div>
      </div>
    </motion.div>
  );
}

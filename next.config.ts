import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the Dockerfile's multi-stage build: produces a minimal
  // .next/standalone folder with only the files needed to run `next start`,
  // instead of requiring the full node_modules tree in the runtime image.
  // Only matters for container deploys; has no effect on Vercel.
  output: "standalone",
  // pdf-parse (lib/textExtraction/extractResumeText.ts) is built on
  // pdfjs-dist, which loads its worker script from its own package
  // directory at runtime. Bundling it into the Turbopack/webpack server
  // chunk breaks that lookup ("Cannot find module .../pdf.worker.mjs") —
  // keeping it external makes it run straight from node_modules instead.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;

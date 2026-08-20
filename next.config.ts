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
  //
  // @napi-rs/canvas is pdfjs-dist's native-binary DOMMatrix/ImageData/
  // Path2D polyfill source in Node — it's a compiled .node addon, so
  // bundling it would break it the same way. It was previously only a
  // transitive dependency of pdf-parse; Vercel's automatic file tracing
  // doesn't reliably find native binaries resolved dynamically that deep,
  // which is what caused "Cannot find module '@napi-rs/canvas'" in
  // production. Now a direct dependency (see package.json) with its
  // module excluded here, same as its siblings above.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@napi-rs/canvas"],
};

export default nextConfig;

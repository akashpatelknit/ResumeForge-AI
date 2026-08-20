import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the Dockerfile's multi-stage build: produces a minimal
  // .next/standalone folder with only the files needed to run `next start`,
  // instead of requiring the full node_modules tree in the runtime image.
  // Only matters for container deploys; has no effect on Vercel.
  output: "standalone",
};

export default nextConfig;

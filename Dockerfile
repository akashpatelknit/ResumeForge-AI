# ResumeForge AI — container image with Tectonic (for /api/compile-latex)
#
# IMPORTANT — deployment target: the README documents a Vercel deploy, but
# Vercel's serverless Node functions cannot apt-get/install a system binary
# like Tectonic at request time, and can't easily persist Tectonic's package
# cache across invocations either. This Dockerfile targets a real container
# host instead (Fly.io, Railway, Render, ECS/Fargate, a plain VM, etc.).
# If you want to keep the rest of the app on Vercel, the practical split is:
# deploy this image as a small standalone service that only serves
# /api/compile-latex, and have the Vercel-hosted app call it over HTTPS —
# that's an architecture decision worth making deliberately, not a change
# this Dockerfile makes for you.
#
# CLI flags verified against a real local install (`brew install tectonic`,
# v0.17.0 on macOS/arm64): --outdir, --reruns, --untrusted, and the
# lib/latex/compile.ts invocation all confirmed working end-to-end,
# including the on-first-run bundle download this Dockerfile's warm-up
# step below is designed to pre-populate. Still NOT verified: this exact
# multi-stage Dockerfile hasn't been through a real `docker build` in this
# session, so the GitHub Releases asset filename pattern for
# x86_64-unknown-linux-gnu (resolved dynamically via the GitHub API below,
# specifically to avoid hardcoding a version that could go stale) should
# get one real smoke-test build before you rely on it in production.

# ---- deps -------------------------------------------------------------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder ------------------------------------------------------------
FROM node:20-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL is required at build time only because prisma.config.ts loads
# it eagerly; no real database connection is made during `prisma generate`.
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db"
RUN npm run build

# ---- tectonic -------------------------------------------------------------
# Isolated into its own stage so the (slow, network-dependent) download and
# cache warm-up is cached by Docker independently of app source changes.
FROM node:20-bookworm-slim AS tectonic
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl ca-certificates jq \
      # Tectonic's runtime library dependencies (freetype/fontconfig/graphite
      # for font handling, harfbuzz for text shaping, openssl for its HTTP
      # bundle fetch on cache-miss).
      libfontconfig1 libfreetype6 libgraphite2-3 libharfbuzz0b libssl3 \
  && rm -rf /var/lib/apt/lists/*

RUN TECTONIC_URL=$(curl -fsSL https://api.github.com/repos/tectonic-typesetting/tectonic/releases/latest \
      | jq -r '[.assets[] | select(.name | test("x86_64-unknown-linux-gnu.*\\.tar\\.gz$"))][0].browser_download_url') \
    && test -n "$TECTONIC_URL" && test "$TECTONIC_URL" != "null" \
    && curl -fsSL "$TECTONIC_URL" -o /tmp/tectonic.tar.gz \
    && tar -xzf /tmp/tectonic.tar.gz -C /usr/local/bin \
    && chmod +x /usr/local/bin/tectonic \
    && rm /tmp/tectonic.tar.gz

# Fixed cache home — must match TECTONIC_CACHE_HOME (lib/latex/compile.ts)
# and the HOME the runner stage sets for the compile subprocess. Warming it
# here means a correctly-deployed container should need zero outbound
# network access per compile request (Tectonic only hits the network on a
# bundle cache miss).
ENV HOME=/home/tectonic
RUN mkdir -p /home/tectonic && chmod 777 /home/tectonic
RUN printf '\\documentclass{article}\\begin{document}warmup\\end{document}\\n' > /tmp/warmup.tex \
    && tectonic --outdir /tmp --untrusted /tmp/warmup.tex \
    && rm -f /tmp/warmup.tex /tmp/warmup.pdf

# ---- runner ---------------------------------------------------------------
FROM node:20-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
      openssl ca-certificates \
      libfontconfig1 libfreetype6 libgraphite2-3 libharfbuzz0b libssl3 \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=tectonic /usr/local/bin/tectonic /usr/local/bin/tectonic
COPY --from=tectonic /home/tectonic /home/tectonic
RUN chown -R nextjs:nodejs /home/tectonic

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Must match the ENV HOME set in the tectonic stage above.
ENV TECTONIC_CACHE_HOME=/home/tectonic

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

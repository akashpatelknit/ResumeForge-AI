#!/usr/bin/env bash
# One-shot bootstrap for the Schedule Outreach worker on a fresh Oracle
# Cloud "Always Free" Ubuntu instance. Run this ON THE VM (after SSH-ing
# in), not locally. Idempotent-ish — safe to re-run after a `git pull` to
# pick up new dependencies, but the systemd install step at the bottom only
# needs to run once (or after editing the .service file).
#
# Usage (on the VM):
#   git clone <your-repo-url> resumeforge && cd resumeforge
#   nano .env   # paste in the same env vars used on Vercel/Render (see
#               # .env.example — DATABASE_URL, DIRECT_URL, REDIS_URL,
#               # AI_PROVIDER, OPENAI_API_KEY (or GEMINI_API_KEY), GOOGLE_*,
#               # ENCRYPTION_KEY, CLERK_SECRET_KEY)
#   bash deploy/oracle-cloud/setup.sh

set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node.js 24.x via NodeSource..."
  curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "Node: $(node --version)"
echo "npm:  $(npm --version)"

if [ ! -f .env ]; then
  echo "ERROR: .env not found in $(pwd). Create it first (see comment above) before running this script."
  exit 1
fi

echo "Installing dependencies..."
npm install

REPO_DIR="$(pwd)"
SERVICE_FILE="/etc/systemd/system/resumeforge-worker.service"

echo "Installing systemd service (requires sudo)..."
sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=ResumeForge AI - Schedule Outreach worker
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=${REPO_DIR}
EnvironmentFile=${REPO_DIR}/.env
ExecStart=$(command -v npm) run worker
Restart=on-failure
RestartSec=5
User=$(whoami)

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now resumeforge-worker

echo ""
echo "Done. Check status with:"
echo "  sudo systemctl status resumeforge-worker"
echo "Tail logs with:"
echo "  journalctl -u resumeforge-worker -f"

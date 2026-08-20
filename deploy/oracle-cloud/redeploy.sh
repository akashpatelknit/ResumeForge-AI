#!/usr/bin/env bash
# Run ON THE VM, from the repo directory, whenever you've pushed new
# commits and want the worker to pick them up. There's no git-push-to-deploy
# here (unlike Render/Vercel) — this is the manual equivalent.
set -euo pipefail

git pull
npm install
sudo systemctl restart resumeforge-worker

echo "Restarted. Tail logs with: journalctl -u resumeforge-worker -f"

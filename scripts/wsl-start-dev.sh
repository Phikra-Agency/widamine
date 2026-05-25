#!/usr/bin/env bash
# Start Widamine dev stack on WSL (run from WSL terminal)
set -euo pipefail
PR="$(cd "$(dirname "$0")/.." && pwd)"

bash "$PR/start-mongodb.sh"

# Kill stale dev processes if any
pkill -f 'nest.js start --watch' 2>/dev/null || true
pkill -f 'vite/bin/vite.js' 2>/dev/null || true
sleep 1

if ! ss -tlnp 2>/dev/null | grep -q ':3000'; then
  cd "$PR/backend"
  setsid npm run start:dev > "$HOME/widamine-backend.log" 2>&1 < /dev/null &
  echo "Backend starting (log: ~/widamine-backend.log) — first boot on /mnt/c can take 2–3 min"
else
  echo "Backend already listening on :3000"
fi

if ! ss -tlnp 2>/dev/null | grep -q ':5173'; then
  cd "$PR/frontend"
  setsid npm run dev > "$HOME/widamine-frontend.log" 2>&1 < /dev/null &
  echo "Frontend starting (log: ~/widamine-frontend.log)"
else
  echo "Frontend already listening on :5173"
fi

echo ""
echo "URLs: http://localhost:5173  |  API http://localhost:3000"
echo "Login: admin@widamine.com / admin123"
echo "Check: bash scripts/wsl-healthcheck.sh"

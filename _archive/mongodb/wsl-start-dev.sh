#!/usr/bin/env bash
# Start Widamine dev stack on WSL (run from WSL terminal)
set -euo pipefail
PR="$(cd "$(dirname "$0")/.." && pwd)"

bash "$PR/start-mongodb.sh"

pkill -f 'nest start --watch' 2>/dev/null || true
pkill -f 'vite --port' 2>/dev/null || true
sleep 1

cd "$PR"
if ! ss -tlnp 2>/dev/null | grep -q ':3000'; then
  setsid npm run dev --workspace=widamine-api > "$HOME/widamine-api.log" 2>&1 < /dev/null &
  echo "API starting (log: ~/widamine-api.log)"
else
  echo "API already listening on :3000"
fi

if ! ss -tlnp 2>/dev/null | grep -q ':5174'; then
  setsid npm run dev --workspace=widamine-admin > "$HOME/widamine-admin.log" 2>&1 < /dev/null &
  echo "Admin starting (log: ~/widamine-admin.log)"
else
  echo "Admin already listening on :5174"
fi

if ! ss -tlnp 2>/dev/null | grep -q ':5173'; then
  setsid npm run dev --workspace=widamine-landing > "$HOME/widamine-landing.log" 2>&1 < /dev/null &
  echo "Landing starting (log: ~/widamine-landing.log)"
else
  echo "Landing already listening on :5173"
fi

echo ""
echo "URLs: landing http://localhost:5173 | admin http://localhost:5174 | API http://localhost:3000"
echo "Login: admin@widamine.com / admin123"
echo "Check: bash scripts/wsl-healthcheck.sh"

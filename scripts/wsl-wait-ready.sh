#!/usr/bin/env bash
PR="$(cd "$(dirname "$0")/.." && pwd)"
for i in $(seq 1 24); do
  if bash "$PR/scripts/wsl-healthcheck.sh" 2>/dev/null; then
    echo "Ready after attempt $i"
    exit 0
  fi
  echo "Attempt $i/24 — waiting 15s..."
  sleep 15
done
echo "Services not ready after 6 minutes. Check ~/widamine-api.log"
exit 1

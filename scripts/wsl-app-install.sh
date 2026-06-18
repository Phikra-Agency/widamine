#!/usr/bin/env bash
set -euo pipefail
PR="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -f "$PR/api/.env" ]]; then
  cp "$PR/api/.env.example" "$PR/api/.env"
  sed -i 's/your-jwt-secret-here/widamine_jwt_secret_dev_alae_2026/' "$PR/api/.env"
fi

cd "$PR"
npm install --legacy-peer-deps
npm run db:generate
npm run db:seed

echo "App install done."

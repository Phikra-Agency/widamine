#!/usr/bin/env bash
set -euo pipefail
PR="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -f "$PR/backend/.env" ]]; then
  cp "$PR/backend/.env.example" "$PR/backend/.env"
  sed -i 's/your-jwt-secret-here/widamine_jwt_secret_dev_alae_2026/' "$PR/backend/.env"
fi

if [[ ! -f "$PR/frontend/.env" ]]; then
  echo 'VITE_PUBLIC_API_URL="/api"' > "$PR/frontend/.env"
fi

cd "$PR/backend"
npm install --legacy-peer-deps
npx prisma generate
npm run seed

cd "$PR/frontend"
npm install --legacy-peer-deps

echo "App install done."

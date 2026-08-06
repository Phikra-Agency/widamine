#!/bin/bash

TOKEN="13|9ayxZzBxwNBiAWHHjsDaplxHFHzAvEcrBIzx98Mod11255ac"
BASE_URL="https://server.wa-pharma.com/api/v1"

echo "🔍 Monitoring Coolify Deployments..."
echo

# Check API
API_STATUS=$(curl -s "$BASE_URL/deployments/or8p23papokzz63xeloulu6i" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.status')
echo "API (or8p23papokzz63xeloulu6i): $API_STATUS"

# Check Landing
LANDING_STATUS=$(curl -s "$BASE_URL/deployments/t1ly1zfu7as7pl2bfv7qyyvj" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.status')
echo "Landing (t1ly1zfu7as7pl2bfv7qyyvj): $LANDING_STATUS"

# Check Admin
ADMIN_STATUS=$(curl -s "$BASE_URL/deployments/by5r0uibpkx9beft80q7hubk" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.status')
echo "Admin (by5r0uibpkx9beft80q7hubk): $ADMIN_STATUS"

echo
echo "Run './verify-deployment.sh' once all deployments are 'finished'"

#!/bin/bash
set -e

echo "🚀 Deploying Widamine to Production (Coolify)"
echo "=============================================="
echo ""

# Make sure we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "⚠️  You're on branch '$current_branch', switching to 'main'..."
    git checkout main
fi

# Push main branch
echo "📤 Pushing to main branch..."
git push origin main

# Force update latest branch to match main
echo "📤 Syncing 'latest' branch with 'main' for Coolify deployment..."
git push origin main:latest --force

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "🔄 Triggering Coolify deployment..."

# Trigger deployment via Coolify API
deployment_uuid=$(curl -s -X POST "https://server.wa-pharma.com/api/v1/deploy" \
  -H "Authorization: Bearer 14|1H6vKPGNER1jHNWpkrPQqlqXtoCOtpQtBJqvamrX1cf3d7f7" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"uuid":"tyfa0ow9za5ohqn69dh9zhh4","force":false}' | jq -r '.deployments[0].deployment_uuid')

echo "✅ Deployment triggered: $deployment_uuid"
echo ""
echo "⏳ Waiting 90 seconds for deployment to complete..."
sleep 90

echo ""
echo "🔍 Running verification..."
./verify-deployment.sh

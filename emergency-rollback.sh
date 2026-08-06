#!/bin/bash
set -e

echo "🚨 EMERGENCY ROLLBACK - Widamine API"
echo "====================================="
echo ""
echo "This will rollback to commit 6aca051 (before category changes broke the API)"
echo ""
read -p "Press ENTER to continue or Ctrl+C to cancel..."

cd /home/alae/Documents/repos/widamine

# Rollback to last known working commit
git checkout 6aca051

# Force push to latest branch (what Coolify deploys)
git push origin HEAD:latest --force

echo ""
echo "✅ Rollback complete!"
echo ""
echo "Now go to Coolify UI and click 'Restart' on the API application."
echo "Or run this command to trigger deployment:"
echo ""
echo "curl -X POST 'https://server.wa-pharma.com/api/v1/deploy' \\"
echo "  -H 'Authorization: Bearer 14|1H6vKPGNER1jHNWpkrPQqlqXtoCOtpQtBJqvamrX1cf3d7f7' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"uuid\":\"tyfa0ow9za5ohqn69dh9zhh4\",\"force\":false}'"

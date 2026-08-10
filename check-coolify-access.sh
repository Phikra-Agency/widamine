#!/bin/bash

echo "🔍 Checking Coolify GitHub Access"
echo "=================================="
echo ""

# Check if the latest commit is on GitHub
echo "📝 Latest commit on main branch:"
git log --oneline origin/main | head -1

echo ""
echo "📊 Repository info:"
curl -s -H "Authorization: token $GH_TOKEN" \
  "https://api.github.com/repos/Phikra-Agency/widamine" | jq '{name, private, default_branch, pushed_at}'

echo ""
echo "🔑 To fix Coolify deployment:"
echo "1. Go to: https://server.wa-pharma.com"
echo "2. Navigate to: Applications → widamine:admin"
echo "3. Click on: Source/Git Configuration"
echo "4. Check/Update:"
echo "   - GitHub token is valid"
echo "   - Branch is set to: latest (or main)"
echo "   - Repository URL: Phikra-Agency/widamine"
echo ""
echo "5. Try manual deployment:"
echo "   - Click 'Deploy' button in Coolify dashboard"
echo "   - Check deployment logs for errors"

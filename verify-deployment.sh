#!/bin/bash

echo "=================================="
echo "   Widamine Deployment Verification"
echo "=================================="
echo

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check API
echo "🔍 Checking API..."
API_RESPONSE=$(curl -s https://api.widamineaestheticcenter.com/public/motifs)
API_CATEGORY=$(echo "$API_RESPONSE" | jq -r '.[0].category' 2>/dev/null)

if [ "$API_CATEGORY" = "visage" ]; then
    echo -e "${GREEN}✅ API: Category field working${NC}"
    echo "   First service category: $API_CATEGORY"
else
    echo -e "${RED}❌ API: Category field NOT working${NC}"
    echo "   Expected: 'visage', Got: '$API_CATEGORY'"
fi

# Count services by category
VISAGE_COUNT=$(echo "$API_RESPONSE" | jq '[.[] | select(.category == "visage")] | length' 2>/dev/null)
CORPS_COUNT=$(echo "$API_RESPONSE" | jq '[.[] | select(.category == "corps")] | length' 2>/dev/null)
TECHNIQUES_COUNT=$(echo "$API_RESPONSE" | jq '[.[] | select(.category == "techniques")] | length' 2>/dev/null)

echo "   Visage: $VISAGE_COUNT services"
echo "   Corps: $CORPS_COUNT services"
echo "   Techniques: $TECHNIQUES_COUNT services"
echo

# Check Landing - Category Pages
echo "🔍 Checking Landing Page..."

# Check visage category page
VISAGE_PAGE=$(curl -s https://widamineaestheticcenter.com/category/visage)
if echo "$VISAGE_PAGE" | grep -q "Catégorie introuvable"; then
    echo -e "${RED}❌ Landing: /category/visage shows error${NC}"
else
    echo -e "${GREEN}✅ Landing: /category/visage loads successfully${NC}"
fi

# Check if new bundle is deployed
if echo "$VISAGE_PAGE" | grep -q "index-C7kFtWiP.js"; then
    echo -e "${YELLOW}⚠️  Landing: Still using OLD bundle (index-C7kFtWiP.js)${NC}"
    echo "   Action: Force rebuild in Coolify to deploy new code"
else
    echo -e "${GREEN}✅ Landing: New bundle deployed${NC}"
fi

echo

# Check Admin
echo "🔍 Checking Admin Dashboard..."
ADMIN_RESPONSE=$(curl -s https://new.widamineaestheticcenter.com)
if [ -n "$ADMIN_RESPONSE" ]; then
    echo -e "${GREEN}✅ Admin: Dashboard is accessible${NC}"
else
    echo -e "${RED}❌ Admin: Dashboard not responding${NC}"
fi

echo
echo "=================================="
echo "   Verification Complete"
echo "=================================="
echo
echo "📋 If any checks failed, see COOLIFY_DEPLOYMENT_STATUS.md for troubleshooting"

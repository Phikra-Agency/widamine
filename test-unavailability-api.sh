#!/bin/bash

echo "🧪 Testing Unavailability API"
echo "==============================="
echo ""

# Test if API is running
echo "1️⃣ Checking if API is responding..."
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ API is responding"
else
    echo "❌ API is not responding on port 3000"
    echo "   Please start the API: cd api && npm run dev"
    exit 1
fi

echo ""
echo "2️⃣ Testing unavailabilities endpoint (should return 401 without auth)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/unavailabilities)
if [ "$STATUS" = "401" ]; then
    echo "✅ Endpoint exists and requires authentication (401)"
elif [ "$STATUS" = "404" ]; then
    echo "❌ Endpoint not found (404) - module not loaded"
    exit 1
else
    echo "⚠️  Got status $STATUS (expected 401)"
fi

echo ""
echo "3️⃣ Testing statistics endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/unavailabilities/statistics)
if [ "$STATUS" = "401" ]; then
    echo "✅ Statistics endpoint exists (401)"
elif [ "$STATUS" = "404" ]; then
    echo "❌ Statistics endpoint not found (404)"
    exit 1
else
    echo "⚠️  Got status $STATUS (expected 401)"
fi

echo ""
echo "==============================="
echo "✅ All endpoints are registered!"
echo ""
echo "Next step: Test with authentication in browser"
echo "URL: http://localhost:5174/unavailabilities"

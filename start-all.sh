#!/bin/bash

echo "🚀 Starting Widamine Services..."

# Start API
cd /home/alae/Documents/repos/widamine/api
npm run dev > /tmp/widamine-api.log 2>&1 &
API_PID=$!
echo "✅ API started (PID: $API_PID) - http://localhost:3000"

# Wait for API to be ready
sleep 5

# Start Admin
cd /home/alae/Documents/repos/widamine/admin
npm run dev > /tmp/widamine-admin.log 2>&1 &
ADMIN_PID=$!
echo "✅ Admin started (PID: $ADMIN_PID) - http://localhost:5174"

# Start Landing
cd /home/alae/Documents/repos/widamine/landing
npm run dev > /tmp/widamine-landing.log 2>&1 &
LANDING_PID=$!
echo "✅ Landing started (PID: $LANDING_PID) - http://localhost:5173"

echo ""
echo "📝 Service PIDs saved:"
echo $API_PID > /tmp/widamine-api.pid
echo $ADMIN_PID > /tmp/widamine-admin.pid
echo $LANDING_PID > /tmp/widamine-landing.pid

echo ""
echo "🎉 All services starting..."
echo ""
echo "📊 Access points:"
echo "   - API:     http://localhost:3000"
echo "   - Landing: http://localhost:5173"
echo "   - Admin:   http://localhost:5174"
echo ""
echo "📋 Logs:"
echo "   - API:     tail -f /tmp/widamine-api.log"
echo "   - Admin:   tail -f /tmp/widamine-admin.log"
echo "   - Landing: tail -f /tmp/widamine-landing.log"
echo ""
echo "🛑 To stop all services:"
echo "   kill \$(cat /tmp/widamine-*.pid)"

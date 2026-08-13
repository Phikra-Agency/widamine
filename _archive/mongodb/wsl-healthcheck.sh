#!/usr/bin/env bash
set -euo pipefail
echo "=== Ports ==="
ss -tlnp 2>/dev/null | grep -E '3000|5173|5174|27017' || true
echo "=== MongoDB ==="
mongosh --quiet --eval 'print("rs.ok:", rs.status().ok)'
echo "=== API /services ==="
CODE=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/services)
echo "HTTP $CODE"
test "$CODE" = "200" || exit 1
echo "=== API login ==="
LOGIN=$(curl -s -X POST http://127.0.0.1:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@widamine.com","password":"admin123"}')
echo "$LOGIN" | head -c 200
echo ""
echo "$LOGIN" | grep -q '"token"' || exit 1
echo "=== Landing ==="
LCODE=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5173/)
echo "HTTP $LCODE"
test "$LCODE" = "200" || exit 1
echo "=== Admin ==="
ACODE=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5174/)
echo "HTTP $ACODE"
test "$ACODE" = "200" || exit 1

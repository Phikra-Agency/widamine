#!/usr/bin/env bash
set -euo pipefail
MONGO_DATA="${MONGO_DATA:-$HOME/mongodb_data}"
MONGO_LOG="${MONGO_LOG:-$HOME/mongodb.log}"
mkdir -p "$MONGO_DATA"

if pgrep -x mongod >/dev/null 2>&1; then
  echo "mongod already running"
else
  mongod --replSet rs0 --dbpath "$MONGO_DATA" --port 27017 --bind_ip 127.0.0.1 --fork --logpath "$MONGO_LOG"
  sleep 2
fi

mongosh --quiet --eval '
try {
  const s = rs.status();
  if (s.ok !== 1) throw new Error("not ok");
  print("Replica set already initialized");
} catch (e) {
  rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "127.0.0.1:27017" }] });
  print("Replica set initiated");
}
' || true

mongosh --quiet --eval 'const s=rs.status(); print("rs.status().ok =", s.ok)'

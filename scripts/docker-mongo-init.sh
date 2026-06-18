#!/usr/bin/env bash
set -euo pipefail

echo "Waiting for MongoDB..."
until mongosh --host mongo:27017 --quiet --eval 'db.runCommand({ ping: 1 }).ok' | grep -q 1; do
  sleep 1
done

mongosh --host mongo:27017 --quiet --eval '
try {
  const status = rs.status();
  if (status.ok === 1) {
    print("Replica set already initialized");
    quit(0);
  }
} catch (e) {
  // not initiated yet
}
const result = rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "mongo:27017" }] });
printjson(result);
'

echo "MongoDB replica set ready."

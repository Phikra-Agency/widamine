# MongoDB

**Version**: 7.0.12  
**Port**: 27017  
**DB name**: `widamine`  
**Connection**: `mongodb://127.0.0.1:27017/widamine?replicaSet=rs0`

Prisma requires a **replica set** for transactions.

## Start

```bash
./start-mongodb.sh
```

Or manually:

```bash
mongod --dbpath ~/mongodb_data --replSet rs0 --port 27017 --fork --logpath /tmp/mongod.log
sleep 3
mongosh --quiet --eval 'rs.initiate()'
```

## Stop

```bash
mongod --dbpath ~/mongodb_data --shutdown
```

## Verify

```bash
mongosh --quiet --eval 'rs.status().ok'
# → 1
```

## Data directory

Data lives in `~/mongodb_data/`. This was chosen over `/data/db` to avoid permission issues.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `MongoError: not primary` | Replica set not initialized — run `rs.initiate()` |
| Prisma transaction error | MongoDB is not running as replica set — add `--replSet rs0` |
| Connection refused | mongod not running — `pgrep mongod` |
| Chatbot not responding | Proxy env vars blocking outbound HTTPS — unset them before starting API |

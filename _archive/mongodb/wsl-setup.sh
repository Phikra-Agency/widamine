#!/usr/bin/env bash
# Widamine WSL setup — run as user alae: bash scripts/wsl-setup.sh
set -euo pipefail

SUDO_PASS="${SUDO_PASS:-alae}"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MONGO_DATA="${MONGO_DATA:-$HOME/mongodb_data}"
MONGO_LOG="${MONGO_LOG:-$HOME/mongodb.log}"

sudo_cmd() {
  echo "$SUDO_PASS" | sudo -S "$@"
}

echo "==> Project: $PROJECT_ROOT"
echo "==> User: $(whoami)"

# --- System packages ---
echo "==> Installing system dependencies..."
sudo_cmd apt-get update -qq
sudo_cmd DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  curl ca-certificates gnupg build-essential

# --- Node.js 22 ---
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v)" != v22* ]]; then
  echo "==> Installing Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo_cmd -S bash -
  sudo_cmd DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nodejs
fi
echo "Node: $(node -v) | npm: $(npm -v)"

# --- MongoDB 7 ---
if ! command -v mongod >/dev/null 2>&1; then
  echo "==> Installing MongoDB 7..."
  curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
    sudo_cmd gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
  echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
    sudo_cmd tee /etc/apt/sources.list.d/mongodb-org-7.0.list >/dev/null
  sudo_cmd apt-get update -qq
  sudo_cmd DEBIAN_FRONTEND=noninteractive apt-get install -y -qq mongodb-org
fi
echo "MongoDB: $(mongod --version | head -1)"

mkdir -p "$MONGO_DATA"

# --- start-mongodb.sh ---
cat > "$PROJECT_ROOT/start-mongodb.sh" <<'MONGOEOF'
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

# Init replica set if needed
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
MONGOEOF
chmod +x "$PROJECT_ROOT/start-mongodb.sh"

# --- Env files ---
if [[ ! -f "$PROJECT_ROOT/api/.env" ]]; then
  cp "$PROJECT_ROOT/api/.env.example" "$PROJECT_ROOT/api/.env"
  sed -i 's/your-jwt-secret-here/widamine_jwt_secret_dev_alae_2026/' "$PROJECT_ROOT/api/.env"
fi

# --- MongoDB ---
echo "==> Starting MongoDB replica set..."
bash "$PROJECT_ROOT/start-mongodb.sh"

# --- Monorepo ---
echo "==> npm install + prisma + seed..."
cd "$PROJECT_ROOT"
npm install
npm run db:generate
npm run db:seed

echo ""
echo "=============================================="
echo "  Widamine WSL setup complete"
echo "=============================================="
echo "  Project:     $PROJECT_ROOT"
echo "  MongoDB:     mongodb://127.0.0.1:27017/widamine"
echo "  Login:       admin@widamine.com / admin123"
echo ""
echo "  Start stack: npm run dev"
echo "  MongoDB:     ./start-mongodb.sh"
echo "=============================================="

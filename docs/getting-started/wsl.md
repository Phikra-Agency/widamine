# Widamine — WSL setup (user `alae`)

Setup completed on WSL2 (Ubuntu). Sudo password: same as your Linux user (`alae`).

## What is installed

| Component | Version / path |
|-----------|----------------|
| Node.js | 22.x (`/usr/bin/node`) |
| MongoDB | 7.0 replica set `rs0` |
| Data dir | `~/mongodb_data` |
| Project | `/mnt/c/Users/Alae/Documents/WIDAMINE/widamine` |

## Quick commands (run inside WSL)

```bash
cd /mnt/c/Users/Alae/Documents/WIDAMINE/widamine

# MongoDB (required before API)
./start-mongodb.sh

# Start both dev servers (logs in home dir)
bash scripts/wsl-start-dev.sh

# Verify everything
bash scripts/wsl-healthcheck.sh
```

## URLs

- **Landing:** http://localhost:5173
- **Admin:** http://localhost:5174
- **API:** http://localhost:3000
- **Login:** `admin@widamine.com` / `admin123`

## Logs

- `~/widamine-api.log`
- `~/widamine-admin.log`
- `~/widamine-landing.log`
- `~/mongodb.log`

## First-time / after reboot

1. Open WSL: `wsl -u alae`
2. `./start-mongodb.sh`
3. `bash scripts/wsl-start-dev.sh`
4. Wait **2–3 minutes** for the API on `/mnt/c` (Windows drive is slow). Then run `bash scripts/wsl-healthcheck.sh`.

## Env files (created)

- `api/.env` — from `.env.example`, JWT set for dev
- `frontend/.env` — `VITE_PUBLIC_API_URL="/api"`

## Performance tip

Running from `/mnt/c/...` is slow. For faster dev, clone or copy the repo to Linux home:

```bash
rsync -a --exclude node_modules /mnt/c/Users/Alae/Documents/WIDAMINE/widamine/ ~/widamine/
cd ~/widamine/api && npm install --legacy-peer-deps && npx prisma generate
cd ~/widamine/frontend && npm install --legacy-peer-deps
```

## Re-run full install

```bash
bash scripts/wsl-setup.sh      # system packages (Node, MongoDB)
bash scripts/wsl-app-install.sh # npm + seed
```

## Default seed users

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@widamine.com | admin123 |
| DOCTOR | dr.slaoui@widamine.com | doctor123 |

# Coolify Admin Deployment Fix

## Problem
Coolify cannot deploy because GitHub API returns "Not Found" error. This means the GitHub token configured in Coolify is expired or invalid.

## Changes Already Pushed to GitHub ✅
- ✅ Disabled Indisponibilités feature
- ✅ Fixed patient drawer height (600px/85vh with scrolling)
- ✅ Added docker-compose.yaml with admin service

Commits are on `main` and `latest` branches.

## Solution Options

### Option 1: Fix GitHub Access in Coolify (RECOMMENDED)

1. **Log into Coolify**: https://server.wa-pharma.com

2. **Go to Source Configuration**:
   - Applications → widamine:api
   - Click "Source" or "Configuration" tab
   - Find GitHub/Git settings

3. **Update GitHub Token**:
   - Generate new GitHub Personal Access Token:
     - Go to: https://github.com/settings/tokens
     - Click "Generate new token (classic)"
     - Select scopes: `repo` (full control)
     - Copy the token
   - Paste new token in Coolify

4. **Deploy**:
   ```bash
   # From this directory
   ./deploy-to-production.sh
   ```

### Option 2: Deploy Admin Manually via Docker

If Coolify access can't be fixed immediately:

```bash
# 1. Build admin locally
cd /home/alae/Documents/repos/widamine/admin
docker build -t widamine-admin:latest \
  --build-arg VITE_PUBLIC_API_URL=https://api.widamineaestheticcenter.com \
  -f Dockerfile .

# 2. Save and transfer to server
docker save widamine-admin:latest | gzip > widamine-admin.tar.gz
scp widamine-admin.tar.gz root@server.wa-pharma.com:/tmp/

# 3. On server, load and run
ssh root@server.wa-pharma.com
docker load < /tmp/widamine-admin.tar.gz
docker stop widamine-admin || true
docker rm widamine-admin || true
docker run -d \
  --name widamine-admin \
  --network coolify \
  -p 8080:80 \
  --label "coolify.managed=true" \
  --restart unless-stopped \
  widamine-admin:latest
```

### Option 3: Use SSH Deploy Key Instead of Token

1. **Generate SSH key**:
   ```bash
   ssh-keygen -t ed25519 -C "coolify@widamine" -f ~/.ssh/coolify_widamine
   ```

2. **Add to GitHub**:
   - Go to: https://github.com/Phikra-Agency/widamine/settings/keys
   - Add deploy key with read access
   - Paste public key

3. **Update Coolify**:
   - Change source from HTTPS to SSH
   - Use: `git@github.com:Phikra-Agency/widamine.git`
   - Add private key to Coolify

## Verification

After deployment, check:

```bash
# Check if admin is running
curl -I https://new.widamineaestheticcenter.com

# Check bundle hash changed (means new build)
curl -s https://new.widamineaestheticcenter.com | grep "index-"

# Should see a different hash than: index-DcsZf8yh.js
```

## Current Status

- **Code**: ✅ Ready on GitHub (main & latest branches)
- **Coolify Access**: ❌ GitHub token expired/invalid
- **Admin URL**: https://new.widamineaestheticcenter.com
- **Last Working Build**: August 6, 09:55 (bundle: index-DcsZf8yh.js)
- **Needed**: New build with latest changes

## API References

Coolify API endpoints used:
- Deploy: `POST https://server.wa-pharma.com/api/v1/deploy`
- Check status: `GET https://server.wa-pharma.com/api/v1/deployments/{uuid}`

widamine:api UUID: `tyfa0ow9za5ohqn69dh9zhh4`
widamine:admin UUID: `rha30fwe9v966c0ks3d6bey6`

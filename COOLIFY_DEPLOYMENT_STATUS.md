# Coolify Deployment Status

## ✅ Database Migration - COMPLETED

**Action:** Updated Coolify PostgreSQL database with service categories  
**Date:** $(date)

### Database Update Results:
```
✅ Consultation → category: 'visage'
✅ Suivi → category: 'visage'
✅ Bilan → category: 'visage'
✅ Peeling → category: 'visage'
✅ SculpSure → category: 'corps'
✅ Épilation laser → category: 'techniques'
```

**Database Verified:** All 6 services now have correct categories in production database

---

## 🚀 Pending: Application Deployments

### Applications to Deploy:

#### 1. API (Backend) - **CRITICAL - Deploy First**
- **App ID:** tyfa0ow9za5ohqn69dh9zhh4
- **URL:** https://api.widamineaestheticcenter.com
- **Why:** API currently returns `category: null` - needs new Prisma client and controller
- **Changes:**
  - Updated Prisma schema with category field
  - Updated public-motif.controller.ts to return category
  - Regenerated Prisma client
- **Required Env Vars:**
  ```
  DATABASE_URL=postgresql://postgres:Z5IS0RBipbO0epq7DUHnSMgr0ozY9EPSBUo912BVlJ5Iwrx1fGA2AAJ7rWCAh8r2@91.98.161.53:5420/postgres
  JWT_SECRET=your-jwt-secret-here
  SMTP_HOST=smtp.widamineaestheticcenter.com
  SMTP_PORT=465
  SMTP_USER=admin@widamineaestheticcenter.com
  SMTP_PASS=Ne650704d
  SMTP_FROM_NAME=Widamine Aesthetic Center
  SMTP_FROM_EMAIL=admin@widamineaestheticcenter.com
  VITE_ADMIN_URL=https://new.widamineaestheticcenter.com
  GROQ_API_KEY=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
  API_PORT=3000
  WHATSAPP_ENABLED=false
  ```

#### 2. Landing Page
- **App ID:** o1vggh0zqbf196fabxz6pr5q
- **URL:** https://widamineaestheticcenter.com
- **Why:** Old cached bundle still serving (index-C7kFtWiP.js instead of new code)
- **Changes:**
  - Fixed category page filtering
  - Fixed navbar service categorization
  - Fixed chatbot API URL
  - Fixed booking flow selectedMotif error
  - Changed service video aspect ratio to 16:9
- **Required Env Vars:**
  ```
  VITE_PUBLIC_API_URL=https://api.widamineaestheticcenter.com
  VITE_ADMIN_URL=https://new.widamineaestheticcenter.com
  ```
- **Important:** Must click **"Force Rebuild"** to clear cache

#### 3. Admin Dashboard
- **App ID:** rha30fwe9v966c0ks3d6bey6
- **URL:** https://new.widamineaestheticcenter.com
- **Changes:**
  - Fixed notification badge (only on bell icon, not profile)
- **Required Env Vars:**
  ```
  VITE_PUBLIC_API_URL=https://api.widamineaestheticcenter.com
  ```

---

## 📋 Deployment Steps:

### Step 1: Deploy API First
1. Login to Coolify: https://app.coolify.io
2. Navigate to API application (tyfa0ow9za5ohqn69dh9zhh4)
3. Go to "Environment Variables" → Verify all env vars are set
4. Go to "Deployments" → Click **"Redeploy"** or **"Force Rebuild"**
5. Wait for deployment to complete
6. **VERIFY:** `curl https://api.widamineaestheticcenter.com/public/motifs | jq '.[0].category'`
   - Should return: `"visage"` (not `null`)

### Step 2: Deploy Landing Page
1. Navigate to Landing application (o1vggh0zqbf196fabxz6pr5q)
2. Go to "Environment Variables" → Verify env vars
3. Go to "Deployments" → Click **"Force Rebuild"** (to clear old cache)
4. Wait for deployment
5. **VERIFY:** 
   - Visit https://widamineaestheticcenter.com/category/visage
   - Should show 4 services (not "Catégorie introuvable")
   - Check browser console: should show new bundle hash (not index-C7kFtWiP.js)

### Step 3: Deploy Admin Dashboard
1. Navigate to Admin application (rha30fwe9v966c0ks3d6bey6)
2. Go to "Environment Variables" → Verify env vars
3. Go to "Deployments" → Click **"Redeploy"**
4. **VERIFY:**
   - Visit https://new.widamineaestheticcenter.com
   - Check notification badge only appears on bell icon (not profile)

---

## 🔍 Post-Deployment Verification Checklist:

### API
- [ ] `curl https://api.widamineaestheticcenter.com/public/motifs | jq '.[0].category'` returns `"visage"`
- [ ] All 6 services have category field populated

### Landing Page
- [ ] https://widamineaestheticcenter.com/category/visage shows 4 services
- [ ] https://widamineaestheticcenter.com/category/corps shows 1 service
- [ ] https://widamineaestheticcenter.com/category/techniques shows 1 service
- [ ] Navbar dropdown shows correct counts (Visage: 4, Corps: 1, Techniques: 1)
- [ ] Chatbot connects and responds
- [ ] Service detail pages show 16:9 video
- [ ] Booking flow works without errors

### Admin
- [ ] Bell icon has red notification badge
- [ ] Profile button does NOT have badge
- [ ] Calendar and other features work normally

---

## 🐛 Troubleshooting:

**If API still returns category: null after deployment:**
1. Check Coolify deployment logs for Prisma generation errors
2. Verify DATABASE_URL env var is correct
3. SSH into API container and run: `npx prisma generate`
4. Restart the API service

**If Landing still shows old code:**
1. Check Coolify build logs for correct git hash (ad601d0)
2. Clear Coolify build cache
3. Force rebuild with cache clear option
4. Check if there's a CDN cache in front of Coolify

**If categories still don't show on landing:**
1. First verify API returns category field
2. Hard refresh browser (Ctrl+Shift+R)
3. Check browser console for errors
4. Verify VITE_PUBLIC_API_URL points to correct API

---

## 📊 Current Status:

- ✅ **Database:** Categories populated on Coolify PostgreSQL
- ✅ **Code:** All changes pushed to GitHub (commit: ad601d0)
- ⏳ **API Deployment:** Pending
- ⏳ **Landing Deployment:** Pending
- ⏳ **Admin Deployment:** Pending

**Next Action:** Deploy all 3 applications in Coolify using steps above

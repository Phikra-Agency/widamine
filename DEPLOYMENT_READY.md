# ✅ Ready for Coolify Deployment

**Git Status:** All changes pushed to GitHub `main` branch  
**Latest Commit:** `932984d` - Fix notification badge - show only on bell icon, not on profile button

---

## 🚀 Deploy These Applications in Coolify:

### 1. **API (Backend)** - App ID: `tyfa0ow9za5ohqn69dh9zhh4`
   - URL: https://api.widamineaestheticcenter.com
   - **Action:** Go to Coolify → Click "Redeploy" or "Force Rebuild"
   - **Environment Variables Required:**
     ```bash
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

### 2. **Landing Page** - App ID: `o1vggh0zqbf196fabxz6pr5q`
   - URL: https://widamineaestheticcenter.com
   - **Action:** Go to Coolify → Click "Force Rebuild" (to clear old cache)
   - **Environment Variables Required:**
     ```bash
     VITE_PUBLIC_API_URL=https://api.widamineaestheticcenter.com
     VITE_ADMIN_URL=https://new.widamineaestheticcenter.com
     ```

### 3. **Admin Dashboard** - App ID: `rha30fwe9v966c0ks3d6bey6`
   - URL: https://new.widamineaestheticcenter.com
   - **Action:** Go to Coolify → Click "Redeploy"
   - **Environment Variables Required:**
     ```bash
     VITE_PUBLIC_API_URL=https://api.widamineaestheticcenter.com
     ```

---

## 📋 What's Being Deployed:

### ✅ **Landing Page Changes:**
1. **Fixed category pages** - Now correctly show services by category
   - `/category/visage` → Shows 4 services
   - `/category/corps` → Shows 1 service
   - `/category/techniques` → Shows 1 service
2. **Fixed navbar dropdown** - Shows correct service counts
3. **Fixed chatbot API** - Now connects to backend properly
4. **Fixed booking flow** - No more `selectedMotif` error
5. **Fixed video aspect ratio** - Service videos now 16:9 (landscape)

### ✅ **Admin Dashboard Changes:**
1. **Fixed notification badge** - Red bubble only on bell icon, not profile button

### ✅ **API Changes:**
1. **Category field** - API now returns `category` string field for services
2. **Chatbot endpoint** - Groq AI integration ready

---

## 🔍 Post-Deployment Verification:

### Landing Page (https://widamineaestheticcenter.com)
- [ ] Visit `/category/visage` - Should show 4 services (not "Catégorie introuvable")
- [ ] Visit `/category/corps` - Should show 1 service
- [ ] Visit `/category/techniques` - Should show 1 service
- [ ] Check navbar dropdown - Should show correct counts
- [ ] Test chatbot - Click chat icon, send message, should get AI response
- [ ] Visit any service page - Video should be 16:9 landscape

### API (https://api.widamineaestheticcenter.com)
- [ ] Visit `/public/motifs` - Should return services with `category` field
- [ ] Check health endpoint (if exists)

### Admin Dashboard (https://new.widamineaestheticcenter.com)
- [ ] Check notification bell icon - Red badge should appear on bell only
- [ ] Profile button - Should NOT have red badge

---

## 🛠️ How to Deploy in Coolify:

1. **Login to Coolify:** https://app.coolify.io
2. Navigate to your project
3. For each application:
   - Go to application settings
   - Navigate to "Environment Variables" tab
   - Add/verify all required env vars listed above
   - Go to "General" or "Deployments" tab
   - Click **"Force Rebuild"** (recommended) or **"Redeploy"**
   - Wait for deployment to complete
   - Check deployment logs for errors

4. **If old code persists on Landing:**
   - Clear build cache in Coolify
   - Force rebuild
   - Verify git hash in logs matches `932984d`

---

## 🐛 Troubleshooting:

**If category pages still show "Catégorie introuvable":**
1. Check API returns category: `curl https://api.widamineaestheticcenter.com/public/motifs | jq '.[0].category'`
2. Clear browser cache (Ctrl+Shift+R)
3. Check Coolify build logs

**If chatbot doesn't work:**
1. Verify `GROQ_API_KEY` is set in API env vars
2. Check browser console for errors
3. Verify API endpoint: `curl https://api.widamineaestheticcenter.com/chatbot/message`

**If notification badge appears on both bell and profile:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Check admin deployment used latest commit `932984d`

---

## 📝 Summary:

✅ All code pushed to GitHub (branch: `main`, commit: `932984d`)  
✅ Environment variables documented in `COOLIFY_ENV_CONFIG.md`  
✅ Ready for production deployment  

**Next Step:** Deploy all 3 applications in Coolify using the instructions above.

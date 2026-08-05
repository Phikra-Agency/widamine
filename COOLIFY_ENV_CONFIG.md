# Coolify Environment Variables Configuration

## API (Backend) - Application ID: tyfa0ow9za5ohqn69dh9zhh4

### Required Environment Variables:

```bash
# Database - PostgreSQL (Coolify Public Database)
DATABASE_URL=postgresql://postgres:Z5IS0RBipbO0epq7DUHnSMgr0ozY9EPSBUo912BVlJ5Iwrx1fGA2AAJ7rWCAh8r2@91.98.161.53:5420/postgres

# JWT Authentication
JWT_SECRET=your-jwt-secret-here

# SMTP Email Configuration
SMTP_HOST=smtp.widamineaestheticcenter.com
SMTP_PORT=465
SMTP_USER=admin@widamineaestheticcenter.com
SMTP_PASS=Ne650704d
SMTP_FROM_NAME=Widamine Aesthetic Center
SMTP_FROM_EMAIL=admin@widamineaestheticcenter.com

# Admin Dashboard URL
VITE_ADMIN_URL=https://new.widamineaestheticcenter.com

# Groq AI API for Chatbot
GROQ_API_KEY=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

# API Port
API_PORT=3000

# WhatsApp Notifications
WHATSAPP_ENABLED=false
```

**Note:** Set `WHATSAPP_ENABLED=false` in production to avoid QR code scanning requirements.

---

## Landing Page - Application ID: o1vggh0zqbf196fabxz6pr5q

### Required Environment Variables:

```bash
# API Backend URL
VITE_PUBLIC_API_URL=https://api.widamineaestheticcenter.com

# Admin Dashboard URL (for redirects)
VITE_ADMIN_URL=https://new.widamineaestheticcenter.com
```

---

## Admin Dashboard - Application ID: rha30fwe9v966c0ks3d6bey6

### Required Environment Variables:

```bash
# API Backend URL
VITE_PUBLIC_API_URL=https://api.widamineaestheticcenter.com
```

---

## Database Configuration

**PostgreSQL Database** (already deployed on Coolify):
- Host: `91.98.161.53`
- Port: `5420`
- Database: `postgres`
- User: `postgres`
- Password: `Z5IS0RBipbO0epq7DUHnSMgr0ozY9EPSBUo912BVlJ5Iwrx1fGA2AAJ7rWCAh8r2`

---

## Deployment Steps for Coolify

### 1. API (Backend)
1. Go to Coolify Dashboard
2. Navigate to API application: https://app.coolify.io/project/.../resource/tyfa0ow9za5ohqn69dh9zhh4
3. Go to "Environment Variables" tab
4. Add/update all API environment variables listed above
5. **Important:** After updating env vars, trigger a new deployment or restart the application
6. Verify deployment at: https://api.widamineaestheticcenter.com/health

### 2. Landing Page
1. Navigate to Landing application: https://app.coolify.io/project/.../resource/o1vggh0zqbf196fabxz6pr5q
2. Go to "Environment Variables" tab
3. Add/update landing environment variables
4. Trigger new deployment
5. **Clear build cache** if old bundle is still being served
6. Verify at: https://widamineaestheticcenter.com

### 3. Admin Dashboard
1. Navigate to Admin application: https://app.coolify.io/project/.../resource/rha30fwe9v966c0ks3d6bey6
2. Go to "Environment Variables" tab
3. Add/update admin environment variables
4. Trigger new deployment
5. Verify at: https://new.widamineaestheticcenter.com

---

## Recent Changes Pushed (Commit 7b64191)

✅ Fixed category pages to show correct services (visage: 4, corps: 1, techniques: 1)
✅ Fixed chatbot to use correct API URL via environment variable
✅ Fixed booking flow error with selectedMotif
✅ Changed service detail video aspect ratio from 9:16 to 16:9

### After Deployment
- Category pages should work: `/category/visage`, `/category/corps`, `/category/techniques`
- Navbar dropdown should show correct service counts
- Chatbot should connect to API properly
- Booking flow should not crash when selecting doctor

---

## Troubleshooting

### If category pages still show "Catégorie introuvable":
1. Check browser console for API errors
2. Verify API is returning `category` field: `curl https://api.widamineaestheticcenter.com/public/motifs | jq '.[0].category'`
3. Clear browser cache (Ctrl+Shift+R)
4. Check Coolify build logs for errors

### If chatbot doesn't work:
1. Verify GROQ_API_KEY is set in API environment variables
2. Check API logs: `/chatbot/message` endpoint should exist
3. Check browser network tab for API call to correct URL

### If old code is still deployed:
1. In Coolify, go to application settings
2. Click "Force Rebuild" to clear cache
3. Check git hash in deployment logs matches latest commit (7b64191)

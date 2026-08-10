# 🚀 START HERE - Unavailability Feature

## ✅ Everything is Ready!

All code has been implemented and TypeScript compilation is successful. You just need to **restart the API server** to load the new unavailability module.

## 🔧 Step 1: Restart API Server

Open a new terminal and run:

```bash
cd /home/alae/Documents/repos/widamine
./restart-api.sh
```

**Wait for this message:**
```
✅ Nest application successfully started
[main.ts] Server started on 0.0.0.0:3000
```

Leave this terminal open (don't close it).

## 🧪 Step 2: Test the Feature

### Option A: Quick Test (in browser)
1. Go to: http://localhost:5174/unavailabilities
2. Login if needed
3. Click "Nouvelle demande" button
4. Fill the form and submit
5. You should see your request in the table!

### Option B: Test with cURL (in another terminal)
```bash
# Get your auth token first (replace with your email/password)
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.access_token')

# Test creating unavailability
curl -X POST http://localhost:3000/unavailabilities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-08-10",
    "endDate": "2026-08-10",
    "startTime": "09:00",
    "endTime": "12:00",
    "excuseType": "VACATION"
  }'

# Test getting all unavailabilities
curl -X GET http://localhost:3000/unavailabilities \
  -H "Authorization: Bearer $TOKEN"
```

## 📋 What Was Built

### Backend
- ✅ Database model with migration applied
- ✅ 8 API endpoints (create, list, update, delete, approve, reject, statistics, detail)
- ✅ Email notifications (admin notified on new request, practitioner notified on approval/rejection)
- ✅ Conflict detection (checks for existing appointments)
- ✅ Booking integration (approved unavailabilities block time slots)

### Frontend
- ✅ "Indisponibilités" link in sidebar
- ✅ Table page with statistics cards
- ✅ Create/edit form modal
- ✅ Admin approval modal with conflict warnings
- ✅ Color-coded status badges (PENDING=yellow, APPROVED=green, REJECTED=red)
- ✅ Role-based access (practitioners see own, admin sees all)

### Booking System
- ✅ Unavailable slots shown with 30% opacity + disabled cursor
- ✅ Double booking prevention with server-side validation

## 🎯 User Flows

### As Practitioner:
1. Click "Indisponibilités" in sidebar
2. Click "Nouvelle demande"
3. Fill: dates, times, excuse type
4. Submit → appears as PENDING (yellow)
5. Wait for admin approval
6. Receive email when approved/rejected

### As Admin:
1. Go to "Indisponibilités"
2. See all requests from all practitioners
3. Click "Approuver" on PENDING request
4. Review conflict warnings (if any)
5. Click "Approuver" → status changes to APPROVED (green)
6. Practitioner receives email notification

## 📧 Email Notifications

Check API console for email logs:
- `📧 Email sent` = SMTP configured, emails sent
- `📧 [DRY RUN]` = SMTP not configured, emails simulated

To enable real emails, add to `api/.env`:
```env
SMTP_HOST=smtp.widamineaestheticcenter.com
SMTP_PORT=465
SMTP_USER=your_user
SMTP_PASS=your_password
```

## ⚠️ Troubleshooting

### "Cannot GET /unavailabilities" or 404 error
→ API not restarted. Run `./restart-api.sh`

### Sidebar link not visible
→ Hard refresh: `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)

### TypeScript errors
→ Already fixed! Just restart API server

### Can't approve/reject
→ Must be logged in as admin

## 📚 Full Documentation

- `UNAVAILABILITY_IMPLEMENTATION.md` - Complete technical docs
- `QUICK_START_UNAVAILABILITY.md` - Detailed testing guide

## 🚀 Production Deployment

When ready:
```bash
./deploy-to-production.sh
```

Then on production server:
```bash
npx prisma migrate deploy
# Restart production API
```

---

## 🎉 That's It!

Just run `./restart-api.sh` and you're good to go!

If you see the "Indisponibilités" link in the sidebar and can create requests, everything is working! ✅

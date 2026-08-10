# Quick Start - Unavailability Management

## 🚀 Getting Started

### Step 1: Restart API Server
The API server needs to be restarted to load the new unavailability module.

```bash
# Stop current API server
pkill -f "nest start"

# Start API server
cd /home/alae/Documents/repos/widamine/api
npm run dev
```

**Wait for this message in console:**
```
✅ Nest application successfully started
[main.ts] Server started on 0.0.0.0:3000
```

### Step 2: Verify Frontend is Running
Admin dashboard should already be running on http://localhost:5174

If not:
```bash
cd /home/alae/Documents/repos/widamine/admin
npm run dev
```

### Step 3: Test the Feature

#### As Practitioner/Doctor:
1. Login to admin dashboard: http://localhost:5174/login
2. Click "Indisponibilités" in sidebar (should see it below "Réservations")
3. Click "Nouvelle demande" button
4. Fill the form:
   - Start date: Tomorrow
   - End date: Tomorrow
   - Start time: 09:00
   - End time: 12:00
   - Excuse type: Congé
5. Click "Soumettre"
6. You should see the request appear in table with yellow "En attente" badge

#### As Admin:
1. Login with admin account
2. Go to "Indisponibilités"
3. You should see the practitioner's request
4. Click "Approuver" button
5. Modal opens showing:
   - Practitioner details
   - Period and hours
   - Conflict warning (if any appointments exist)
6. Click "Approuver" to approve
7. Status changes to green "Approuvé" badge
8. Practitioner receives email notification

#### Test Booking with Blocked Slots:
1. Open booking page: http://localhost:5173/reserver
2. Select a motif
3. Select the practitioner who has approved unavailability
4. Select the date that's blocked
5. You should see:
   - Unavailable time slots with 30% opacity
   - Cursor changes to "not-allowed" when hovering
   - Clicking does nothing
   - Available slots work normally

## 📧 Email Configuration

Check if emails are being sent by looking at API console logs:

**If you see:**
```
📧 Email sent to admin@example.com: Nouvelle demande d'indisponibilité
```
✅ Emails are configured and working

**If you see:**
```
📧 [DRY RUN] Email to admin@example.com: ...
```
⚠️ SMTP not configured - emails won't be sent (but feature still works)

To enable emails, add to `api/.env`:
```env
SMTP_HOST=smtp.widamineaestheticcenter.com
SMTP_PORT=465
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM_EMAIL=admin@widamineaestheticcenter.com
SMTP_FROM_NAME=Widamine
```

## 🧪 Quick Test Checklist

- [ ] Sidebar shows "Indisponibilités" link
- [ ] Page loads with statistics cards
- [ ] Can create new request
- [ ] Request appears as PENDING (yellow badge)
- [ ] Admin can see all requests
- [ ] Admin can approve → status changes to APPROVED (green)
- [ ] Admin can reject → status changes to REJECTED (red)
- [ ] Rejection reason is displayed
- [ ] Approved unavailability blocks slots in booking flow
- [ ] Unavailable slots have 30% opacity + disabled cursor
- [ ] Console shows email log messages

## ⚠️ Troubleshooting

### "Cannot GET /unavailabilities" error
→ API server not restarted. Follow Step 1 above.

### Sidebar link not visible
→ Hard refresh browser: `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)

### Table shows "Aucune demande"
→ No requests created yet. Click "Nouvelle demande" to create one.

### Approval modal doesn't show conflicts
→ No appointments exist in that time range (this is normal)

### Slots not blocked in booking flow
→ Check:
1. Unavailability status is APPROVED (green badge)
2. Date/time range matches
3. Selected practitioner matches
4. Hard refresh booking page

### Emails not sent
→ Check API console for email logs. If "[DRY RUN]" appears, SMTP not configured (see Email Configuration above)

## 🎯 What's Next?

### For Development:
- Test all user flows (create, edit, delete, approve, reject)
- Verify email templates
- Check conflict detection with real appointments
- Test with different roles (admin vs practitioner)

### For Production:
1. Run deployment script: `./deploy-to-production.sh`
2. Apply migration on production: `npx prisma migrate deploy`
3. Restart production API
4. Test on production URL
5. Monitor email delivery
6. Announce feature to team

## 📚 Full Documentation
See `UNAVAILABILITY_IMPLEMENTATION.md` for complete technical documentation.

## 🆘 Need Help?
Common issues:
1. **API not loading module**: Restart API server
2. **Frontend not updating**: Hard refresh browser (Ctrl+Shift+R)
3. **403 Forbidden on approve/reject**: User must be admin
4. **Can't edit APPROVED request**: Only PENDING can be edited
5. **Slots not blocked**: Check unavailability is APPROVED status

Check logs:
- API logs: Console where `npm run dev` is running
- Browser console: F12 → Console tab
- Database: `npx prisma studio` to view data directly

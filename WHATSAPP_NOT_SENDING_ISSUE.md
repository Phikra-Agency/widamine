# 🐛 WhatsApp Not Sending - Root Cause Analysis

**Issue:** WhatsApp messages are not being sent when appointments are created or confirmed.

---

## 🔍 Root Cause

### Problem 1: WhatsApp Disabled in Production

**Current State:**
```bash
WHATSAPP_ENABLED=false  # or not set in production
```

**Impact:**
- WhatsApp service returns `{"status": "disconnected", "ready": false}`
- No QR code scanned in production
- WhatsApp client not initialized

**Solution:** Enable WhatsApp in Coolify environment variables

---

### Problem 2: Booking Acknowledgment Logic Issue

**Current Code (Line 220-244):**
```typescript
async sendNewBookingAcknowledgment(appointmentId: string) {
  if (!(await this.canSendAnyEmail())) return;  // ← WRONG!
  
  // ... fetch appointment ...
  
  await this.mailService.sendMail(...);
  
  // WhatsApp only sends if email is enabled
  if (await this.canSendAnyWhatsApp()) {
    await this.sendWhatsAppToAppointment(...);
  }
}
```

**Problem:** 
- Function returns early if email is disabled
- WhatsApp never gets a chance to send
- WhatsApp should be independent of email

---

### Problem 3: Frontend Not Deployed

**Current State:**
- Landing page shows old code (blue square icons)
- Admin dashboard may not have WhatsApp toggle
- Only API was deployed

**Evidence:**
- Landing page served by Apache/PHP (not Vite bundle)
- Icons not showing (ServiceIcon component not deployed)
- Bundle hash unknown

---

## 🎯 Issues Summary

| Issue | Status | Impact |
|-------|--------|--------|
| WhatsApp disabled in production | ⚠️ Not fixed | No WhatsApp messages sent |
| Booking logic checks email first | ⚠️ Not fixed | WhatsApp blocked by email check |
| Frontend not deployed | ⚠️ Not fixed | No UI to configure WhatsApp |
| Settings API works | ✅ Fixed | Can update settings via API |

---

## 🔧 Fixes Needed

### Fix 1: Remove Email Dependency

**Current (WRONG):**
```typescript
async sendNewBookingAcknowledgment(appointmentId: string) {
  if (!(await this.canSendAnyEmail())) return;  // ← Blocks everything!
  // ...
  if (await this.canSendAnyWhatsApp()) {
    await this.sendWhatsAppToAppointment(...);
  }
}
```

**Fixed (CORRECT):**
```typescript
async sendNewBookingAcknowledgment(appointmentId: string) {
  const appt = await this.prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { motif: true },
  });
  if (!appt) return;

  // Send email if enabled
  if (await this.canSendAnyEmail() && appt.email) {
    const html = this.wrap(...);
    await this.mailService.sendMail(appt.email, 'Réservation reçue — Widamine', html);
  }
  
  // Send WhatsApp INDEPENDENTLY if enabled
  if (await this.canSendAnyWhatsApp() && appt.phone) {
    await this.sendWhatsAppToAppointment(
      appt,
      `Bonjour ${appt.name}, votre demande de rendez-vous (${appt.motif?.name || 'Consultation'}) a bien été enregistrée. Notre équipe vous recontactera rapidement pour confirmer. — Widamine`,
    );
  }
}
```

---

### Fix 2: Enable WhatsApp in Production

**Steps:**
1. Open Coolify: https://server.wa-pharma.com
2. Navigate to widamine:api
3. Go to Environment Variables
4. Add or update:
   ```
   WHATSAPP_ENABLED=true
   ```
5. Redeploy API
6. Monitor deployment logs for QR code
7. Scan QR code with WhatsApp mobile (212773531420)

**Important:** QR code will appear in deployment logs like this:
```
[WhatsAppService] 🔄 Initializing WhatsApp client (OpenWA)...
[WhatsAppService]    💡 QR code will appear - scan it with WhatsApp mobile
```

---

### Fix 3: Deploy Frontend Applications

**Landing Page:**
- Need to find correct deployment method
- Landing page is NOT on Coolify (served by Apache/PHP)
- May be deployed via FTP, cPanel, or different server

**Admin Dashboard:**
- May also not be on Coolify
- Need to verify deployment location

**Action Required:**
- Check where landing/admin are deployed
- Update them with new code
- Verify bundle hash changes

---

## 📊 Testing After Fixes

### Test 1: Enable WhatsApp in Production

```bash
# 1. Set WHATSAPP_ENABLED=true in Coolify
# 2. Redeploy API
# 3. Check status
TOKEN=$(curl -s -X POST https://api.widamineaestheticcenter.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@widamine.com","password":"admin123"}' \
  | jq -r '.token')

curl https://api.widamineaestheticcenter.com/sms/whatsapp/status \
  -H "Authorization: Bearer $TOKEN"

# Should return:
# {"status": "connected", "connectedNumber": "212773531420", "ready": true}
```

---

### Test 2: Create Test Appointment

```bash
# Create appointment via API
TOKEN=$(curl -s -X POST https://api.widamineaestheticcenter.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@widamine.com","password":"admin123"}' \
  | jq -r '.token')

# Create test appointment
curl -X POST https://api.widamineaestheticcenter.com/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "test@test.com",
    "phone": "+212694563066",
    "context": "Test",
    "motifId": "<MOTIF_ID>"
  }'

# Check phone +212694563066 for WhatsApp message
```

---

### Test 3: Confirm Appointment

```bash
# Confirm appointment
curl -X PUT https://api.widamineaestheticcenter.com/appointments/<ID> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "CONFIRMED"}'

# Should send:
# - Email (if emailEnabled=true & emailConfirmation=true)
# - WhatsApp (if whatsappEnabled=true & whatsappConfirmation=true)
```

---

## 🎯 Priority Actions

### High Priority (Blocking WhatsApp)

1. **Fix booking acknowledgment logic** - Remove email dependency
2. **Enable WhatsApp in production** - Set WHATSAPP_ENABLED=true
3. **Scan QR code** - Connect WhatsApp client

### Medium Priority (Better UX)

4. **Deploy frontend** - So admins can toggle WhatsApp in UI
5. **Fix icons** - Deploy landing page with ServiceIcon changes

### Low Priority (Nice to Have)

6. **Persist WhatsApp session** - Mount volume to save session data
7. **Add WhatsApp status indicator** - Show in admin UI if connected

---

## 📝 Summary

**Why WhatsApp Isn't Sending:**

1. ✅ **API Code is Deployed** - Settings endpoints work
2. ⚠️ **WhatsApp Disabled** - WHATSAPP_ENABLED not set to true
3. ⚠️ **QR Not Scanned** - WhatsApp client not connected
4. ⚠️ **Logic Issue** - Booking acknowledgment checks email first
5. ⚠️ **Frontend Not Deployed** - No UI to configure settings

**Quick Fix (Backend Only):**
1. Fix the notification service code (remove email dependency)
2. Set WHATSAPP_ENABLED=true in Coolify
3. Redeploy API
4. Scan QR code
5. Test with appointment creation

**Complete Fix (Full Stack):**
1. Apply backend fixes
2. Deploy landing page (fix icons)
3. Deploy admin dashboard (WhatsApp toggle)
4. Test end-to-end flow

---

**Created by Kiro CLI - August 13, 2026**

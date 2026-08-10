# Practitioner Unavailability Management System

## Overview
Implemented a complete practitioner unavailability management system with admin approval workflow, email notifications, and integration with the appointment booking system.

## Features Implemented

### ✅ Backend API

#### 1. Database Schema (`api/prisma/schema.prisma`)
- Added `PractitionerUnavailability` model with fields:
  - `practitionerId`: Link to User (practitioner)
  - `startDate`, `endDate`: Date range for unavailability
  - `startTime`, `endTime`: Time range (supports both full-day and partial-day blocks)
  - `excuseType`: VACATION, TRAINING, MEDICAL, PERSONAL, OTHER
  - `customReason`: Text field for OTHER type
  - `status`: PENDING, APPROVED, REJECTED
  - `rejectionReason`: Optional text explaining rejection
  - `reviewedAt`, `reviewedBy`: Admin review tracking
- Migration applied: `20260806110220_add_practitioner_unavailability`
- Indexes on [practitionerId], [status], [startDate, endDate] for performance

#### 2. API Service (`api/src/unavailability/unavailability.service.ts`)
**CRUD Operations:**
- `create()`: Submit new unavailability request with conflict checking
- `findAll()`: List requests (filtered by practitioner for non-admin)
- `findOne()`: Get single request with details
- `update()`: Modify PENDING requests only (practitioner only)
- `delete()`: Delete PENDING requests only (practitioner only)

**Admin Operations:**
- `approve()`: Approve pending request → sends email to practitioner
- `reject()`: Reject pending request with optional reason → sends email

**Statistics:**
- `getStatistics()`: Returns:
  - `approvedThisMonth`: Days approved in current month
  - `approvedThisYear`: Days approved in current year
  - `upcomingApproved`: Count of future approved periods
  - `pendingRequests`: Count of pending requests

**Conflict Detection:**
- `checkConflictingAppointments()`: Checks for existing appointments in requested time range
- Returns list of conflicting appointments with patient/motif details
- Displayed as warning in admin approval modal

**Email Notifications:**
- `sendNewRequestEmailToAdmin()`: Notify all admins of new request
- `sendApprovalEmail()`: Notify practitioner when approved
- `sendRejectionEmail()`: Notify practitioner when rejected with reason

#### 3. API Controller (`api/src/unavailability/unavailability.controller.ts`)
**Endpoints:**
- `POST /unavailabilities` - Create new request (practitioners)
- `GET /unavailabilities` - List all (admin) or own (practitioner)
- `GET /unavailabilities/statistics` - Get statistics
- `GET /unavailabilities/:id` - Get single request
- `PUT /unavailabilities/:id` - Update PENDING request
- `DELETE /unavailabilities/:id` - Delete PENDING request
- `POST /unavailabilities/:id/approve` - Approve (admin only)
- `POST /unavailabilities/:id/reject` - Reject (admin only)

**Authorization:**
- All endpoints require JWT authentication
- Admin operations check `req.user.admin`
- Practitioners can only edit/delete their own PENDING requests

#### 4. Appointment Integration (`api/src/appointment/appointment.service.ts`)
**Updated `getAvailability()` method:**
- Now queries `PractitionerUnavailability` table for approved periods
- Filters slots where practitioner is unavailable
- Returns ALL slots with `available: true/false` flag
- Frontend shows unavailable slots with 30% opacity + disabled cursor

**Slot Blocking Logic:**
- Check if slot datetime falls within approved unavailability date range
- Check if slot time falls within unavailability time range
- Mark slot as `available: false` if conflict found

### ✅ Frontend Admin Dashboard

#### 1. Sidebar Menu (`admin/src/components/layouts/BackOfficeLayout.tsx`)
- Added "Indisponibilités" link with List icon
- Visible to: ADMIN, DOCTOR, PRACTITIONER roles
- Shows badge counter with pending requests count
- Integrated with `useSidebarCounts` hook

#### 2. Main Page (`admin/src/pages/back-office/Unavailabilities.tsx`)
**Header:**
- Title: "Indisponibilités"
- Description: Dynamic based on role (admin sees all, practitioners see own)
- Button: "Nouvelle demande" → opens form modal

**Statistics Cards (4 columns):**
- This month: Days approved this month
- This year: Days approved this year
- Upcoming: Count of future approved periods
- Pending: Count of pending requests

**Table:**
- Columns: [Practitioner], Period, Hours, Reason, Status, Actions
- Practitioner column only visible to admins
- Period: Formatted date range (e.g., "5 Jan 2026 → 10 Jan 2026")
- Hours: Time range (e.g., "09:00 - 18:00")
- Reason: Translated excuse type (Congé, Formation, Médical, Personnel, or custom text)
- Status: Badge with icon (Clock/CheckCircle/XCircle) and color coding
  - PENDING: Yellow
  - APPROVED: Green
  - REJECTED: Red (with rejection reason below)
- Actions:
  - Practitioners (PENDING only): "Modifier" + "Supprimer" buttons
  - Admin (PENDING only): "Approuver" + "Refuser" buttons

#### 3. Form Modal (`admin/src/components/UnavailabilityFormModal.tsx`)
**Fields:**
- Date range: Start date + End date (supports multi-day)
- Time range: Start time + End time (supports partial day or full day)
- Excuse type: Dropdown with:
  - Congé (VACATION)
  - Formation (TRAINING)
  - Médical (MEDICAL)
  - Personnel (PERSONAL)
  - Autre (OTHER) → shows text input "Saisir la raison"
- Custom reason: Text input (required when OTHER selected)

**Conflict Warning:**
- Shows yellow alert if existing appointments found
- Lists conflicting appointments with patient + motif + datetime
- Buttons: "Modifier" (go back) or "Continuer quand même"

**Validation:**
- Date range: End date must be >= start date
- Custom reason: Required if excuse type = OTHER
- All fields marked with * are required

#### 4. Approval Modal (`admin/src/components/ApprovalModal.tsx`)
**Displays:**
- Practitioner name + email (blue card)
- Period + Hours in grid layout
- Excuse type/reason

**Conflict Warning:**
- Shows yellow alert with ⚠️ if appointments found
- Lists all conflicting appointments
- Auto-populates rejection reason template: "Vous avez des rendez-vous existants pendant cette période"

**Actions:**
- "Annuler" button → close modal
- "Refuser" button → prompt for optional rejection reason (pre-filled if conflicts exist)
- "Approuver" button → approve and send email

#### 5. Sidebar Counter (`admin/src/hooks/useSidebarCounts.ts`)
- Added `unavailabilitiesCount` to hook
- Fetches `pendingRequests` from `/unavailabilities/statistics`
- Updates every 30 seconds
- Displayed as badge on sidebar link

#### 6. Router Integration (`admin/src/App.tsx`)
- Added lazy-loaded `Unavailabilities` page
- Route: `/unavailabilities`
- Protected by `RoleWrapper`: ADMIN, DOCTOR, PRACTITIONER

### ✅ Frontend Booking Flow (Already Done)

#### Appointment Availability (`landing/src/stores/scheduleModalStore.ts`)
- Updated slot mapping to read `available` flag from API
- Unavailable slots passed to UI components

#### Time Slot UI (`landing/src/components/BookingFlow.tsx`)
- Unavailable slots shown with:
  - 30% opacity
  - `cursor-not-allowed`
  - No hover effect
  - Disabled click interaction
- Available slots: Normal styling + hover effects

### ✅ Booking Conflict Prevention (Already Done)

#### Server-side Validation (`api/src/appointment/appointment.service.ts`)
- `checkTimeSlotConflict()`: Pre-create validation
- Checks for overlapping appointments by practitioner + resource
- Returns error if conflict found:
  ```json
  {
    "message": "Ce créneau horaire n'est plus disponible. Veuillez choisir un autre créneau.",
    "code": "time_slot_taken",
    "datetime": "2026-08-10T14:00:00Z"
  }
  ```

## How It Works

### User Flow - Practitioner

1. **Create Request:**
   - Navigate to "Indisponibilités" in sidebar
   - Click "Nouvelle demande"
   - Fill form: dates, times, excuse type, custom reason (if OTHER)
   - Submit → request created with status PENDING
   - Admin receives email notification

2. **Edit/Delete (PENDING only):**
   - View table, find PENDING request
   - Click "Modifier" → edit form pre-filled
   - Or click "Supprimer" → confirm deletion

3. **View Status:**
   - PENDING: Yellow badge, awaiting admin review
   - APPROVED: Green badge, slots now blocked in booking system
   - REJECTED: Red badge with rejection reason shown

4. **Email Notifications:**
   - Receives email when request is approved (✅)
   - Receives email when request is rejected (❌) with optional reason

### User Flow - Admin

1. **View All Requests:**
   - Navigate to "Indisponibilités" in sidebar
   - See all practitioners' requests in table
   - Pending requests badge shows count

2. **Review Request:**
   - Click "Approuver" on PENDING request
   - Modal opens with:
     - Practitioner details
     - Period + hours + reason
     - Conflict warning if appointments exist (⚠️)
     - List of conflicting appointments

3. **Approve:**
   - Click "Approuver" button
   - Status changes to APPROVED
   - Practitioner receives approval email
   - Slots automatically blocked in booking system

4. **Reject:**
   - Click "Refuser" button
   - Prompt appears for optional rejection reason
     - Pre-filled with "Vous avez des rendez-vous existants" if conflicts found
   - Status changes to REJECTED
   - Practitioner receives rejection email with reason

5. **Email Notifications:**
   - Receives email for each new request submission

## Technical Details

### Database Indexes
```prisql
@@index([practitionerId])
@@index([status])
@@index([startDate, endDate])
```
Performance optimized for:
- Filtering by practitioner
- Filtering by status
- Date range queries

### Time Range Logic
- Supports full day: `09:00 - 18:00`
- Supports partial day: `14:00 - 16:00`
- Supports multi-day: `startDate !== endDate`
- Time comparison: `slotTime >= startTime && slotTime < endTime`

### Availability Integration
1. Appointment service queries approved unavailabilities for practitioner
2. For each slot, checks if datetime falls within unavailability range
3. Checks if slot time falls within unavailability time window
4. Marks slot as `available: false` if match found
5. Frontend receives all slots with availability flag
6. UI applies disabled styling to unavailable slots

### Email Templates
All emails are HTML formatted with:
- Clinic branding
- Clear subject lines
- Practitioner name personalization
- Date/time details
- Action links (admin emails)
- Reason explanations (rejection emails)

### Security
- JWT authentication required for all endpoints
- Admin operations check `req.user.admin` flag
- Practitioners can only modify their own PENDING requests
- Approval/rejection requires admin role
- Delete/edit only allowed on PENDING status

### Error Handling
- Validation: Excuse type, custom reason (if OTHER), date ranges
- Authorization: Ownership checks, admin checks
- Status checks: Only PENDING requests can be edited/deleted/approved/rejected
- Conflict detection: Returns detailed appointment information

## Files Modified/Created

### Backend
- ✅ `api/prisma/schema.prisma` - Added PractitionerUnavailability model
- ✅ `api/prisma/migrations/20260806110220_add_practitioner_unavailability/` - Migration
- ✅ `api/src/unavailability/unavailability.service.ts` - Business logic + emails
- ✅ `api/src/unavailability/unavailability.controller.ts` - API endpoints
- ✅ `api/src/unavailability/unavailability.module.ts` - NestJS module
- ✅ `api/src/app.module.ts` - Registered UnavailabilityModule
- ✅ `api/src/appointment/appointment.service.ts` - Updated getAvailability() to check unavailability

### Frontend Admin
- ✅ `admin/src/pages/back-office/Unavailabilities.tsx` - Main page with table
- ✅ `admin/src/components/UnavailabilityFormModal.tsx` - Create/edit form
- ✅ `admin/src/components/ApprovalModal.tsx` - Admin approval interface
- ✅ `admin/src/components/layouts/BackOfficeLayout.tsx` - Added sidebar link
- ✅ `admin/src/hooks/useSidebarCounts.ts` - Added unavailabilities counter
- ✅ `admin/src/App.tsx` - Added route

### Frontend Landing (Already Done)
- ✅ `landing/src/stores/scheduleModalStore.ts` - Handle availability flag
- ✅ `landing/src/components/BookingFlow.tsx` - Disabled slot UI

## Testing Checklist

### Backend API
- [ ] Restart API server: `cd api && npm run dev`
- [ ] Test create: `POST /unavailabilities` with practitioner token
- [ ] Test list all: `GET /unavailabilities` with admin token
- [ ] Test statistics: `GET /unavailabilities/statistics`
- [ ] Test approve: `POST /unavailabilities/:id/approve` with admin token
- [ ] Test reject: `POST /unavailabilities/:id/reject` with admin token
- [ ] Verify email sent (check logs for "📧 Email sent")
- [ ] Test update PENDING: `PUT /unavailabilities/:id`
- [ ] Test delete PENDING: `DELETE /unavailabilities/:id`
- [ ] Test edit APPROVED → should fail with 400
- [ ] Test availability API returns `available: false` for blocked slots

### Frontend Admin
- [ ] Navigate to http://localhost:5174/unavailabilities
- [ ] Verify table loads with data
- [ ] Verify statistics cards show correct numbers
- [ ] Click "Nouvelle demande" → form modal opens
- [ ] Create request: fill form, submit → appears in table as PENDING
- [ ] Edit PENDING request → form pre-filled
- [ ] Delete PENDING request → removed from table
- [ ] Admin: Click "Approuver" → approval modal opens
- [ ] Admin: Verify conflict warning shows if appointments exist
- [ ] Admin: Click "Approuver" → status changes to APPROVED
- [ ] Admin: Click "Refuser" → prompt appears, enter reason → status REJECTED
- [ ] Verify sidebar badge shows pending count
- [ ] Verify rejection reason displayed in red under REJECTED badge

### Frontend Booking
- [ ] Navigate to booking flow (e.g., http://localhost:5173/reserver)
- [ ] Select motif with assigned practitioner who has approved unavailability
- [ ] Select date within unavailability range
- [ ] Verify unavailable slots shown with 30% opacity + disabled cursor
- [ ] Verify clicking unavailable slot does nothing
- [ ] Verify available slots are clickable

### Email Notifications
- [ ] Create request → admin receives email
- [ ] Approve request → practitioner receives approval email
- [ ] Reject request → practitioner receives rejection email with reason
- [ ] Check email logs: `/tmp/api-restart.log` or console

### Double Booking Prevention
- [ ] Create appointment for practitioner at specific time
- [ ] Try to create another appointment at same time → should fail with error
- [ ] Error message: "Ce créneau horaire n'est plus disponible..."

## Deployment

### Local Testing
```bash
# Terminal 1: API
cd /home/alae/Documents/repos/widamine/api
npm run dev

# Terminal 2: Admin Frontend
cd /home/alae/Documents/repos/widamine/admin
npm run dev

# Terminal 3: Landing Frontend (if testing booking)
cd /home/alae/Documents/repos/widamine/landing
npm run dev
```

### Production Deployment
```bash
# From workspace root
./deploy-to-production.sh
```

**Post-deployment:**
1. Run migration on production DB: `npx prisma migrate deploy`
2. Restart production API server
3. Clear frontend build cache if needed
4. Test unavailability creation/approval flow
5. Test booking flow with blocked slots
6. Verify emails are sent (check SMTP logs)

## Environment Variables

### Required for Email
```env
# .env (API)
SMTP_HOST=smtp.widamineaestheticcenter.com
SMTP_PORT=465
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM_EMAIL=admin@widamineaestheticcenter.com
SMTP_FROM_NAME=Widamine

# Optional: Admin dashboard URL for email links
ADMIN_URL=https://admin.widamineaestheticcenter.com
```

## Future Enhancements
- [ ] In-app notifications (bell icon) in addition to email
- [ ] Recurring unavailability (e.g., "Every Monday 9-10am")
- [ ] Calendar view for unavailabilities (visual timeline)
- [ ] Bulk approve/reject multiple requests
- [ ] Export unavailability report (PDF/CSV)
- [ ] Auto-rejection after X days pending
- [ ] Integration with external calendar (Google Calendar, Outlook)
- [ ] SMS notifications option
- [ ] Unavailability templates (common patterns)
- [ ] Historical analytics (most common excuse types, trends)

## Notes
- ✅ All slots returned by API (not filtered server-side)
- ✅ Frontend handles disabled state for unavailable slots
- ✅ Only PENDING requests can be edited/deleted by practitioners
- ✅ Approved unavailabilities automatically block booking slots
- ✅ Admin sees conflict warning with appointment details
- ✅ Email notifications sent for all status changes
- ✅ Statistics show approved days (not periods)
- ✅ Excuse types are predefined + OTHER with custom text
- ✅ Rejection reason is optional but pre-filled if conflicts exist
- ✅ Multi-day and partial-day periods supported

## Support
For issues or questions:
1. Check API logs: `/tmp/api-restart.log`
2. Check browser console for frontend errors
3. Verify database migration applied: `npx prisma migrate status`
4. Test email delivery: Check SMTP configuration
5. Verify user roles: Admin operations require `admin: true` in user table

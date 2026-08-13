# Widamine Full Repository Analysis

**Analysis Date:** August 13, 2026  
**Repository:** `/home/alae/Documents/repos/widamine`

---

## 📊 Project Overview

**Widamine** is a medical clinic management platform built as a monorepo with three main applications:

### Architecture
```
widamine/
├── api/          # NestJS backend API (port 3000)
├── admin/        # React admin dashboard (port 5174)
├── landing/      # React public website (port 5173)
└── package.json  # Root workspace manager (Turbo)
```

---

## 🏗️ Technology Stack

### Backend (API)
- **Framework:** NestJS 10.3.0
- **Database:** PostgreSQL (Prisma ORM 5.22.0)
- **Authentication:** JWT with cookies
- **Email:** Brevo API (300 emails/day free tier)
- **Scheduled Jobs:** @nestjs/schedule
- **Validation:** class-validator, class-transformer
- **Password Hashing:** bcrypt 6.0.0
- **Date Handling:** date-fns, date-fns-tz

### Frontend (Admin & Landing)
- **Framework:** React 19.2.0
- **Build Tool:** Vite 8.0.3
- **Router:** React Router DOM 7.13.1
- **Styling:** Tailwind CSS 4.2.1
- **State Management:** Zustand 5.0.11
- **UI Components:**
  - Admin: @phosphor-icons/react, shadcn, @tanstack/react-table
  - Landing: @mantine/core, framer-motion, gsap, swiper
- **Forms:** zod 4.3.6 validation
- **HTTP Client:** axios 1.13.6
- **Notifications:** react-hot-toast 2.6.0

### DevOps
- **Monorepo Manager:** Turbo 2.5.4
- **Package Manager:** npm 11.13.0
- **Node Version:** >=20
- **Containerization:** Docker Compose
- **Deployment:** Coolify (self-hosted)

---

## 🗄️ Database Configuration

**Connection:**
- **Host:** 91.98.161.53:5420
- **Database:** postgres
- **User:** postgres
- **Status:** ✅ Accepting connections
- **ORM:** Prisma (schema in `api/prisma/schema.prisma`)

**Key Models:**
- User (ADMIN, DOCTOR, PRACTITIONER, RECEPTIONIST roles)
- Patient
- Appointment (with Schedule)
- Motif (treatment/service type)
- Resource (rooms, equipment)
- Contact (form submissions)
- Category (service categories)
- Settings (notification preferences)

---

## 🔧 API Endpoints Structure

### Authentication
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh` - Token refresh
- `POST /check-email` - Email identification

### Core Resources
- `/appointments` - Appointment management
  - `GET /queue` - Pending appointments (ADMIN, RECEPTIONIST)
- `/patients` - Patient CRUD
- `/motifs` - Treatment types
- `/schedules` - Calendar schedules
- `/resources` - Clinic resources
- `/contacts` - Contact form submissions
- `/users` - User management
- `/categories` - Service categories
- `/settings` - System settings
  - `GET /notifications` - Notification settings (ADMIN only)
  - `PUT /notifications` - Update settings (ADMIN only)

### Public Endpoints
- `GET /motifs/public` - Public treatment list
- `GET /services/public` - Public services list
- `POST /chatbot` - AI chatbot (GROQ API)

---

## 🎨 Frontend Applications

### Landing (Public Site) - Port 5173
**Features:**
- Service browsing with filtering
- Online booking flow (multi-step)
- Contact form
- AI Chatbot (GROQ-powered)
- Service detail pages
- About page
- Practitioner status bar
- Responsive design with animations

**Key Components:**
- `BookingFlow.tsx` - Multi-step appointment booking (1111 lines)
- `Chatbot.tsx` - AI assistant (576 lines)
- `PublicNavbar.tsx` - Main navigation (397 lines)
- `PractitionerStatusBar.tsx` - Real-time practitioner availability (358 lines)
- `ServiceIcon.tsx` - Dynamic colored icons (CSS mask technique)

**State Stores:**
- `schedulesStore` - Calendar data
- `motifsStore` - Treatment types
- `servicesStore` - Services catalog
- `appointmentsStore` - Booking state
- `patientsStore` - Patient data
- `authStore` - Authentication

### Admin (Staff Dashboard) - Port 5174
**Features:**
- Calendar view (day/week/month)
- Patient management
- Appointment verification queue
- User management (staff)
- Resource management
- Notification system (role-based)
- Settings configuration
- Dark/light theme

**Key Components:**
- `CalendarControlBar.tsx` - Calendar navigation
- `BackOfficeLayout.tsx` - Main layout with sidebar
- `Patients.tsx` - Patient table with filters
- Data tables with pagination, sorting, filtering

**State Stores:**
- Same as landing + `notificationsStore` (with role-based access)

---

## 🔐 Authentication & Authorization

### Roles
1. **ADMIN** - Full access to all features
2. **RECEPTIONIST** - Appointments, patients, contacts
3. **DOCTOR** - View schedules, patient records
4. **PRACTITIONER** - Similar to doctor

### Role-Based Access Control
- `/settings/notifications` - ADMIN only
- `/appointments/queue` - ADMIN, RECEPTIONIST
- `/contacts?read=false` - All authenticated roles

### JWT Flow
1. Email identification (`/check-email`)
2. Password verification (`/login`)
3. JWT token + refresh cookie
4. Auto-refresh on app load
5. Axios interceptor for auth errors

---

## 📧 Email System

### Brevo Integration
- **API Key:** Set in `.env` as `BREVO_API_KEY`
- **Free Tier:** 300 emails/day
- **Sender:** alanwaivy@gmail.com
- **Fallback:** Ethereal Email (fake inbox for testing)

### Email Types
- Appointment confirmations
- Appointment reminders
- Cancellation notices
- Contact form notifications

---

## 🤖 AI Features

### Chatbot (GROQ API)
- **Model:** llama-3.3-70b-versatile
- **API Key:** Set in `.env` as `GROQ_API_KEY`
- **Status:** ⚠️ Returns 403 (IP/network restriction)
- **Implementation:** `api/src/chatbot/chatbot.service.ts`
- **Features:**
  - Conversation context tracking
  - Emoji-enhanced logging
  - Error handling with fallbacks

---

## 🔔 Notification System

### Features
- In-app notifications (bell icon)
- 30-second polling interval
- Role-based notification types
- Unread count badge
- Mark as read functionality

### Notification Types
1. **New Booking** - Appointment queue items
2. **New Contact** - Contact form submissions
3. **Cancellation** - Appointment cancellations (future)
4. **Reminder** - Appointment reminders (future)

### Access Matrix
```
Role          | Settings | Appointments | Contacts
------------- |----------|--------------|----------
ADMIN         |    ✅    |      ✅      |    ✅
RECEPTIONIST  |    ❌    |      ✅      |    ✅
DOCTOR        |    ❌    |      ❌      |    ✅
PRACTITIONER  |    ❌    |      ❌      |    ✅
```

---

## 🐛 Known Issues & Recent Fixes

### Fixed Issues (Session 2)
1. ✅ **Patients page crash** - `items.forEach` error
   - Added array safety check
2. ✅ **Notification 403 errors** - Non-admin users
   - Implemented role-based endpoint access
3. ✅ **Calendar "Aujourd'hui" spacing** - Desktop header
   - Adjusted positioning from 130px to 155px
4. ✅ **Services dropdown filtering** - Only active/bookable
   - Added API-level filtering
5. ✅ **Dynamic icon colors** - CSS mask technique
   - Icons now match treatment colors
6. ✅ **Unavailable slots messaging** - "Indisponible" label
   - Added to booking flow

### Current Issues
1. ⚠️ **GROQ API 403 Error**
   - Issue: Network/IP restriction
   - Location: `api/src/chatbot/chatbot.service.ts`
   - Action needed: User must whitelist IP at console.groq.com

2. ⚠️ **Browser Extension Warnings** (Non-critical)
   - MaxListenersExceededWarning from MetaMask extension
   - Can be ignored (browser extension issue)

---

## 🚀 Running the Application

### Prerequisites
```bash
# Install Node.js >= 20
# Ensure PostgreSQL is accessible at 91.98.161.53:5420
```

### Quick Start
```bash
cd /home/alae/Documents/repos/widamine

# Install dependencies (if needed)
npm install

# Generate Prisma client
npm run db:generate

# Seed database (if first time)
npm run db:seed

# Start all services
./start-all.sh
```

### Manual Start
```bash
# Terminal 1 - API
cd api && npm run dev

# Terminal 2 - Admin
cd admin && npm run dev

# Terminal 3 - Landing
cd landing && npm run dev
```

### Access Points
- **API:** http://localhost:3000
- **Landing:** http://localhost:5173
- **Admin:** http://localhost:5174

### Default Credentials
- **Email:** admin@widamine.com
- **Password:** admin123

---

## 📝 Development Scripts

### Root Commands
```bash
npm run dev           # Start all services (Turbo)
npm run build         # Build all packages
npm run lint          # Lint all packages
npm run typecheck     # TypeScript check (admin only)
npm run db:generate   # Generate Prisma client
npm run db:seed       # Seed database
npm run bootstrap     # Install + generate Prisma
```

### Docker Commands
```bash
npm run docker:up     # Start in Docker
npm run docker:down   # Stop Docker containers
npm run docker:logs   # View Docker logs
```

---

## 📂 Important Files

### Configuration
- `.env` - Environment variables
- `turbo.json` - Monorepo build config
- `docker-compose.yml` - Docker setup
- `api/prisma/schema.prisma` - Database schema

### Documentation
- `README.md` - Main documentation
- `DEPLOYMENT.md` - Deployment guide
- `FIXES_SUMMARY.md` - Bug fix log
- `CHATBOT_FIX.md` - Chatbot troubleshooting

### Scripts
- `start-all.sh` - Start all services
- `start-tmux.sh` - Start in tmux session
- `deploy-to-production.sh` - Production deployment
- `verify-deployment.sh` - Post-deploy checks

---

## 🔍 Code Quality Observations

### Strengths
✅ Well-organized monorepo structure  
✅ Consistent naming conventions  
✅ Comprehensive state management with Zustand  
✅ Role-based access control implemented  
✅ Error boundaries and error handling  
✅ Type-safe with TypeScript  
✅ Responsive design with Tailwind  
✅ Modular component architecture  

### Areas for Improvement
⚠️ Large components (BookingFlow: 1111 lines) - could be split  
⚠️ Some API endpoints lack proper error messages  
⚠️ Missing unit tests (jest configured but not implemented)  
⚠️ Console logs in production code (chatbot emoji logs)  
⚠️ Hardcoded values in some places (polling interval: 30s)  
⚠️ Missing API documentation (no Swagger/OpenAPI)  

---

## 📊 Statistics

### Codebase Size
- **Total Files:** 383
- **Lines of Code:** ~10,273 (in first 100 files)
- **Functions:** ~218
- **Classes/Interfaces:** ~40

### Package Breakdown
- **API:** NestJS backend with 20+ endpoints
- **Admin:** React app with 100+ components
- **Landing:** React app with 50+ components
- **Shared:** UI components, utilities, types

---

## 🔄 Recent Changes Timeline

### Latest Session (August 13, 2026)
1. Fixed patients page crash
2. Implemented role-based notifications
3. Fixed calendar spacing issue
4. Updated GROQ API key (still restricted)

### Previous Sessions
1. Services dropdown filtering
2. Chatbot error logging enhancement
3. Contact notifications polling
4. Dynamic service icon colors
5. Unavailable slots messaging
6. Calendar mobile layout fixes

---

## 🎯 Recommended Next Steps

### Immediate
1. ✅ Generate Prisma client - DONE
2. ✅ Start all services - Ready to execute
3. 🔍 Test notification system for all roles
4. 🔍 Verify calendar spacing fix
5. 🔍 Test services dropdown filtering

### Short-term
1. Fix GROQ API IP restriction (user action required)
2. Add API documentation (Swagger)
3. Write unit tests for critical components
4. Split large components (BookingFlow)
5. Remove console.log statements
6. Add loading states for better UX

### Long-term
1. Implement WebSocket for real-time notifications
2. Add appointment reminder system
3. Implement cancellation workflow
4. Add analytics dashboard
5. Add multi-language support
6. Performance optimization (lazy loading, code splitting)

---

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Test connection
pg_isready -h 91.98.161.53 -p 5420 -U postgres

# If fails, check:
# 1. Firewall settings
# 2. DATABASE_URL in .env
# 3. Network connectivity
```

### Port Already in Use
```bash
# Find and kill processes
lsof -i :3000 -i :5173 -i :5174 | grep LISTEN
kill -9 <PID>
```

### Prisma Issues
```bash
# Regenerate client
npm run db:generate

# Reset database (⚠️ deletes data)
cd api && npm run reset
```

### Build Errors
```bash
# Clean and reinstall
rm -rf node_modules api/node_modules admin/node_modules landing/node_modules
npm install
npm run bootstrap
```

---

## 📞 Support Resources

- **Repository:** `/home/alae/Documents/repos/widamine`
- **Database:** 91.98.161.53:5420
- **Logs:** `/tmp/widamine-*.log`
- **PIDs:** `/tmp/widamine-*.pid`

---

**Analysis completed by Kiro CLI**  
**Ready to start services!** 🚀

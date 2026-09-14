# Components Reference

> The old monolithic `frontend/` has been fully replaced.  
> Current packages: [`landing/`](../packages/landing.md) · [`admin/`](../packages/admin.md)

---

## Landing Components

### Public-facing

| Component | File | Purpose |
|-----------|------|---------|
| PublicNavbar | `components/PublicNavbar.tsx` | Floating pill navbar, mega-menu, mobile drawer |
| PublicFooter | `components/PublicFooter.tsx` | Footer with social icons, service links, legal |
| BookingFlow | `components/BookingFlow.tsx` | Full booking modal (type → calendar → form) |
| Chatbot | `components/Chatbot.tsx` | Floating chatbot, Groq-powered, lead capture |
| BmiPopup | `components/BmiPopup.tsx` | BMI calculator popup |
| ContactPopup | `components/ContactPopup.tsx` | Contact form popup |
| ServiceIcon | `components/ServiceIcon.tsx` | Per-slug SVG icons |
| ServiceDecorative | `components/ServiceDecorative.tsx` | Decorative service page elements |
| Preloader | `components/Preloader.tsx` | Page preloader animation |

### Back-office (within landing routes)

| Component | File | Purpose |
|-----------|------|---------|
| BackOfficeLayout | `components/layouts/BackOfficeLayout.tsx` | Dark sidebar layout |
| BackOfficeLayoutDark | `components/layouts/BackOfficeLayoutDark.tsx` | Alternate dark theme |
| PractitionerStatusBar | `components/PractitionerStatusBar.tsx` | Live status bar |
| ScheduleShowModal | `components/ScheduleShowModal.tsx` | Appointment detail |
| Scheduling | `components/Scheduling.tsx` | Scheduling UI |

---

## Admin Components

### Layout

| Component | File | Purpose |
|-----------|------|---------|
| BackOfficeLayout | `components/layouts/BackOfficeLayout.tsx` | Main sidebar + nav |
| SidebarSearch | `components/layouts/SidebarSearch.tsx` | Global search in sidebar |

### Modals & Overlays

| Component | File | Purpose |
|-----------|------|---------|
| ScheduleShowModal | `components/ScheduleShowModal.tsx` | View appointment details |
| UnavailabilityFormModal | `components/UnavailabilityFormModal.tsx` | Add/edit practitioner block |
| ApprovalModal | `components/ApprovalModal.tsx` | Confirm destructive actions |
| SettingsModal | `components/SettingsModal.tsx` | Notification channel settings (email, WhatsApp) |

### Data Display

| Component | File | Purpose |
|-----------|------|---------|
| DataTable | `components/data-table/DataTable.tsx` | Generic table with filters |
| TanStackDataTable | `components/data-table/TanStackDataTable.tsx` | TanStack Table v8 wrapper |
| PractitionerAnalytics | `components/calendar/PractitionerAnalytics.tsx` | Practitioner stats panel |
| CalendarNotificationBell | `components/calendar/CalendarNotificationBell.tsx` | Unread notification count |

### Wrappers

| Component | File | Purpose |
|-----------|------|---------|
| AuthWrapper | `components/wrappers/AuthWrapper.tsx` | Redirect if not authenticated |
| UnauthWrapper | `components/wrappers/UnauthWrapper.tsx` | Redirect if authenticated |
| RoleWrapper | `components/wrappers/RoleWrapper.tsx` | Restrict by role |
| RefreshWrapper | `components/wrappers/RefreshWrapper.tsx` | Token refresh on mount |

### UI Kit (shadcn/ui v4)

All in `components/ui/`: badge, button, card, checkbox, dialog, dropdown-menu, input, label, popover, scroll-area, select, separator, sheet, switch, table, tabs, textarea.

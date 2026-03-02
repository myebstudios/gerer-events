# Gerer Events — Product Details & Technical Specs (MVP v1)

## 1) Product Vision
Gerer Events is a premium event management platform that combines:
- Elegant event invitation pages
- RSVP + QR-based guest operations
- Host analytics and post-event memory capture

Core promise: **Beautiful to share, reliable on event day, insightful after event day.**

---

## 2) Target Users (Phase 1)
- Couples and families (weddings, birthdays, private ceremonies)
- Independent event hosts
- Boutique planners managing multiple clients

Phase 2 expansion:
- Corporate events
- Conferences
- Community/church events

---

## 3) Brand & Design Direction
### Design Theme (Launch)
**Luxury Editorial + Afro-Luxury Fusion**

### Visual Identity
- Ndop-inspired geometry for structure
- Toghu-inspired motifs for ceremonial detail
- Premium editorial spacing and typography
- Mobile-first cinematic feel

### Hero Template (Wedding Launch)
Template name: **Eternal Vows, Heritage Edition**

Palette:
- Espresso Brown `#3B241A`
- Aged Gold `#C8A96B`
- Clay Bronze `#8C5A3C`
- Warm Ivory `#F6EFE6`
- Cocoa Black `#1E140F`

Hero behavior:
- Full-screen couple portrait
- Soft espresso overlay
- Gold monogram focal point
- Romantic-poetic copy style

Sample headline:
- “Two hearts, one rhythm, forever begins here.”

---

## 4) Core MVP Features
## 4.1 Host Event Setup
- Create event with title, date, location, description, event type
- Event type templates (wedding first, expandable to all categories)
- Branding options: theme color, cover image, typography presets

## 4.2 Invite & Access
- Public event link
- QR pass generated for each confirmed guest
- Share-friendly invitation assets (social-ready)

## 4.3 RSVP Flow (One-Page)
Fields:
- Full name
- Contact (email/phone)
- Attendance intent: Yes / No / Maybe
- Plus-one count
- Meal preference (optional)
- Message to host/couple (optional)

Post-submit:
- Confirmation screen
- Personal QR pass for check-in

## 4.4 Event Day Check-In
- Scanner interface for staff
- QR scan marks attendance status in real time
- Attendance logs visible in dashboard

## 4.5 Post-Event Media Uploads
- Upload section unlocked for **checked-in guests only**
- Default moderation: **Auto-approve**
- Optional moderation mode: **Review before publish**
- Host actions: approve/reject/hide/feature/download album zip

## 4.6 Host Analytics Dashboard (Top Priority Order)
1. RSVP rate
2. Actual check-ins
3. Media uploads
4. Plus-ones
5. No-show rate

---

## 5) Pages & Product Architecture
## Public Pages
- Event Landing Page
- RSVP Section (embedded one-page flow)
- Confirmation/QR Pass View
- Guest Upload Page (post-event, access-controlled)

## Private Pages (Host)
- Auth/Login
- Event Creation Wizard
- Event Dashboard
- Guest List Management
- Check-In Console
- Media Moderation Center
- Settings/Billing

---

## 6) Functional Requirements
- Multi-event support per user account
- Role support (Owner, Co-host, Check-in Staff, Viewer)
- Event status lifecycle (Draft, Published, Live, Ended)
- RSVP and check-in data synchronization in real time
- File upload constraints (type/size/count)
- Export support (CSV for guest stats)

---

## 7) Suggested Data Model (MVP)
Key tables/entities:
- `users`
- `organizations` (optional for agency mode)
- `events`
- `event_settings`
- `event_templates`
- `guests`
- `invitations`
- `rsvps`
- `qr_passes`
- `checkins`
- `media_uploads`
- `media_moderation_logs`
- `roles`
- `event_user_roles`
- `plans`
- `subscriptions`
- `event_pass_purchases`

---

## 8) Security & Trust
- Upload access gated to checked-in guests
- Role-based permissions per event
- Host-level moderation controls
- Basic anti-spam upload controls
- Audit logs for check-in and moderation actions

---

## 9) Non-Functional Requirements
- Fast mobile rendering (primary audience is mobile)
- QR scan speed and reliability prioritized
- Graceful behavior under poor internet conditions
- Scalable media storage strategy

---

## 10) MVP Build Plan (2 Weeks)
### Week 1
- Event creation flow
- Template rendering (Eternal Vows)
- RSVP one-page system
- QR generation + pass issuance

### Week 2
- Check-in console
- Dashboard metrics
- Post-event upload flow
- Moderation controls
- Pricing gate (Free + Event Pass)

---

## 11) Future Expansion (Post-MVP)
- More premium template packs
- Agency white-label portal
- Smart reminders (SMS/WhatsApp credits)
- AI-generated event recap album/story
- Corporate event workflows

---

## 12) Product Summary
Gerer Events v1 should launch as a **design-first event experience platform** that starts with weddings and scales to all event types, while keeping operations simple and premium.
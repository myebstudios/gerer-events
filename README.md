# Gerer Events

**Design-first event management for modern celebrations, guest operations, and shared memories.**

Gerer Events is a premium event platform built to help hosts and planners create beautiful invitation experiences, manage RSVPs, run QR-based check-in, and collect post-event media in one place.

---

## ✨ Product Vision

Gerer Events is built around a simple promise:

**Beautiful to share. Reliable on event day. Useful after the event ends.**

Instead of feeling like generic event software, the product aims to deliver:
- luxury invitation pages
- elegant guest flows
- operational check-in tools
- analytics that matter
- media collection after the event

---

## 🧩 Core Features

### Public Event Experience
- Premium invitation landing pages
- Event-specific templates
- RSVP flow with guest details
- QR pass generation
- Guest-facing event links

### Host Dashboard
- Event creation and management
- RSVP monitoring
- Guest list management
- Event status controls
- Shareable invitation links
- QR generation tools

### Check-In Operations
- Manual guest check-in
- Camera-based QR scanner flow
- Token fallback verification
- Searchable guest list for event staff

### Post-Event Media
- Guest upload flow
- Media moderation support
- Event gallery management

---

## 🎨 Design Direction

Gerer Events is intentionally **design-led**.

Current visual direction blends:
- editorial layouts
- luxury presentation
- high-contrast UI hierarchy
- event-driven storytelling
- mobile-first guest experiences

Template direction includes:
- **Eternal Vows**
- **Velvet Nights**
- **PlayPulse**
- **Clean Canvas**

---

## 🛠 Tech Stack

### Frontend
- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **HeroUI**
- **Framer Motion**

### Current Backend
- **Convex**
- Convex storage + queries + mutations

### Planned Migration
- **Supabase** for:
  - Postgres database
  - Auth
  - Storage
  - Realtime-compatible event workflows

---

## 📌 Current Project Status

This project is actively evolving.

### Implemented / In Progress
- Event creation flow
- Public event pages
- RSVP routes
- QR pass generation
- Dashboard views
- Check-in UI
- HeroUI migration foundation
- Mobile responsiveness fixes in key dashboard flows

### Known Direction
The project is preparing for a **Convex → Supabase migration** to improve:
- auth architecture
- database structure
- storage workflows
- long-term maintainability
- operational flexibility

---

## 🚀 Local Development

### Install
```bash
npm install
```

### Start dev server
```bash
npm run dev
```

### Type-check
```bash
npm run lint
```

### Production build
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

---

## 🔐 Environment Setup

Copy the example env file:

```bash
cp .env.example .env.local
```

Fill in the required values for the current backend.

As the project migrates to Supabase, environment requirements will shift toward:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 📱 Deployment

Current production deployment is handled through **Netlify**.

Production URL:
- <https://gerer-events.netlify.app>

Deployment flow:
- build with Vite
- publish `dist/`
- deploy through Netlify

---

## 🗺 Near-Term Roadmap

### Product
- stronger guest management flows
- smoother mobile check-in UX
- better public RSVP polish
- more resilient QR scanning experience
- richer media moderation

### Platform
- migrate backend to Supabase
- replace local session hacks with proper auth
- move uploads to Supabase Storage
- tighten permissions and role handling
- improve bundle size and code splitting

---

## 🧪 Notes for Contributors

If you’re touching this codebase:
- preserve mobile-first behavior
- prioritize event-day reliability over flashy complexity
- avoid brittle auth/localStorage shortcuts in new code
- keep host operations fast and low-friction
- prefer clean, production-safe patterns over AI-demo hacks

---

## 📚 Internal Docs

Supplementary project docs live in `/docs`:
- `docs/Gerer-Events_App-Specs.md`
- `docs/Gerer-Events_Business-Plan.md`
- `docs/Gerer-Events_Master-Deck.md`

These cover:
- product scope
- business strategy
- monetization direction
- platform vision

---

## 💬 Final Take

Gerer Events is not meant to be just another RSVP tool.

The goal is to build a platform where:
- hosts feel proud sharing the invitation
- staff can manage entry without chaos
- guests can engage before and after the event
- planners have a more premium operational workflow

That is the bar.

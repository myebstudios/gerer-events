# Gerer Events

Design-first event management platform for premium event pages, RSVP + QR check-in, and post-event memory uploads.

## Current status
- Imported from your Google Drive codebase
- Build issues fixed for deploy readiness
- Netlify production deploy configured in this session

## Tech stack
- React + TypeScript + Vite
- Convex (backend/state)
- Tailwind CSS

## Scripts
- `npm run dev` - local dev (currently triggers Convex deploy, see note below)
- `npm run lint` - TypeScript check
- `npm run build` - production build
- `npm run preview` - preview built app

## Important note
`npm run dev` currently runs `npx convex deploy --yes && vite ...`.
For safer local development, consider changing it to just `vite --port=3000 --host=0.0.0.0` and run Convex deploy manually when needed.

## Environment
Copy `.env.example` to `.env.local` and fill required values.

## Delivered review
See `REVIEW.md` for what aligns, what was fixed, and what still needs implementation.

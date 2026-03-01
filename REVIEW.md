# Gerer Events - Initial Code & Product Review

## Alignment with brainstormed scope

### ✅ Aligned
- Public event pages exist (`PublicEventPage`, `RSVPPage`, `QRPassPage`, `UploadPage`).
- Dashboard pages exist for create/list/details/check-in.
- RSVP and upload flows are present.
- Visual direction is premium and close to luxury editorial style.

### ⚠️ Gaps / mismatches
- Branding still generic in places (`react-example`, README from AI Studio/Gemini).
- Convex generated files were empty on import, which broke build.
- TypeScript errors in 4 public pages (`styles` used before declaration).
- `npm run dev` currently runs `npx convex deploy --yes`, risky for local dev.
- Upload gating to checked-in guests is not yet fully enforced server-side from current review.
- Dashboard KPI ordering should be explicitly implemented to match agreed order.

### ✅ Fixes applied now
- Added fallback Convex api stubs in `convex/_generated/api.*` so build works.
- Fixed TypeScript declaration-order bug across public pages.
- Verified `npm run lint` and `npm run build` both pass.

## Recommended next sprint
1. Replace fallback Convex stubs with real `npx convex codegen` output.
2. Implement strict upload authorization (checked-in guests only) at backend mutation level.
3. Lock dashboard KPI order to: RSVP rate, check-ins, media uploads, plus-ones, no-show rate.
4. Rename package/app metadata from `react-example` to `gerer-events`.
5. Update README with deployment and env setup for production.
6. Add route-level guards for host-only dashboard pages.


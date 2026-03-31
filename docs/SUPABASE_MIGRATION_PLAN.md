# Gerer Events - Supabase Migration Plan

## Objective
Migrate Gerer Events from Convex to Supabase with a staged, low-chaos plan covering auth, database, storage, and frontend data access.

## Hosted Project
- Project name: `gerer-events`
- Project ref: `ovmshwvthmwtgngbtefi`
- Region: `eu-west-1`

## Phase 1 - Foundation
1. Create hosted Supabase project
2. Link CLI to hosted project
3. Initialize local Supabase project in repo
4. Define target Postgres schema
5. Create storage buckets and access policies

## Phase 2 - Database Schema
Target entities:
- profiles
- events
- event_staff
- guests
- media_uploads
- quick_qr_codes

Planned capabilities:
- proper foreign keys
- timestamps
- status constraints
- RLS-ready ownership relationships

## Phase 3 - Auth Migration
Replace custom email/password handling and localStorage userId workflow with Supabase Auth:
- sign up
- sign in
- sign out
- session restoration
- route protection

## Phase 4 - Data Layer Migration
Replace Convex queries and mutations with Supabase access patterns for:
- events
- guests / RSVPs
- check-in
- media moderation
- profile settings

## Phase 5 - Storage Migration
Move uploads from Convex storage to Supabase Storage:
- event covers
- guest uploads
- signed/public URL handling

## Phase 6 - Frontend Refactor
Page-by-page migration order:
1. auth pages
2. dashboard event listing
3. create event
4. event details
5. public event page
6. RSVP flow
7. QR pass flow
8. upload flow
9. check-in page

## Phase 7 - QA and Cutover
- test auth
- test event CRUD
- test RSVP flow
- test check-in flow
- test uploads
- remove Convex remnants
- update Netlify envs

## Notes
- Keep migration incremental to avoid full-project breakage.
- Commit at the end of each stable phase.

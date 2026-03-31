# Gerer Events — Production Plan

## Goal
Move Gerer Events from a working private beta into a production-ready event platform that is secure, reliable, mobile-safe, and operationally trustworthy for real hosts and real events.

---

## Current Status
Gerer Events is already in a strong testable state:
- Supabase-backed
- deployed on Netlify
- signup/login working
- event creation working
- public event pages working
- RSVP flow working
- QR pass flow working
- upload flow working
- check-in flow working

However, it is **not yet fully production-ready**.

---

## Production Readiness Workstreams

## 1. Backend Security & Stability
### 1.1 Final RLS Audit
Audit and finalize row-level security policies for:
- `profiles`
- `events`
- `event_staff`
- `guests`
- `media_uploads`
- `quick_qr_codes`
- storage bucket `event-media`

For each table, define:
- who can read
- who can insert
- who can update
- who can delete

Output:
- final policy matrix
- final SQL migrations
- no recursive policies
- no accidental public write access

### 1.2 Storage Hardening
Add and verify:
- MIME type restrictions
- file size enforcement
- structured upload paths
- cleanup rules for deleted records
- moderation-safe access patterns

### 1.3 Remove Migration Leftovers
Clean out:
- dead code from Convex era
- stale environment variables
- obsolete dependencies
- unused helper logic

---

## 2. Authentication & Session Hardening
### 2.1 Finalize Auth Flow
Verify and harden:
- signup
- confirmation email
- redirect behavior
- sign in
- sign out
- session persistence
- route protection

### 2.2 Profile Setup Flow
Improve first-login experience:
- profile completion
- display name handling
- avatar optionality
- clean settings UX

### 2.3 Password Reset
Implement:
- forgot password request
- reset password page
- success/failure handling

---

## 3. Full Product QA
### 3.1 Host Flow Testing
End-to-end testing for:
- create account
- verify email
- sign in
- create event
- edit event
- publish event
- go live
- end event
- delete event
- copy invite link
- generate QR
- upload cover image
- moderate media
- export CSV

### 3.2 Guest Flow Testing
Test:
- open public event page
- RSVP yes/no/maybe
- plus-one flow
- QR pass generation
- revisit QR pass
- upload access before check-in
- upload access after check-in
- invalid token handling

### 3.3 Check-In Flow Testing
Test:
- manual check-in
- check-out
- QR scan with raw token
- QR scan with full URL
- duplicate scan handling
- invalid scan handling
- mobile browser behavior
- fast staff usage under event pressure

Output:
- QA checklist
- pass/fail log
- bug queue

---

## 4. Event-Day Reliability
### 4.1 Check-In UX Hardening
Improve:
- touch target size
- feedback speed
- duplicate scan prevention
- scan success/failure clarity
- faster manual fallback
- search speed

### 4.2 Network Resilience
Add:
- stronger loading states
- retry handling
- graceful failure UX
- better temporary offline messaging

### 4.3 Edge-Case Protection
Protect against:
- duplicate RSVPs
- duplicate guests
- invalid QR reuse
- upload abuse
- slug collisions
- invalid event status transitions

---

## 5. UX & Mobile Polish
### 5.1 Replace Weak Error UX
Replace raw alerts with:
- toast notifications
- inline form errors
- better empty states
- recovery guidance

### 5.2 Mobile Audit
Audit every important screen on real phones:
- login
- dashboard
- create event
- event details
- public event page
- RSVP
- QR pass
- upload
- check-in

### 5.3 Accessibility Basics
Check:
- button labels
- contrast
- keyboard navigation
- focus states
- screen reader basics

---

## 6. Performance Hardening
### 6.1 Bundle Optimization
Already started with lazy loading, but continue by:
- splitting heavy scanner dependencies further
- optimizing vendor chunking
- trimming unused UI/runtime code
- reviewing build output regularly

### 6.2 Media Optimization
Add:
- upload guidance
- optional client-side compression
- thumbnail strategies later
- multiple-file handling improvements

### 6.3 Runtime Performance
Review:
- dashboard rendering
- large guest list behavior
- check-in responsiveness
- multi-upload responsiveness

---

## 7. Monitoring & Operational Visibility
### 7.1 Error Monitoring
Add production monitoring (for example Sentry) for:
- route crashes
- auth failures
- upload failures
- scanner failures
- Supabase API errors

### 7.2 Logging Strategy
Track useful operational events:
- signup failures
- event creation failures
- RSVP failures
- upload failures
- check-in failures

---

## 8. Launch Operations
### 8.1 Environment Review
Before launch verify:
- correct Supabase project
- correct Netlify env vars
- no localhost auth URLs
- no exposed secrets
- no service role key in client app
- correct redirect URLs

### 8.2 Rollback & Recovery Plan
Prepare for:
- bad deploy rollback
- migration rollback
- upload/storage cleanup mistakes
- disabling uploads if abused

### 8.3 Admin Safety Controls
Useful launch controls:
- disable uploads per event
- switch moderation mode quickly
- lock RSVP
- pause public event page access if needed

---

## 9. Launch Gate Criteria
Do not launch publicly until all of these are true.

### Backend
- RLS audited and stable
- no recursion issues
- storage rules verified
- ownership boundaries verified

### Auth
- signup/login/logout/reset all working
- confirmation flow stable
- session persistence stable

### Product
- host flow tested end to end
- guest flow tested end to end
- check-in tested on real mobile device
- upload flow tested on real mobile device

### UX
- no critical alert-box flows
- mobile layouts validated
- clear recovery paths for common failures

### Ops
- error monitoring installed
- rollback plan documented
- env config reviewed

---

## Recommended Execution Order
### Phase A — Security & Backend
1. final RLS audit
2. storage hardening
3. remove dead migration leftovers

### Phase B — Core Reliability
4. full QA pass
5. check-in hardening
6. edge-case handling

### Phase C — UX & Product Polish
7. replace weak error UX
8. mobile polish pass
9. accessibility basics

### Phase D — Performance & Launch Operations
10. bundle slimming
11. monitoring setup
12. launch checklist and rollback doc

---

## Suggested Use of Antigravity
Antigravity is a good fit for selected tasks, especially ones that benefit from large-scale review or systematic refactoring.

### Good Antigravity tasks
- broad code review for remaining migration leftovers
- performance audit and chunking recommendations
- UI polish suggestions across multiple screens
- accessibility review
- edge-case enumeration and testing matrix generation
- error handling improvement suggestions
- production checklist refinement

### Tasks I should still personally drive or verify
- Supabase RLS and storage policy changes
- auth redirect behavior
- Netlify env setup
- final deploy verification
- any destructive or security-sensitive changes

In short:
- use Antigravity for **analysis, review, audits, and broad refactor suggestions**
- keep **security, auth, infra, and deploy-critical steps** under direct control and verification

---

## Time Estimate
A serious production hardening pass should take about:
- **4 to 5 focused days**

### Example timeline
- **Day 1:** RLS, storage, env audit
- **Day 2:** host + guest QA, bug fixing
- **Day 3:** check-in and upload hardening
- **Day 4:** mobile polish + error UX
- **Day 5:** performance, monitoring, launch checklist

---

## Final Recommendation
Gerer Events is currently in a strong **private beta** state.

The right move is:
1. complete this production plan
2. keep testing under controlled conditions
3. fix issues fast
4. launch publicly only after the launch gate criteria are satisfied

That is how you avoid embarrassing event-day failures and protect the brand.


---

## Execution Split

## Antigravity Tasks
Use Antigravity for work that benefits from broad analysis, bulk review, and systematic refinement.

### Recommended Antigravity scope
1. **Code audit and migration leftover review**
   - identify dead code
   - identify risky patterns
   - identify leftover hybrid Supabase/legacy logic
   - identify maintainability issues

2. **Performance audit**
   - inspect build chunks
   - recommend additional lazy loading and chunk splits
   - identify heavy dependencies and routes
   - suggest fast wins for bundle reduction

3. **Accessibility review**
   - contrast
   - labels
   - keyboard navigation
   - focus states
   - screen reader basics

4. **UI/UX review**
   - find weak mobile layouts
   - identify clumsy host flows
   - identify weak event-day operator UX
   - suggest improvements to guest flows

5. **QA matrix expansion**
   - generate edge-case checklist
   - enumerate high-risk test cases
   - identify missing validations and error states

6. **Error handling pass**
   - locate alert-based flows
   - suggest replacement UX patterns
   - identify poor recovery states

### Antigravity should produce
- findings grouped by severity
- exact files/components affected
- suggested fixes
- test matrix additions
- performance recommendations
- UX recommendations

---

## Alfa Direct Execution Tasks
These are the tasks I should personally drive or verify directly.

1. **Supabase RLS and security policy changes**
2. **Storage rules and upload path hardening**
3. **Auth redirect configuration**
4. **Netlify environment configuration**
5. **Hosted Supabase project configuration**
6. **Database migrations and rollout order**
7. **Production deploy verification**
8. **Final end-to-end regression testing**
9. **Rollback and recovery planning**
10. **Any fix that touches secrets, auth, or production safety**

---

## User Approval / Decision Tasks
These are the decisions that should come from Fildine, not be guessed.

1. **Launch timing**
2. **Whether Google auth should be enabled now or later**
3. **Whether Facebook auth should ever be enabled**
4. **What monitoring service to use**
5. **How strict guest upload moderation should be by default**
6. **Whether to allow event staff roles in v1 production or keep owner-only initially**
7. **What level of polish is acceptable before launch**
8. **Whether production should begin as private beta or open public launch**

---

## Recommended Antigravity Workflow
1. Give Antigravity the production plan and repo context
2. Ask for a structured audit with severity levels
3. Let it propose exact implementation tasks
4. Review the output
5. Keep security, auth, infra, and deploy-critical actions under direct verification

This keeps Antigravity useful without letting it freestyle into production risk.

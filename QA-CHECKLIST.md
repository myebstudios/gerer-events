# Gerer Events QA Checklist

## Auth
- [ ] Sign up creates account
- [ ] Email confirmation lands on live site
- [ ] Login works
- [ ] Session persists on reopen
- [ ] Homepage redirects signed-in user to dashboard
- [ ] Logout works

## Owner event flow
- [ ] Create event
- [ ] Cover image compresses before upload
- [ ] Theme/template preview works in create flow
- [ ] Event details edit mirrors customization flow
- [ ] Publish event
- [ ] Go live
- [ ] End event
- [ ] Delete event

## Public guest flow
- [ ] Public event page opens
- [ ] RSVP works
- [ ] Guest QR pass renders browser check-in URL
- [ ] Upload page respects checked-in-only rule

## Collaboration
- [ ] Owner invites collaborator by email
- [ ] Invite link copies correctly
- [ ] Invite acceptance works after login
- [ ] Invited event shows on collaborator dashboard
- [ ] Manager sees management controls
- [ ] Check-in staff sees check-in access only
- [ ] Media moderator sees media moderation only
- [ ] Viewer sees read-only UI

## Check-in
- [ ] QR scan opens browser link
- [ ] Login-return preserves check-in URL
- [ ] Allowed role auto-checks in guest
- [ ] Already checked-in state is clear
- [ ] Invalid token state is clear
- [ ] Forbidden state is clear
- [ ] Manual token/link fallback works

## Media
- [ ] Approved media visible correctly
- [ ] Media moderator can feature/approve/hide/delete
- [ ] Non-media roles do not see moderation controls

## Dashboard & stats
- [ ] Invited collaborators see event cards
- [ ] Stats render without owner-only assumptions
- [ ] Guest list loads for allowed roles
- [ ] Event details loads for allowed roles

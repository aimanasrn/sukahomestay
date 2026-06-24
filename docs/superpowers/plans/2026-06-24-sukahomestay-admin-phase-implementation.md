# Sukahomestay Admin Phase Implementation Plan

Date: 2026-06-24
Status: Drafted from the current codebase and admin phase design

## Goal

Add a protected admin workspace for bookings, availability overrides, and property management while reusing the existing React template and Express service structure.

## Architecture

Keep the current split:

- `web/` for frontend
- `server/` for backend

Extend it with:

- admin authentication
- protected admin API routes
- protected admin frontend routes
- admin dashboard pages built from existing app-shell pieces

## Implementation Phases

### Phase 1: Authentication Foundation

Backend:

- add `passwordHash` to `User`
- seed one admin user
- add login endpoint
- add auth middleware for protected admin APIs

Frontend:

- add admin login page
- store auth token or session state
- redirect unauthenticated admin users to login

Files likely involved:

- `server/prisma/schema.prisma`
- `server/prisma/seed.js`
- `server/src/routes/authRoutes.js`
- `server/src/controllers/authController.js`
- `server/src/services/authService.js`
- `server/src/middleware/authMiddleware.js`
- `web/src/pages/admin/LoginPage.jsx`
- `web/src/services/authApi.js`

### Phase 2: Admin Route Shell

Frontend:

- create admin route tree
- reuse or simplify existing app/dashboard shell
- replace demo navigation items with Sukahomestay admin sections

Files likely involved:

- `web/src/App.jsx`
- `web/src/routes/adminRoutes.jsx`
- `web/src/layout/AdminLayout.jsx` or existing app layout adaptation
- `web/src/components/partials/sidebar/*`
- `web/src/constant/data.js` or equivalent nav config

### Phase 3: Bookings Management

Backend:

- add admin list bookings endpoint
- add booking status update endpoint
- add admin note update support

Frontend:

- bookings table
- filters by status and booking type
- booking detail panel or page
- approve / reject / cancel actions

Files likely involved:

- `server/src/routes/adminBookingRoutes.js`
- `server/src/controllers/adminBookingController.js`
- `server/src/services/bookingService.js`
- `web/src/pages/admin/bookings/index.jsx`
- `web/src/components/admin/BookingTable.jsx`
- `web/src/components/admin/BookingDetailCard.jsx`

### Phase 4: Availability Rules Management

Backend:

- CRUD endpoints for `AvailabilityRule`

Frontend:

- calendar-based availability management page
- create and delete override actions
- filters for booking type and room

Files likely involved:

- `server/src/routes/adminAvailabilityRoutes.js`
- `server/src/controllers/adminAvailabilityController.js`
- `server/src/services/availabilityRuleService.js`
- `web/src/pages/admin/calendar/index.jsx`
- `web/src/components/admin/AvailabilityRuleForm.jsx`

### Phase 5: Property And Room Management

Backend:

- update property endpoint
- update room endpoint

Frontend:

- property settings page
- room list editing interface
- pricing and capacity updates

Files likely involved:

- `server/src/routes/adminPropertyRoutes.js`
- `server/src/controllers/adminPropertyController.js`
- `server/src/services/propertyService.js`
- `web/src/pages/admin/properties/index.jsx`
- `web/src/components/admin/PropertyForm.jsx`
- `web/src/components/admin/RoomEditorList.jsx`

## UX Direction For Frontend

Using the `design-taste-frontend` guidance selectively for frontend admin work:

- keep brand color continuity with orange accent
- do not turn admin pages into public marketing sections
- prefer operational clarity over decorative storytelling
- standardize cards, tables, filters, and forms
- remove demo-dashboard noise

## Verification Plan

Backend:

- auth route tests
- protected-route authorization tests
- booking status update tests
- availability-rule CRUD tests

Frontend:

- production build
- route smoke checks
- manual login flow verification
- booking status update flow verification

## Recommended Delivery Order

1. Auth foundation
2. Admin route shell
3. Bookings management
4. Availability rules
5. Property and room editing

## Risks To Watch

- introducing auth without breaking guest booking flow
- drifting into generic template demo UI
- duplicating booking logic instead of reusing service-layer rules
- adding admin state in too many places instead of one clear route shell

## Completion Criteria

The admin phase is complete when:

- an admin can sign in
- admin-only pages are protected
- bookings can be reviewed and status-updated
- manual availability rules can be managed
- property and room details can be updated
- frontend and backend verification both pass

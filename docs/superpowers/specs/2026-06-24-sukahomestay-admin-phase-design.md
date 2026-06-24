# Sukahomestay Admin Phase Design

Date: 2026-06-24
Status: Drafted after public v1 alignment, ready for implementation planning

## Overview

The public booking experience is now in place, but operational work is still manual. The next phase is an internal admin workspace for managing bookings, availability overrides, and property data without touching the database directly.

This phase should reuse the existing React template structure in `web/`, but the frontend treatment should become a focused booking-operations admin rather than generic demo-dashboard content.

## Phase Goal

The admin phase should let an operator:

- sign in securely
- review incoming booking requests
- approve, reject, or cancel bookings
- add manual availability blocks
- edit property and room details
- monitor booking status and occupancy at a glance

## Product Scope

### In scope

- Admin authentication
- Admin dashboard home
- Admin bookings management
- Admin calendar / availability overrides
- Admin property management
- Room management for roomstay units

### Out of scope

- Multi-admin collaboration workflows
- Granular permissions beyond basic admin access
- Customer accounts dashboard
- Payment processing
- Automated notifications
- Analytics beyond lightweight operational summaries

## Core Admin Users

Primary admin user:

- homestay owner or staff member managing guest requests

Admin priorities:

- quick triage of pending bookings
- clear visibility into conflicts
- simple availability control
- low-friction updates to pricing and room metadata

## Experience Direction

The admin UI should feel:

- operational
- clear
- calm
- trustworthy
- fast to scan

It should not feel:

- like a public marketing page
- overly playful
- overloaded with demo widgets
- visually inconsistent with the public brand

## Frontend Direction

The existing React template already contains dashboard-oriented building blocks and app pages. Those should be selectively adapted rather than discarded.

Frontend direction for admin:

- preserve app-shell behavior where it supports productivity
- remove unrelated demo dashboards, ecommerce references, and sample widgets
- align colors and typography with the Sukahomestay brand
- keep density higher than the public site, but still readable

### Visual system

Recommended admin palette:

- primary action accent: same orange family as public brand
- neutrals: slate / navy / white
- success: green
- warning: amber
- danger: red

### Layout behavior

Admin pages should use:

- left navigation or existing sidebar pattern
- top summary cards where useful
- tables and cards for operational data
- filters and status chips
- modal or drawer editing for lightweight actions when appropriate

## Authentication

Admin requires real authentication. The current schema has `User.role` but no password field, so phase 2 should introduce password-based admin access.

Recommended additions:

- `passwordHash` on `User`
- login endpoint
- protected admin routes
- token or session-based auth

For v1 of admin, one role is enough:

- `admin`

## Functional Modules

### Admin Dashboard

Purpose:

- quick operational snapshot

Suggested content:

- pending bookings count
- confirmed bookings count
- unavailable dates summary
- next upcoming stays
- room occupancy snapshot

### Bookings Management

Purpose:

- central place to process guest requests

Required capabilities:

- list bookings
- filter by status
- filter by booking type
- inspect guest details
- inspect date range and room selection
- approve booking
- reject booking
- cancel booking
- add admin note

### Availability Management

Purpose:

- manually block or open dates outside normal booking-derived availability

Required capabilities:

- month view calendar
- add availability override
- remove override
- filter by booking type
- room-level override for roomstay if needed

This should use the existing `AvailabilityRule` model rather than invent a second mechanism.

### Property Management

Purpose:

- keep public-facing listing data current

Required capabilities:

- edit homestay details
- edit roomstay collection details
- edit whole-house details
- update pricing
- update guest capacity
- toggle active/inactive
- edit room-level pricing and metadata

## Backend Direction

The current backend already has reusable service boundaries. Admin should extend that structure rather than bypass it.

Recommended additions:

- auth service
- admin booking service methods for status updates
- availability-rule CRUD service
- property update service methods

Recommended admin API areas:

- `/api/auth/*`
- `/api/admin/bookings/*`
- `/api/admin/availability-rules/*`
- `/api/admin/properties/*`
- `/api/admin/rooms/*`

## Data Model Changes

Likely schema additions:

### User

Add:

- `passwordHash`
- `updatedAt`

### AvailabilityRule

Likely refine:

- `status` into a clearer enum later if needed
- optional note field

No major structural rewrite should be needed beyond auth support and admin metadata refinement.

## Success Criteria

This phase is successful if an admin can:

- sign in
- review all incoming bookings
- approve or reject requests safely
- manage manual date blocks
- update property and room details
- do the above from one consistent internal workspace

## Implementation Planning Next

The implementation plan for this phase should cover:

- schema and auth changes
- protected backend routes
- protected frontend admin routes
- admin layout and navigation
- bookings table and detail flow
- calendar / availability management
- property and room editing UI

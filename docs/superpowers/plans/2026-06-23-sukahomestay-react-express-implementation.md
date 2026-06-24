# Sukahomestay React + Express Implementation Plan

Date: 2026-06-23
Status: Updated after implementation to reflect the current v1 system

## Goal

Build a single-property public booking platform with:

- React frontend in `web/`
- Express + Prisma + MySQL backend in `server/`
- shared public booking flow across landing, homestay, roomstay, availability, booking, and success pages

## Delivered Architecture

### Frontend

The frontend remains inside `web/` and now provides:

- public React Router route shell
- shared public layout with hospitality header and footer
- homepage with featured stays and visible landing calendar
- homestay page
- roomstay page
- availability page
- booking page
- booking success page

### Backend

The backend lives inside `server/` and provides:

- Express app and server entry
- Prisma schema and seed data
- public property routes
- availability route
- booking creation route
- reusable service-layer booking logic

## Implemented Public Routes

Frontend routes:

- `/`
- `/homestay`
- `/roomstay`
- `/availability`
- `/booking`
- `/booking/success`

API routes:

- `GET /api/properties`
- `GET /api/properties/homestay`
- `GET /api/properties/roomstay`
- `GET /api/availability`
- `POST /api/bookings`

## Implemented Business Rules

- whole-house bookings block all other booking types
- homestay conflicts with whole house and other homestay bookings
- roomstay conflicts with whole house and bookings for the same room only
- cancelled and rejected bookings do not block dates
- guest booking is allowed without authentication

## Implemented UI Direction

The public UI is now standardized around:

- orange primary action color
- dark navy heading hierarchy
- white and soft-tint surfaces
- reusable page-hero shell for inner public pages
- consistent form, card, and CTA styling

This replaces the earlier assumption that the original template look should remain the primary visual reference.

## Whole-House Scope Clarification

Whole house is implemented as a booking and availability mode, but not as a dedicated public detail page.

Current v1 behavior:

- selectable in availability and booking flows
- included in booking conflict logic
- optional for future dedicated marketing page expansion

## Verification Status

Verified during implementation:

- backend tests pass with `npm run test` in `server/`
- frontend build passes with `npm run build` in `web/`

## Notes For Future Work

Likely next implementation areas:

- admin dashboard
- booking management UI
- dedicated whole-house page if required
- improved imagery and content polish
- bundle-size optimization on the frontend

# Sukahomestay React + Express Platform Design

Date: 2026-06-23
Status: Approved in chat, updated to match implemented v1 direction

## Overview

Sukahomestay is a single-property booking platform for one house that supports three booking modes:

- Homestay
- Roomstay
- Whole House

The stack is locked as:

- React frontend in `web/`
- Express backend in `server/`
- Node.js runtime
- MySQL database
- Prisma as the data layer

The product is not a marketplace. Version 1 is focused on the customer-facing booking journey only. Admin features remain deferred.

## Product Scope

Version 1 includes:

- Public landing page
- Homestay detail page
- Roomstay detail page
- Availability page
- Booking request page
- Booking success page

Version 1 does not include:

- Admin dashboard
- Booking management UI
- Calendar management UI
- Property management UI
- Payment gateway
- Customer account dashboard

## Inventory Model

The inventory model remains:

- One homestay unit
- Three roomstay units
- One whole-house booking mode

Roomstay is represented as three distinct rooms with independent pricing and availability:

- Roomstay Room 1
- Roomstay Room 2
- Roomstay Room 3

Each room has:

- 1 bedroom
- 1 bathroom
- its own nightly price

### Whole-House Clarification

Whole house is part of the booking and availability model in v1, but it does not currently require a dedicated public detail page.

Current v1 behavior:

- Whole house is selectable through availability and booking flows
- Whole house participates fully in booking conflict rules
- Whole house can be promoted through landing-page messaging and stay-option content

If a dedicated whole-house marketing page is needed later, it can be added without changing the booking model.

## Technical Direction

### Frontend

The frontend reuses the existing React/Vite application in `web/` rather than replacing it with a fresh scaffold.

The original template is used as a structural foundation only:

- existing layout and routing are reused where helpful
- customer-facing pages replace dashboard-first content
- shared UI components are adapted into a hospitality booking experience

The public UI direction is now standardized around:

- a bright hospitality-oriented visual system
- orange as the primary action accent
- navy / slate text hierarchy
- white and soft-tint surfaces
- one consistent card, form, and CTA language across all public pages

This is no longer a "preserve the template look and feel" project. The template is the base, not the visual reference.

### Backend

A separate `server/` application lives beside `web/` and contains:

- Express app setup
- route modules
- booking and availability services
- Prisma schema, migrations, and seed scripts
- MySQL access through Prisma

## Application Structure

```text
web/
  src/
    components/
    layout/
    pages/
    routes/
    services/
    hooks/
    store/
server/
  src/
    app.js
    server.js
    routes/
    controllers/
    services/
    lib/
    middleware/
  prisma/
    schema.prisma
    migrations/
    seed.js
docs/
  superpowers/
    specs/
    plans/
```

## Frontend Pages In V1

- Landing page
- Homestay detail page
- Roomstay detail page
- Availability page
- Booking page
- Booking success page

Roomstay remains one public page that lists the available room units with:

- room name
- bedroom count
- bathroom count
- guest capacity
- nightly price

## Data Model

The MySQL schema is managed through Prisma and reflects the public booking model.

### User

Used for future account readiness, even though public booking is guest-first in v1.

- `id`
- `fullName`
- `email`
- `phone`
- `role`
- `createdAt`

### Property

Represents the reservable inventory groups.

- `id`
- `name`
- `type` (`homestay` | `roomstay` | `whole_house`)
- `description`
- `bedrooms`
- `bathrooms`
- `maxGuests`
- `pricePerNight`
- `imageUrl`
- `isActive`
- `createdAt`
- `updatedAt`

### Room

Represents the three roomstay units.

- `id`
- `propertyId`
- `name`
- `bedrooms`
- `bathrooms`
- `maxGuests`
- `pricePerNight`
- `isActive`
- `createdAt`
- `updatedAt`

### Booking

- `id`
- `userId` nullable
- `bookingType` (`homestay` | `roomstay` | `whole_house`)
- `roomId` nullable
- `checkInDate`
- `checkOutDate`
- `guestCount`
- `fullName`
- `phone`
- `email`
- `specialRequest`
- `status` (`pending` | `booked` | `cancelled` | `rejected`)
- `adminNote` nullable
- `createdAt`
- `updatedAt`

### AvailabilityRule

Kept in the design for future admin overrides, without requiring full v1 UI support.

- `id`
- `date`
- `bookingType`
- `roomId` nullable
- `status`
- `createdAt`

## Availability Model

Availability is derived primarily from bookings.

Blocking statuses:

- `pending`
- `booked`

Non-blocking statuses:

- `cancelled`
- `rejected`

### Booking Rules

#### Whole House

A whole-house booking blocks all other booking modes for overlapping dates.

It cannot be created if any overlapping blocking booking exists for:

- Homestay
- Any roomstay room
- Whole house

#### Homestay

A homestay booking cannot overlap with:

- Whole-house booking
- Another homestay booking

It can overlap with:

- Roomstay Room 1
- Roomstay Room 2
- Roomstay Room 3

#### Roomstay

A roomstay booking cannot overlap with:

- Whole-house booking
- Another booking for the same room

It can overlap with:

- Homestay booking
- Other roomstay bookings for different rooms

If all three roomstay rooms are blocked for a date range, roomstay should appear unavailable in public availability views.

## Service Architecture

Business rules stay in reusable services, not route handlers.

Core service units:

- `propertyService`
- `availabilityService`
- `bookingService`

The availability service is the single source of truth for:

- availability search
- booking validation
- booking creation checks

## API Shape

Public API surface in v1:

- `GET /api/properties`
- `GET /api/properties/homestay`
- `GET /api/properties/roomstay`
- `GET /api/availability`
- `POST /api/bookings`

Future API surface:

- auth routes
- customer booking history routes
- admin booking management routes

## Frontend Behavior

### Public UI System

The public experience is now standardized across all customer-facing pages, not only the landing page.

The shared UI system should maintain:

- orange primary actions
- dark navy headline hierarchy
- white and soft-tint backgrounds
- rounded cards and input shells
- reusable page-hero pattern for inner public pages
- consistent CTA language and booking flow affordances

### Landing Page

The landing page should:

- establish the hospitality brand clearly
- drive visitors toward availability and booking
- present featured stay content
- surface a visible calendar
- end with a strong booking/contact CTA

The current implemented landing structure is:

1. Hero
2. Featured stay options
3. Trust / value section
4. Landing availability calendar
5. Final contact CTA

### Booking Flow

1. Visitor browses stay options
2. Visitor checks availability
3. Visitor chooses booking type
4. If roomstay is selected, visitor can specify the room
5. Visitor submits booking details
6. Backend rechecks availability
7. Booking is saved as `pending`
8. Visitor sees confirmation and follow-up guidance

Booking form fields:

- Full name
- Phone number
- Email
- Check-in date
- Check-out date
- Number of guests
- Booking type
- Room selection when booking type is `roomstay`
- Special request

## Authentication

Authentication remains minimal in v1:

- public browsing does not require login
- booking requests can be submitted without an account
- `userId` remains nullable for guest bookings

## Error Handling

The application should provide clear feedback for:

- invalid date ranges
- fully unavailable date selections
- room-specific conflicts
- missing required fields
- booking submission failures

API responses should stay simple and frontend-friendly.

## Testing Strategy

Priority logic coverage:

- whole-house conflicts with all booking types
- homestay conflicts only with whole-house and homestay
- roomstay conflicts only with whole-house and the same room
- cancelled and rejected bookings do not block dates
- room-specific availability is respected
- booking creation rejects conflicting requests

Frontend verification can remain lighter, focused on rendering and critical booking flows.

## Decisions Locked In

- Keep the existing `web` app as the frontend base
- Use React on the frontend
- Add a separate `server` app for Express + Node.js APIs
- Use MySQL as the primary database
- Use Prisma as the database layer
- Focus v1 on public booking flows only
- Defer admin to phase 2
- Keep roomstay as one page with real room records and room-specific pricing
- Keep whole house in booking logic and public forms, even without a dedicated page
- Standardize all public pages under one shared hospitality UI system

## Out Of Scope For V1

- Admin interface
- User account dashboard
- Payment gateway
- Marketplace or multi-property support
- Seasonal pricing
- Coupons
- Multi-admin workflows

## Implementation Status Note

This spec now reflects the current implemented direction more closely than the original draft. Future design updates should modify this file and the public-UI design spec together so architecture and UX stay aligned.

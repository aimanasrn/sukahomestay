# Sukahomestay Booking Platform Design

Date: 2026-06-02
Status: Draft approved in chat, written for final review

## Overview

Sukahomestay will be built as a single-property booking platform for one house that supports three booking modes:

- Homestay
- Roomstay
- Whole House

The product will use a balanced foundation approach:

- A polished marketing-led landing page sets the visual system
- The full application structure is scaffolded up front
- Supabase integration is prepared with placeholders rather than live credentials
- Booking and availability logic are designed as real application logic from day one

The visual direction is based on the provided reference image. The primary brand color will be a warm orange sampled from the image, paired with white backgrounds, soft gray sections, and dark navy text. The product should feel modern, clean, and premium, with an Airbnb-like booking experience adapted for a single property business.

## Product Scope

This first version is intentionally scoped to one real property, not a marketplace.

The inventory model is:

- One homestay unit
- Three roomstay units
- One whole-house booking mode

This means the system should not present itself as a multi-property listing platform. The code may remain extensible, but the initial content, routes, seeded data, and admin tools should reflect one property with fixed inventory.

## User Types

The application supports two roles:

- Admin
- Customer

Customers can browse, check availability, submit booking requests, review their bookings, and cancel pending requests.

Admins can review bookings, update statuses, inspect availability, manage property content, and view booking metrics.

## Application Structure

The application will be built as a single Next.js App Router project using TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth, and Supabase PostgreSQL.

High-level areas:

- Public marketing pages
- Public booking and availability flow
- Customer dashboard
- Admin dashboard
- Shared UI and data-access layers

Proposed structure:

```text
app/
  (marketing)/
    page.tsx
    homestay/page.tsx
    roomstay/page.tsx
    availability/page.tsx
    booking/page.tsx
  (dashboard)/
    dashboard/page.tsx
  (admin)/
    admin/page.tsx
    admin/bookings/page.tsx
    admin/calendar/page.tsx
    admin/property/page.tsx
  auth/
components/
  layout/
  marketing/
  booking/
  calendar/
  property/
  dashboard/
  admin/
  ui/
lib/
  auth/
  booking/
  availability/
  supabase/
  utils/
types/
supabase/
  migrations/
```

The public side should be visually polished first. Dashboard areas can be lighter in presentation during v1, but must follow the same design tokens and shared component system.

## Core Pages

### Public Pages

Landing page sections:

- Hero section
- Search availability form
- Homestay and roomstay showcase
- Facilities section
- Gallery section
- How booking works section
- WhatsApp CTA
- Contact section

Additional public pages:

- Homestay detail page
- Roomstay detail page
- Availability calendar page
- Booking request page

### Customer Pages

Customer dashboard:

- Booking list
- Booking statuses
- Key dates
- WhatsApp quick contact action
- Pending booking cancellation action

### Admin Pages

Admin dashboard:

- Total bookings
- Pending bookings
- Booked dates
- Cancelled bookings

Admin management areas:

- Booking management
- Calendar visibility
- Property content management

## Data Model

The initial schema will follow the requested entities, with practical interpretation for a single-property setup.

### profiles

- `id`
- `full_name`
- `email`
- `phone`
- `role`
- `created_at`

### properties

Used for the main reservable inventory types and public property content.

- `id`
- `name`
- `type` (`homestay` | `roomstay` | `whole_house`)
- `description`
- `bedrooms`
- `bathrooms`
- `max_guests`
- `price_per_night`
- `image_url`
- `is_active`
- `created_at`

### rooms

Used for the three individual roomstay units.

- `id`
- `property_id`
- `name`
- `bedrooms`
- `bathrooms`
- `max_guests`
- `price_per_night`
- `is_active`
- `created_at`

### bookings

- `id`
- `user_id`
- `booking_type` (`homestay` | `roomstay` | `whole_house`)
- `room_id` nullable
- `check_in_date`
- `check_out_date`
- `guest_count`
- `full_name`
- `phone`
- `email`
- `special_request`
- `status` (`pending` | `booked` | `cancelled` | `rejected`)
- `admin_note`
- `created_at`
- `updated_at`

### availability_rules

This table exists as an admin override and annotation layer, not the primary availability source.

- `id`
- `date`
- `booking_type`
- `room_id` nullable
- `status`
- `created_at`

## Availability Model

Availability must be derived primarily from booking records, using `pending` and `booked` as blocking states.

Non-blocking states:

- `cancelled`
- `rejected`

Blocking states:

- `pending`
- `booked`

### Booking Interaction Rules

#### Whole House

A whole-house booking blocks all other booking modes for overlapping dates.

It cannot be created if any of the following already exist on overlapping dates with blocking status:

- Homestay booking
- Roomstay booking for any room
- Whole-house booking

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

If all three roomstay rooms are blocked for a date range, the roomstay offering should appear fully unavailable in public availability views.

## Availability Logic Service

A dedicated availability service should be implemented and reused across the application.

Inputs:

- Check-in date
- Check-out date
- Booking type
- Optional room ID

Responsibilities:

- Detect overlapping date ranges
- Evaluate blocking states
- Apply whole-house, homestay, and roomstay conflict rules
- Return clear availability results for UI and form validation

This same logic should be used in:

- Public availability calendar
- Booking request validation
- Admin booking status updates

This avoids drift between what the calendar shows and what the booking form allows.

## Booking Flow

1. User selects date range
2. User selects booking type
3. User completes booking form
4. Availability is rechecked on submit
5. Booking is created with status `pending`
6. User sees confirmation with WhatsApp payment prompt
7. Admin reviews the request and updates status
8. Public and admin availability views reflect the updated status

Booking form fields:

- Full name
- Phone number
- Email
- Check-in date
- Check-out date
- Number of guests
- Booking type
- Special request

For roomstay, the selected room must be captured through `room_id`.

## Payment Handling

No payment gateway is included in v1.

After submission, the user should see a clear confirmation message explaining that the booking request has been submitted and payment must be completed manually through WhatsApp or bank transfer.

The WhatsApp CTA should prefill a message containing:

- Customer name
- Booking type
- Check-in and check-out dates
- Number of guests

## Auth And Access Control

Supabase Auth will be used for authentication.

Role handling:

- Customers access public pages and their own dashboard
- Admins access booking, calendar, and property management pages

Protected route behavior:

- Public pages remain open
- Customer dashboard requires authentication
- Admin routes require authentication plus `admin` role

The project should use reusable guard and session utilities rather than embedding role checks inside pages repeatedly.

## UI System

The UI should be driven by reusable design tokens and shared components.

### Brand Direction

- Primary color: warm orange from the reference image
- Primary hover: darker orange
- Heading color: deep navy
- Body text: slate-gray
- Backgrounds: white and warm gray
- Surfaces: soft-gray cards with rounded corners

### Component Families

- Header and navigation
- Hero and showcase sections
- Search and booking forms
- Availability calendar
- Property cards
- Booking summary cards
- Status badges
- Data tables
- Admin action panels

The landing page should feel intentionally designed and premium. Dashboards may be more utilitarian, but should still share typography, spacing, border radius, and color tokens with the marketing pages.

## Visual Direction

The visual style should be inspired by the provided mockup without copying it literally.

Desired characteristics:

- Bright, welcoming hero area
- Strong property imagery
- Clean, rounded search interface
- Clear orange action hierarchy
- Dark, trustworthy text color
- Soft shadows and spacious layout
- Fully responsive mobile and desktop behavior

The landing page should be the most polished screen in the first implementation pass, because it establishes the brand system for the rest of the app.

## Content Strategy For V1

Since this is a single-property build, v1 can use structured seed content for:

- Property descriptions
- Facility highlights
- Booking steps
- Contact information placeholders
- Gallery placeholders

This allows the app to be fully scaffolded even before final production content is available.

## Technical Foundation

The project should include:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui setup
- Supabase client utilities
- `.env.example` with placeholder variables
- Supabase migration files for schema
- Reusable server and client data helpers
- Shared TypeScript types for bookings, roles, inventory, and availability

The initial codebase should be scaffolded so future work can proceed in slices:

- UI slice
- Auth slice
- Database slice
- Availability logic slice
- Dashboard slice

## Error Handling

The system should provide clear user-facing feedback for:

- Unavailable selected dates
- Invalid date ranges
- Missing required fields
- Unauthorized dashboard access
- Failed booking submission

Admin views should also surface concise status and empty states rather than silent failures.

## Testing Strategy

Implementation should include tests for the booking and availability logic first, because those rules are the highest-risk area.

Priority test coverage:

- Whole-house conflicts with all booking types
- Homestay conflicts only with whole-house and homestay
- Roomstay conflicts only with whole-house and same room
- Non-blocking statuses do not prevent booking
- Overlapping date range handling
- Public availability and booking validation use the same rules

UI and route tests can be added after the core logic foundation is in place.

## Decisions Locked In

- Build a full app scaffold first
- Assume Supabase is not set up yet
- Build for a single property, not a marketplace
- Use a balanced foundation approach
- Use the orange from the reference image as the primary brand color
- Derive availability from bookings first, with `availability_rules` as an override layer
- Polish the landing page first while keeping the rest of the app scaffolded

## Out Of Scope For V1

- Online payment gateway
- Multi-property marketplace behavior
- Advanced pricing rules
- Seasonal pricing
- Coupon system
- Multi-admin workflows
- Automated messaging beyond a WhatsApp CTA

## Implementation Planning Next

Once this written spec is reviewed and approved, the next step is to produce an implementation plan that breaks the work into concrete, testable slices for scaffolding, schema, availability logic, public pages, and dashboard/admin pages.

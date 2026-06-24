# Sukahomestay Public UI Standardization Plan

Date: 2026-06-23
Status: Updated after implementation to reflect the active public UI system

## Goal

Standardize the full public-facing experience so all customer pages feel like one hospitality product rather than a mix of dashboard leftovers and one-off redesign passes.

## Scope

Pages in scope:

- Home page
- Homestay page
- Roomstay page
- Availability page
- Booking page
- Booking success page

Components in scope:

- header
- footer
- shared layout shell
- public page hero
- landing hero
- stay cards
- room cards
- forms
- result cards
- final CTA sections

## Final Direction

The public-site direction is now:

- bright hospitality-booking experience
- orange primary action accent
- dark navy heading color
- white base with soft tinted surfaces
- clean sans-serif hierarchy
- consistent rounded cards and forms

This replaces the earlier landing-only luxury-retreat editorial direction.

## Delivered Standardization Areas

### Shared chrome

- header and footer now match the public booking tone
- layout background and spacing are consistent across customer routes

### Shared page structure

- inner pages use a common `PublicPageHero` pattern
- homepage uses a stronger marketing-first hero and feature flow

### Shared components

- booking forms use the same visual shell
- availability results follow the same card language
- room cards use the same accent, spacing, and CTA behavior

### Shared CTA language

Primary CTA pattern:

- orange fill
- white text
- direct booking-oriented wording

Secondary CTA pattern:

- white fill
- orange border
- orange text

## Implemented Homepage Structure

The current homepage structure is:

1. Hero
2. Featured stay options
3. Trust / value section
4. Landing availability calendar
5. Final contact CTA

## Design Rules Locked In

- one dominant accent color across public pages
- one heading color family across public pages
- one card and form radius language across public pages
- no split between "landing style" and "inner page style"
- no return to dashboard-heavy visual sections on public routes

## Clarifications

- whole house is still part of the booking model even without a dedicated detail page
- the landing calendar remains visible and is part of the shared public experience
- future admin design should be handled separately and should not change this document

## Verification Status

Verified during implementation:

- public frontend builds successfully with `npm run build` in `web/`
- backend remains compatible with public UI behavior

## Next Design Tasks

Potential future refinements:

- improve property imagery and branded assets
- add more realistic local stay content
- refine iconography and trust signals
- optimize bundle size and loading behavior

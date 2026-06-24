# Sukahomestay Public UI Design

Date: 2026-06-23
Status: Approved in chat, updated to match current public-site direction

## Overview

The original landing redesign spec described a luxury-retreat, modern-earthy direction for the homepage only. Since then, the approved product direction changed through implementation review:

- the visual accent moved back to orange
- the homepage shifted toward a brighter hospitality-booking reference
- the public pages were later standardized beyond the landing page

This document now defines the current public UI system for all customer-facing pages.

## Product Goal

The public UI should do two jobs well:

1. Create an inviting hospitality-first first impression
2. Move guests smoothly from browsing into availability checking and booking

The site should feel like a booking-ready homestay website, not a repurposed dashboard and not a pure luxury-brand editorial page.

## Current Direction

Approved working direction:

- Style: hospitality booking
- Audience: booking-minded guests and families
- Business goal: clear conversion without losing warmth
- Visual identity: bright, clean, trusted, guest-friendly

## Visual Identity

### Core Palette

The public UI system should use one shared palette:

- Primary accent: orange
- Headings: dark navy
- Body text: slate gray
- Background: white
- Soft surface tint: pale orange / soft off-white
- Borders: cool light gray

### Color Rules

- Orange is the dominant action color across all public pages
- Navy is the dominant heading color
- White is the primary page background
- Light tinted sections can be used for emphasis, but the site should not switch into a second theme mid-page

### Typography

The public site should use a cleaner, booking-oriented type system:

- bold sans-serif headlines
- readable sans-serif body copy
- compact, confident labels

This direction replaces the earlier serif-led editorial approach.

## Interaction Direction

The site should feel easy and trustworthy, not dramatic.

### CTA Hierarchy

Primary CTA examples:

- Check Availability
- Book Homestay
- Start Room Booking
- Submit Booking Request

Secondary CTA examples:

- View All Stays
- Go To Booking
- Check More Dates

Rules:

- one dominant orange CTA per action group
- outlined secondary actions can use orange border + white fill
- CTA wording should stay direct and task-oriented

### Motion

Motion should remain light and optional:

- hover polish on cards and buttons
- calm section transitions if added later
- no flashy dashboard-style animation

## Shared Public UI System

All customer-facing pages should reuse the same design language.

### Shared Components

The following component patterns should stay visually consistent:

- header
- footer
- page hero sections
- buttons
- cards
- forms
- availability result states

### Reusable Page Hero Pattern

Inner public pages should use a shared hero structure with:

- badge / eyebrow
- page title
- short supporting paragraph
- optional CTA group

This keeps homestay, roomstay, availability, and booking pages visually aligned.

## Page-by-Page Direction

### Home Page

The home page should feel like the strongest marketing surface in the public flow.

Current homepage structure:

1. Hero
2. Featured stay options
3. Trust / value section
4. Availability calendar
5. Final CTA / contact section

The home page should emphasize:

- real property browsing intent
- quick booking entry
- visible stay pricing and confidence signals
- simple conversion paths

### Homestay Page

The homestay page should present:

- one shared page hero
- property metrics
- description and booking CTA

It should feel like a focused property summary rather than a raw data card.

### Roomstay Page

The roomstay page should present:

- one shared page hero
- a clear list/grid of rooms
- room cards with consistent booking actions

### Availability Page

The availability page should present:

- one shared page hero
- a consistent public form shell
- clear result states
- fast path into booking

### Booking Page

The booking page should present:

- one shared page hero
- a clean, consistent booking form
- strong form contrast and field readability

### Booking Success Page

The success page should present:

- confirmation message
- next-step reassurance
- links back into availability or home

## Availability Calendar

The visible landing-page calendar remains part of the public UI system.

It should be:

- easy to scan
- clearly color-coded
- visually consistent with the orange accent system
- linked naturally to the full availability flow

## Content Tone

The copy should feel:

- welcoming
- clear
- direct
- hospitality-focused

It should avoid:

- software-product language
- overly abstract luxury wording
- dashboard/admin terminology

## Whole-House UX Note

Whole house remains part of the booking model and availability rules, but it does not currently have a dedicated marketing/detail page.

For now:

- guests can still encounter whole house in availability and booking flows
- the landing page may reference it as a stay mode
- a dedicated whole-house page is optional future scope

## Success Criteria

The public UI should be considered aligned if:

- all public pages feel like one product
- the same button, form, and card language is reused consistently
- orange remains the only primary action accent
- booking actions are obvious on every relevant page
- the site no longer feels like a dashboard template

## Out Of Scope

This design spec does not cover:

- admin pages
- backend logic changes
- auth redesign
- payment UX

## Documentation Rule Going Forward

This file is now the source of truth for public-facing UI direction. Future homepage or public-page design changes should update this document instead of creating a second competing design spec.

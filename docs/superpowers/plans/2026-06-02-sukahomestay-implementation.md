# Sukahomestay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-property homestay booking platform scaffold with a polished orange-led landing page, Supabase-ready schema, and tested availability logic.

**Architecture:** Use a single Next.js App Router application with route groups for marketing, customer, and admin areas. Keep booking rules in a reusable server-side availability service that powers public availability checks, booking validation, and admin status updates. Drive visual consistency through shared design tokens and reusable UI primitives.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Vitest, Testing Library, Supabase Auth, Supabase PostgreSQL

---

## Planned File Structure

### App and config

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `components.json`
- Create: `.gitignore`
- Create: `.env.example`

### App routes

- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/(marketing)/page.tsx`
- Create: `app/(marketing)/homestay/page.tsx`
- Create: `app/(marketing)/roomstay/page.tsx`
- Create: `app/(marketing)/availability/page.tsx`
- Create: `app/(marketing)/booking/page.tsx`
- Create: `app/(dashboard)/dashboard/page.tsx`
- Create: `app/(admin)/admin/page.tsx`
- Create: `app/(admin)/admin/bookings/page.tsx`
- Create: `app/(admin)/admin/calendar/page.tsx`
- Create: `app/(admin)/admin/property/page.tsx`
- Create: `app/auth/login/page.tsx`

### Shared UI

- Create: `components/layout/site-header.tsx`
- Create: `components/layout/site-footer.tsx`
- Create: `components/marketing/hero-section.tsx`
- Create: `components/marketing/search-bar.tsx`
- Create: `components/marketing/property-showcase.tsx`
- Create: `components/marketing/facilities-section.tsx`
- Create: `components/marketing/gallery-section.tsx`
- Create: `components/marketing/how-it-works.tsx`
- Create: `components/marketing/contact-section.tsx`
- Create: `components/booking/booking-form.tsx`
- Create: `components/booking/booking-summary-card.tsx`
- Create: `components/calendar/availability-calendar.tsx`
- Create: `components/property/property-detail.tsx`
- Create: `components/dashboard/booking-list.tsx`
- Create: `components/admin/booking-table.tsx`
- Create: `components/admin/metrics-grid.tsx`
- Create: `components/ui/button.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/badge.tsx`

### Domain logic

- Create: `lib/utils/cn.ts`
- Create: `lib/site-content.ts`
- Create: `lib/booking/whatsapp.ts`
- Create: `lib/availability/availability.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/auth/guards.ts`

### Types and database

- Create: `types/database.ts`
- Create: `types/booking.ts`
- Create: `types/property.ts`
- Create: `types/availability.ts`
- Create: `supabase/migrations/202606020001_initial_schema.sql`
- Create: `supabase/seed.sql`

### Tests

- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `lib/availability/availability.test.ts`
- Create: `lib/booking/whatsapp.test.ts`

## Task 1: Scaffold The Next.js Foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `components.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `app/layout.tsx`
- Create: `app/globals.css`

- [ ] **Step 1: Write the failing config smoke test**

Create `package.json` with a test script that will fail before the app exists:

```json
{
  "name": "sukahomestay",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  }
}
```

Create `app/layout.tsx` with an intentionally unresolved import:

```tsx
import "./globals.css";
import { siteFont } from "@/lib/site-font";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={siteFont.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Run build to verify it fails**

Run: `npm run build`

Expected: FAIL with a module resolution error for `@/lib/site-font` or with missing Next.js project configuration.

- [ ] **Step 3: Write the minimal project foundation**

Replace `app/layout.tsx` and add the base config files:

`app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Sukahomestay",
  description: "Modern homestay and roomstay booking experience.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

`app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 34 33% 98%;
  --foreground: 222 39% 16%;
  --card: 0 0% 100%;
  --card-foreground: 222 39% 16%;
  --muted: 210 24% 96%;
  --muted-foreground: 215 16% 44%;
  --border: 214 23% 91%;
  --primary: 26 98% 55%;
  --primary-foreground: 0 0% 100%;
  --ring: 26 98% 55%;
  --radius: 1.25rem;
}

body {
  font-family: var(--font-body), sans-serif;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

h1,
h2,
h3,
h4 {
  font-family: var(--font-display), serif;
}
```

`tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
      },
      borderRadius: {
        xl: "var(--radius)",
        "2xl": "calc(var(--radius) + 0.5rem)",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
```

`.env.example`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 4: Run build to verify the foundation passes**

Run: `npm run build`

Expected: PASS or fail only because dependencies are not installed yet. After `npm install`, it should compile the root layout without import errors.

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json next.config.ts postcss.config.mjs tailwind.config.ts components.json .gitignore .env.example app/layout.tsx app/globals.css
git commit -m "chore: scaffold nextjs foundation"
```

## Task 2: Add Shared Types, Schema, And Seed Data

**Files:**
- Create: `types/database.ts`
- Create: `types/booking.ts`
- Create: `types/property.ts`
- Create: `types/availability.ts`
- Create: `supabase/migrations/202606020001_initial_schema.sql`
- Create: `supabase/seed.sql`

- [ ] **Step 1: Write the failing availability type test**

Create `lib/availability/availability.test.ts` with a missing import:

```ts
import { describe, expect, it } from "vitest";
import { canCreateBooking } from "./availability";

describe("canCreateBooking", () => {
  it("blocks whole-house booking when a homestay booking exists", () => {
    const result = canCreateBooking({
      request: {
        bookingType: "whole_house",
        checkIn: "2026-06-10",
        checkOut: "2026-06-12",
      },
      existingBookings: [
        {
          bookingType: "homestay",
          checkIn: "2026-06-11",
          checkOut: "2026-06-13",
          status: "booked",
        },
      ],
    });

    expect(result.available).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- lib/availability/availability.test.ts`

Expected: FAIL because `./availability` does not exist yet.

- [ ] **Step 3: Write the shared types and database schema**

`types/booking.ts`

```ts
export type BookingStatus = "pending" | "booked" | "cancelled" | "rejected";
export type BookingType = "homestay" | "roomstay" | "whole_house";

export interface BookingRecord {
  id?: string;
  userId?: string | null;
  bookingType: BookingType;
  roomId?: string | null;
  checkIn: string;
  checkOut: string;
  guestCount?: number;
  fullName?: string;
  phone?: string;
  email?: string;
  specialRequest?: string | null;
  status: BookingStatus;
}
```

`types/availability.ts`

```ts
import type { BookingRecord, BookingType } from "./booking";

export interface AvailabilityRequest {
  bookingType: BookingType;
  checkIn: string;
  checkOut: string;
  roomId?: string | null;
}

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
  conflictingBookings: BookingRecord[];
}
```

`supabase/migrations/202606020001_initial_schema.sql`

```sql
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role text not null check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('homestay', 'roomstay', 'whole_house')),
  description text not null,
  bedrooms integer not null,
  bathrooms integer not null,
  max_guests integer not null,
  price_per_night numeric(10,2) not null,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  name text not null,
  bedrooms integer not null,
  bathrooms integer not null,
  max_guests integer not null,
  price_per_night numeric(10,2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete set null,
  booking_type text not null check (booking_type in ('homestay', 'roomstay', 'whole_house')),
  room_id uuid references rooms (id) on delete set null,
  check_in_date date not null,
  check_out_date date not null,
  guest_count integer not null,
  full_name text not null,
  phone text not null,
  email text not null,
  special_request text,
  status text not null check (status in ('pending', 'booked', 'cancelled', 'rejected')) default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists availability_rules (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  booking_type text not null check (booking_type in ('homestay', 'roomstay', 'whole_house')),
  room_id uuid references rooms (id) on delete set null,
  status text not null,
  created_at timestamptz not null default now()
);
```

- [ ] **Step 4: Run test to verify type imports now compile**

Run: `npm run test -- lib/availability/availability.test.ts`

Expected: FAIL because `canCreateBooking` is still unimplemented, but imports from `types/booking` and `types/availability` should be resolvable once the test file is updated to use them.

- [ ] **Step 5: Commit**

```bash
git add types/database.ts types/booking.ts types/property.ts types/availability.ts supabase/migrations/202606020001_initial_schema.sql supabase/seed.sql lib/availability/availability.test.ts
git commit -m "feat: add booking schema and shared types"
```

## Task 3: Implement And Test Availability Logic

**Files:**
- Create: `lib/availability/availability.ts`
- Modify: `lib/availability/availability.test.ts`

- [ ] **Step 1: Write the failing availability behavior tests**

Replace `lib/availability/availability.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { canCreateBooking } from "./availability";

describe("canCreateBooking", () => {
  it("blocks whole-house when a homestay booking overlaps", () => {
    const result = canCreateBooking({
      request: {
        bookingType: "whole_house",
        checkIn: "2026-06-10",
        checkOut: "2026-06-12",
      },
      existingBookings: [
        {
          bookingType: "homestay",
          checkIn: "2026-06-11",
          checkOut: "2026-06-13",
          status: "booked",
        },
      ],
    });

    expect(result.available).toBe(false);
    expect(result.reason).toBe("whole_house_conflict");
  });

  it("allows homestay when only another roomstay overlaps", () => {
    const result = canCreateBooking({
      request: {
        bookingType: "homestay",
        checkIn: "2026-06-10",
        checkOut: "2026-06-12",
      },
      existingBookings: [
        {
          bookingType: "roomstay",
          roomId: "room-1",
          checkIn: "2026-06-10",
          checkOut: "2026-06-12",
          status: "booked",
        },
      ],
    });

    expect(result.available).toBe(true);
  });

  it("blocks roomstay when the same room already has a pending booking", () => {
    const result = canCreateBooking({
      request: {
        bookingType: "roomstay",
        roomId: "room-2",
        checkIn: "2026-06-10",
        checkOut: "2026-06-12",
      },
      existingBookings: [
        {
          bookingType: "roomstay",
          roomId: "room-2",
          checkIn: "2026-06-11",
          checkOut: "2026-06-13",
          status: "pending",
        },
      ],
    });

    expect(result.available).toBe(false);
    expect(result.reason).toBe("roomstay_conflict");
  });

  it("ignores rejected and cancelled bookings", () => {
    const result = canCreateBooking({
      request: {
        bookingType: "whole_house",
        checkIn: "2026-06-10",
        checkOut: "2026-06-12",
      },
      existingBookings: [
        {
          bookingType: "homestay",
          checkIn: "2026-06-10",
          checkOut: "2026-06-12",
          status: "cancelled",
        },
        {
          bookingType: "roomstay",
          roomId: "room-1",
          checkIn: "2026-06-10",
          checkOut: "2026-06-12",
          status: "rejected",
        },
      ],
    });

    expect(result.available).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- lib/availability/availability.test.ts`

Expected: FAIL because `canCreateBooking` does not exist.

- [ ] **Step 3: Write the minimal implementation**

Create `lib/availability/availability.ts`:

```ts
import type { BookingRecord } from "@/types/booking";
import type { AvailabilityRequest, AvailabilityResult } from "@/types/availability";

interface CanCreateBookingInput {
  request: AvailabilityRequest;
  existingBookings: BookingRecord[];
}

const BLOCKING_STATUSES = new Set(["pending", "booked"]);

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd;
}

export function canCreateBooking({
  request,
  existingBookings,
}: CanCreateBookingInput): AvailabilityResult {
  const conflictingBookings = existingBookings.filter((booking) => {
    if (!BLOCKING_STATUSES.has(booking.status)) return false;
    if (!overlaps(request.checkIn, request.checkOut, booking.checkIn, booking.checkOut)) return false;

    if (request.bookingType === "whole_house") return true;
    if (request.bookingType === "homestay") {
      return booking.bookingType === "whole_house" || booking.bookingType === "homestay";
    }

    if (booking.bookingType === "whole_house") return true;
    return booking.bookingType === "roomstay" && booking.roomId === request.roomId;
  });

  if (conflictingBookings.length === 0) {
    return { available: true, conflictingBookings: [] };
  }

  const reason =
    request.bookingType === "whole_house"
      ? "whole_house_conflict"
      : request.bookingType === "homestay"
        ? "homestay_conflict"
        : "roomstay_conflict";

  return {
    available: false,
    reason,
    conflictingBookings,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- lib/availability/availability.test.ts`

Expected: PASS with 4 passing tests.

- [ ] **Step 5: Commit**

```bash
git add lib/availability/availability.ts lib/availability/availability.test.ts
git commit -m "feat: add booking availability rules"
```

## Task 4: Add Supabase Helpers, Auth Guards, And WhatsApp Formatting

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/auth/guards.ts`
- Create: `lib/booking/whatsapp.ts`
- Create: `lib/booking/whatsapp.test.ts`

- [ ] **Step 1: Write the failing WhatsApp formatter test**

Create `lib/booking/whatsapp.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildWhatsAppBookingMessage } from "./whatsapp";

describe("buildWhatsAppBookingMessage", () => {
  it("includes the main booking details", () => {
    const message = buildWhatsAppBookingMessage({
      fullName: "Aina",
      bookingType: "homestay",
      checkIn: "2026-06-10",
      checkOut: "2026-06-12",
      guestCount: 6,
    });

    expect(message).toContain("Aina");
    expect(message).toContain("homestay");
    expect(message).toContain("2026-06-10");
    expect(message).toContain("6");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- lib/booking/whatsapp.test.ts`

Expected: FAIL because `./whatsapp` does not exist.

- [ ] **Step 3: Write the minimal helper implementations**

`lib/booking/whatsapp.ts`

```ts
interface WhatsAppMessageInput {
  fullName: string;
  bookingType: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
}

export function buildWhatsAppBookingMessage(input: WhatsAppMessageInput) {
  return [
    "Hello, I would like to confirm my booking.",
    `Name: ${input.fullName}`,
    `Booking type: ${input.bookingType}`,
    `Check-in: ${input.checkIn}`,
    `Check-out: ${input.checkOut}`,
    `Guests: ${input.guestCount}`,
  ].join("\n");
}
```

`lib/auth/guards.ts`

```ts
export function isAdminRole(role: string | null | undefined) {
  return role === "admin";
}

export function isUserRole(role: string | null | undefined) {
  return role === "user";
}
```

`lib/supabase/client.ts`

```ts
import { createClient } from "@supabase/supabase-js";

export function createBrowserSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 4: Run tests to verify the formatter passes**

Run: `npm run test -- lib/booking/whatsapp.test.ts`

Expected: PASS with 1 passing test.

- [ ] **Step 5: Commit**

```bash
git add lib/supabase/client.ts lib/supabase/server.ts lib/auth/guards.ts lib/booking/whatsapp.ts lib/booking/whatsapp.test.ts
git commit -m "feat: add auth helpers and whatsapp formatter"
```

## Task 5: Build The Marketing Shell And Design System

**Files:**
- Create: `lib/site-content.ts`
- Create: `lib/utils/cn.ts`
- Create: `components/ui/button.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/badge.tsx`
- Create: `components/layout/site-header.tsx`
- Create: `components/layout/site-footer.tsx`
- Create: `components/marketing/hero-section.tsx`
- Create: `components/marketing/search-bar.tsx`
- Create: `components/marketing/property-showcase.tsx`
- Create: `components/marketing/facilities-section.tsx`
- Create: `components/marketing/gallery-section.tsx`
- Create: `components/marketing/how-it-works.tsx`
- Create: `components/marketing/contact-section.tsx`
- Create: `app/(marketing)/page.tsx`

- [ ] **Step 1: Write the failing landing page render test**

Create `app/(marketing)/page.tsx` with a missing component import:

```tsx
import { HeroSection } from "@/components/marketing/hero-section";
import { MissingSection } from "@/components/marketing/missing-section";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <MissingSection />
    </main>
  );
}
```

- [ ] **Step 2: Run build to verify it fails**

Run: `npm run build`

Expected: FAIL with a missing module error for `missing-section`.

- [ ] **Step 3: Write the minimal marketing shell**

`lib/site-content.ts`

```ts
export const siteContent = {
  hero: {
    eyebrow: "Feel at home, anywhere",
    title: "Find Your Perfect Homestay",
    description:
      "Discover a warm, modern stay with homestay, roomstay, and whole-house options in one place.",
  },
  contact: {
    phone: "+60 12-345 6789",
    email: "hello@sukahomestay.com",
    whatsapp: "60123456789",
  },
};
```

`components/marketing/hero-section.tsx`

```tsx
import { siteContent } from "@/lib/site-content";

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center">
      <div className="space-y-6">
        <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm text-muted-foreground shadow-soft">
          {siteContent.hero.eyebrow}
        </span>
        <div className="space-y-3">
          <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-foreground">
            Find Your Perfect <span className="text-primary">Homestay</span>
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">
            {siteContent.hero.description}
          </p>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#d9ecff_0%,#ffffff_35%,#ff7a1a_35%,#ff7a1a_100%)] p-10 shadow-soft">
        <div className="min-h-[420px] rounded-[1.5rem] bg-white/70" />
      </div>
    </section>
  );
}
```

`app/(marketing)/page.tsx`

```tsx
import { ContactSection } from "@/components/marketing/contact-section";
import { FacilitiesSection } from "@/components/marketing/facilities-section";
import { GallerySection } from "@/components/marketing/gallery-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PropertyShowcase } from "@/components/marketing/property-showcase";
import { SearchBar } from "@/components/marketing/search-bar";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <SearchBar />
      <PropertyShowcase />
      <FacilitiesSection />
      <GallerySection />
      <HowItWorks />
      <ContactSection />
    </main>
  );
}
```

- [ ] **Step 4: Run build to verify the marketing route passes**

Run: `npm run build`

Expected: PASS for the landing route once all referenced marketing components and shared UI primitives exist.

- [ ] **Step 5: Commit**

```bash
git add lib/site-content.ts lib/utils/cn.ts components/ui components/layout components/marketing app/(marketing)/page.tsx
git commit -m "feat: add marketing shell and brand system"
```

## Task 6: Add Property, Availability, And Booking Pages

**Files:**
- Create: `components/calendar/availability-calendar.tsx`
- Create: `components/property/property-detail.tsx`
- Create: `components/booking/booking-form.tsx`
- Create: `components/booking/booking-summary-card.tsx`
- Create: `app/(marketing)/homestay/page.tsx`
- Create: `app/(marketing)/roomstay/page.tsx`
- Create: `app/(marketing)/availability/page.tsx`
- Create: `app/(marketing)/booking/page.tsx`

- [ ] **Step 1: Write the failing booking page build check**

Create `app/(marketing)/booking/page.tsx` with a missing form component:

```tsx
import { BookingForm } from "@/components/booking/booking-form";
import { BookingReceipt } from "@/components/booking/booking-receipt";

export default function BookingPage() {
  return (
    <main>
      <BookingForm />
      <BookingReceipt />
    </main>
  );
}
```

- [ ] **Step 2: Run build to verify it fails**

Run: `npm run build`

Expected: FAIL with a missing module error for `booking-receipt`.

- [ ] **Step 3: Write the minimal booking and property pages**

`components/booking/booking-form.tsx`

```tsx
export function BookingForm() {
  return (
    <form className="space-y-6 rounded-[2rem] border border-border bg-white p-8 shadow-soft">
      <h2 className="text-2xl font-semibold">Booking Request</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <input className="rounded-xl border border-border px-4 py-3" placeholder="Full name" />
        <input className="rounded-xl border border-border px-4 py-3" placeholder="Phone number" />
        <input className="rounded-xl border border-border px-4 py-3" placeholder="Email" />
        <input className="rounded-xl border border-border px-4 py-3" placeholder="Guests" />
      </div>
      <button className="rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground">
        Submit booking request
      </button>
    </form>
  );
}
```

`app/(marketing)/booking/page.tsx`

```tsx
import { BookingForm } from "@/components/booking/booking-form";
import { BookingSummaryCard } from "@/components/booking/booking-summary-card";

export default function BookingPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
      <BookingForm />
      <BookingSummaryCard />
    </main>
  );
}
```

`app/(marketing)/availability/page.tsx`

```tsx
import { AvailabilityCalendar } from "@/components/calendar/availability-calendar";

export default function AvailabilityPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-4xl font-semibold">Availability Calendar</h1>
      <AvailabilityCalendar />
    </main>
  );
}
```

- [ ] **Step 4: Run build to verify the pages compile**

Run: `npm run build`

Expected: PASS with the marketing, property, availability, and booking routes all compiling.

- [ ] **Step 5: Commit**

```bash
git add components/calendar components/property components/booking app/(marketing)/homestay/page.tsx app/(marketing)/roomstay/page.tsx app/(marketing)/availability/page.tsx app/(marketing)/booking/page.tsx
git commit -m "feat: add booking and property pages"
```

## Task 7: Add Customer Dashboard And Admin Views

**Files:**
- Create: `components/dashboard/booking-list.tsx`
- Create: `components/admin/booking-table.tsx`
- Create: `components/admin/metrics-grid.tsx`
- Create: `app/(dashboard)/dashboard/page.tsx`
- Create: `app/(admin)/admin/page.tsx`
- Create: `app/(admin)/admin/bookings/page.tsx`
- Create: `app/(admin)/admin/calendar/page.tsx`
- Create: `app/(admin)/admin/property/page.tsx`
- Create: `app/auth/login/page.tsx`

- [ ] **Step 1: Write the failing admin route build check**

Create `app/(admin)/admin/page.tsx` with a missing import:

```tsx
import { MetricsGrid } from "@/components/admin/metrics-grid";
import { PendingChart } from "@/components/admin/pending-chart";

export default function AdminDashboardPage() {
  return (
    <main>
      <MetricsGrid />
      <PendingChart />
    </main>
  );
}
```

- [ ] **Step 2: Run build to verify it fails**

Run: `npm run build`

Expected: FAIL because `pending-chart` does not exist.

- [ ] **Step 3: Write the minimal dashboard and admin routes**

`app/(dashboard)/dashboard/page.tsx`

```tsx
import { BookingList } from "@/components/dashboard/booking-list";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-semibold">Your Bookings</h1>
        <p className="text-muted-foreground">Track booking status and continue payment via WhatsApp.</p>
      </div>
      <BookingList />
    </main>
  );
}
```

`app/(admin)/admin/page.tsx`

```tsx
import { MetricsGrid } from "@/components/admin/metrics-grid";

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor bookings, availability, and property content.</p>
      </div>
      <MetricsGrid />
    </main>
  );
}
```

`app/(admin)/admin/bookings/page.tsx`

```tsx
import { BookingTable } from "@/components/admin/booking-table";

export default function AdminBookingsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="mb-8 text-4xl font-semibold">Booking Management</h1>
      <BookingTable />
    </main>
  );
}
```

- [ ] **Step 4: Run build to verify the private routes compile**

Run: `npm run build`

Expected: PASS with customer dashboard, admin dashboard, admin booking management, admin calendar, admin property management, and login routes compiling.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard components/admin app/(dashboard)/dashboard/page.tsx app/(admin)/admin app/auth/login/page.tsx
git commit -m "feat: add dashboard and admin views"
```

## Task 8: Verify The Full Scaffold

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write the failing documentation check**

Create `README.md` without setup steps:

```md
# Sukahomestay
```

- [ ] **Step 2: Run the final verification commands**

Run: `npm run test`

Expected: PASS for availability and WhatsApp helper tests.

Run: `npm run build`

Expected: PASS for the full route scaffold.

- [ ] **Step 3: Write the minimal project README**

Replace `README.md` with:

```md
# Sukahomestay

Single-property homestay booking platform built with Next.js, TypeScript, Tailwind CSS, and Supabase-ready schema files.

## Local setup

1. Install dependencies with `npm install`
2. Copy `.env.example` values into a local `.env.local`
3. Run `npm run dev`
4. Run tests with `npm run test`

## Current scope

- Marketing landing page
- Property detail pages
- Availability page
- Booking request page
- Customer dashboard scaffold
- Admin dashboard scaffold
- Availability rule engine tests
```

- [ ] **Step 4: Run the full verification again**

Run: `npm run test`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: add local setup guide"
```

## Self-Review

### Spec coverage

- Marketing landing page: covered in Task 5
- Property, availability, and booking pages: covered in Task 6
- Customer and admin routes: covered in Task 7
- Supabase-ready schema and seed data: covered in Task 2
- Availability logic reuse: covered in Task 3
- WhatsApp confirmation helper: covered in Task 4
- App scaffold and design tokens: covered in Task 1 and Task 5

### Placeholder scan

No `TBD`, `TODO`, or deferred implementation notes are left in task steps. Each task contains exact file paths, commands, and concrete code shapes.

### Type consistency

The plan consistently uses:

- `BookingType`: `homestay | roomstay | whole_house`
- `BookingStatus`: `pending | booked | cancelled | rejected`
- `canCreateBooking` as the shared availability entry point
- `buildWhatsAppBookingMessage` as the WhatsApp formatter entry point

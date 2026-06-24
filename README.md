# Sukahomestay

Sukahomestay is a public booking platform built with a React frontend in `web/`
and an Express + Prisma + MySQL backend in `server/`.

## Project structure

- `web/`: customer-facing Vite React application
- `server/`: Express API, Prisma schema, and seed data

## Local setup

1. Install frontend dependencies with `npm install --legacy-peer-deps` inside `web/`
2. Install backend dependencies with `npm install` inside `server/`
3. Copy `web/.env.example` to `web/.env`
4. Copy `server/.env.example` to `server/.env`
5. Run `npm run prisma:generate` inside `server/`
6. Run Prisma migrations against MySQL with `npx prisma migrate dev --name init`
7. Seed the database with `npm run prisma:seed`
8. Start the backend with `npm run dev`
9. Start the frontend with `npm run dev`

## Current scope

- Standardized public booking UI across landing, homestay, roomstay, availability, booking, and success pages
- Bright hospitality design system with orange primary actions and shared public-page components
- Visible availability calendar on the homepage
- Homestay and roomstay pages
- Availability checking
- Booking request flow
- Express API with Prisma-backed booking validation

## Testing

- Backend tests: `npm run test` from `server/`
- Frontend production build: `npm run build` from `web/`

# REST API

All endpoints are under `/api/v1` and respond with `{ success, data, message }`. Validation errors include an `errors` array of `{ field, message }`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Liveness response |
| — | Supabase Auth | Public/customer | Registration, login, logout, verification and password recovery happen with the browser client |
| GET | `/properties` | Public | Catalogue or date/guest availability search |
| GET | `/properties/:slug` | Public | Property, rooms, amenities and rates |
| POST | `/bookings/quote` | Public | Server-side price quote |
| POST | `/bookings/reserve` | Public / customer | Idempotently recheck, save `PENDING_APPROVAL`, and return WhatsApp URL |
| POST | `/bookings/lookup` | Public, rate limited | Look up by reference plus phone/email |
| GET | `/bookings/mine` | Customer | Booking history |
| POST | `/bookings/:id/cancel` | Customer | Cancel an eligible booking |
| GET | `/admin/dashboard` | Admin | Operational summary |
| GET | `/admin/bookings` | Admin | Booking list |
| GET | `/admin/bookings/:id` | Admin | Booking detail and manual payment record |
| POST | `/admin/bookings/:id/approve` | Admin | Approve and create payment deadline |
| POST | `/admin/bookings/:id/reject` | Admin | Reject with a required reason |
| POST | `/admin/bookings/:id/payment-submitted` | Admin | Record an unverified manual payment |
| POST | `/admin/bookings/:id/verify-payment` | Admin | Verify payment and confirm booking |
| POST | `/admin/bookings/:id/reject-payment` | Admin | Reject payment and request correction |
| POST | `/admin/bookings/:id/extend-expiry` | Admin | Extend or disable automatic expiry |
| PATCH | `/admin/bookings/:id/dates` | Admin | Change dates with locked conflict recheck |
| GET/PUT | `/admin/settings` | Admin | Read/update bank, WhatsApp, policy and templates |
| POST | `/admin/properties` | Admin | Create property |
| PUT | `/admin/properties/:id` | Admin | Update property/catalog status |
| POST | `/admin/properties/:propertyId/rooms` | Admin | Create room inventory |
| PUT | `/admin/rooms/:id` | Admin | Update room inventory |
| PUT | `/admin/rate-plans/:id` | Admin | Update server-managed pricing |
| POST | `/admin/calendar/blocks` | Admin | Block inventory dates |
| GET | `/admin/payments/:id/receipt-url` | Admin | Create a five-minute signed receipt URL |

Authenticated calls send a Supabase access token in the Bearer header. All admin mutations are database-role-protected and audited. A payment-submission record never confirms a booking; only the verify-payment action does.

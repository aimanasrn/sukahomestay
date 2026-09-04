# Booking and concurrency rules

Two ranges overlap when `requestedCheckIn < existingCheckOut && requestedCheckOut > existingCheckIn`. The exclusive checkout boundary permits a new arrival on another guest’s checkout date.

`PENDING_APPROVAL`, `AWAITING_PAYMENT`, `PAYMENT_SUBMITTED`, `CONFIRMED`, and `CHECKED_IN` block inventory. The first two stop blocking immediately when their deadline passes, even before the expiry job updates their status. `REJECTED`, `CANCELLED`, `EXPIRED`, and `COMPLETED` release inventory. Whole-property bookings conflict with every room booking in the property; room bookings conflict with whole-property bookings and bookings for the same room.

Creation uses one PostgreSQL transaction. It acquires `pg_advisory_xact_lock(hashtextextended(propertyId, 0))`, rechecks bookings and administrator blocks, creates the booking/items/guest/audit rows, then commits. Conflicts return HTTP 409. The property lock serializes all booking creation within one property, including whole-property versus room requests.

The five-minute scheduled job marks overdue approval/payment reservations `EXPIRED`. Administrators can extend a deadline or disable automatic expiry for an individual reservation.

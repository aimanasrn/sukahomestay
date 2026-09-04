# Manual payments

SUKA HOMESTAY does not use an automatic payment gateway. A new reservation starts at `PENDING_APPROVAL`. Only after an administrator approves it does the customer receive bank or DuitNow instructions through WhatsApp and the booking moves to `AWAITING_PAYMENT`.

An administrator records a transaction reference, amount, payment date and optional private Storage receipt path. This creates or updates the `manual_payments` row as `PENDING_VERIFICATION` and moves the booking to `PAYMENT_SUBMITTED`; it does not confirm the booking. A separate admin-only verification action sets the payment to `VERIFIED` and the booking to `CONFIRMED`. Rejected payments return the booking to `AWAITING_PAYMENT` with a new deadline. Receipt access uses five-minute signed URLs.

Bank details are read from admin settings and are only inserted into the approval message. Approval, payment recording, verification, rejection and confirmation create audit-log entries.

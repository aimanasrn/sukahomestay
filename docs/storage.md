# Supabase Storage

The migration creates:

- `property-images`, `room-images`: public read; authenticated admins write.
- `payment-receipts`: private; the booking owner/admin may access the correct booking folder.
- `avatars`: private; owner folder read/write.

Bucket MIME and size limits enforce images ≤10 MB, receipts ≤5 MB (JPEG/PNG/WebP/PDF), and avatars ≤2 MB. Client helpers validate again and use `<owner-or-booking-uuid>/<random-uuid>.<safe-ext>` with `upsert:false`; original filenames are not trusted. Receipt paths—not public URLs—are stored. Signed receipt URLs expire after 300 seconds.

Upload seed catalog images to the public buckets if replacing the provided web/demo paths. Never switch `payment-receipts` to public.

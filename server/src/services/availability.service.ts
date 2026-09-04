import type { Sql, TransactionSql } from "postgres";
import { sql } from "../config/database.js";
import type { InventoryType } from "../types/domain.js";
import { listPublished } from "../repositories/property.repository.js";

export async function hasConflict(
  tx: Sql | TransactionSql,
  input: {
    propertyId: string;
    roomId?: string;
    inventoryType: InventoryType;
    checkIn: Date;
    checkOut: Date;
    excludeBookingId?: string;
  },
) {
  const rows = await tx<{ conflict: boolean }[]>`
    select exists (
      select 1 from public.bookings b
      where b.property_id = ${input.propertyId}
        and (${input.excludeBookingId ?? null}::uuid is null or b.id <> ${input.excludeBookingId ?? null}::uuid)
        and ${input.checkIn}::date < b.check_out and ${input.checkOut}::date > b.check_in
        and (
          b.status in ('PAYMENT_SUBMITTED','CONFIRMED','CHECKED_IN') or
          (b.status = 'PENDING_APPROVAL' and (b.auto_expiry_disabled or b.pending_expires_at > now())) or
          (b.status = 'AWAITING_PAYMENT' and (b.auto_expiry_disabled or b.payment_expires_at > now()))
        )
        and (
          ${input.inventoryType === "ENTIRE_PROPERTY"} or b.inventory_type = 'ENTIRE_PROPERTY' or
          exists (select 1 from public.booking_items bi where bi.booking_id = b.id and bi.room_id = ${input.roomId ?? null}::uuid)
        )
    ) or exists (
      select 1 from public.availability_blocks ab
      where ab.property_id = ${input.propertyId}
        and ${input.checkIn}::date < ab.end_date and ${input.checkOut}::date > ab.start_date
        and (ab.room_id is null or ${input.inventoryType === "ENTIRE_PROPERTY"} or ab.room_id = ${input.roomId ?? null}::uuid)
    ) as conflict
  `;
  return rows[0]?.conflict ?? false;
}

export async function availableProperties(input: {
  checkIn: Date;
  checkOut: Date;
  guests: number;
}) {
  const properties = (await listPublished()).filter((property) => property.maxGuests >= input.guests);
  const results = [];
  for (const property of properties) {
    const entireConflict = await hasConflict(sql, {
      propertyId: property.id,
      inventoryType: "ENTIRE_PROPERTY",
      checkIn: input.checkIn,
      checkOut: input.checkOut,
    });
    const availableRooms = [];
    for (const room of property.rooms.filter(
      (candidate: any) => candidate.capacity >= input.guests,
    )) {
      if (
        !(await hasConflict(sql, {
          propertyId: property.id,
          roomId: room.id,
          inventoryType: "ROOM",
          checkIn: input.checkIn,
          checkOut: input.checkOut,
        }))
      )
        availableRooms.push(room);
    }
    if (!entireConflict || availableRooms.length)
      results.push({
        ...property,
        entirePropertyAvailable: !entireConflict,
        availableRooms,
      });
  }
  return results;
}

import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ bookings: [] as any[], committed: false, queue: Promise.resolve() as Promise<unknown> }));

vi.mock("../src/config/database.js", () => {
  const tag: any = async (strings: TemplateStringsArray, ...values: any[]) => {
    const query = strings.join("?").replace(/\s+/g, " ").trim().toLowerCase();
    if (query.includes("from public.app_settings")) return [];
    if (query.includes("pg_advisory_xact_lock")) return [];
    if (query.includes("from public.properties p") && query.includes("weekday_price_sen")) return [{ id: values[1], name: "Alam Villa", slug: "alam-villa", status: "PUBLISHED", max_guests: 8, base_price_sen: 62000, cleaning_fee_sen: 9000, weekday_price_sen: 62000, weekend_price_sen: 70000, extra_guest_fee_sen: 0, included_guests: 4, room_id: null }];
    if (query.includes("from public.seasonal_rates")) return [];
    if (query.startsWith("select exists")) return [{ conflict: state.bookings.length > 0 }];
    if (query.includes("where idempotency_key")) { const found = state.bookings.find((b) => b.idempotency_key === values[0]); return found ? [{ id: found.id }] : []; }
    if (query.startsWith("insert into public.bookings")) {
      const row = { id: `booking-${state.bookings.length + 1}`, booking_reference: values[0], idempotency_key: values[1], customer_id: values[2], guest_name: values[3], guest_phone: values[4], guest_email: values[5], property_id: values[6], inventory_type: values[7], check_in: values[8], check_out: values[9], adult_count: values[10], child_count: values[11], special_request: values[12], status: "PENDING_APPROVAL", subtotal_amount: values[13], cleaning_fee: values[14], additional_fee: values[15], total_amount: values[16], pending_expires_at: values[17], payment_expires_at: null };
      state.bookings.push(row); return [{ id: row.id }];
    }
    if (query.startsWith("insert into public.booking_items") || query.startsWith("insert into public.booking_guests") || query.startsWith("insert into public.audit_logs")) return [];
    if (query.includes("select b.*, p.name as property_name")) { const b = state.bookings.find((x) => x.id === values[0]); return b ? [{ ...b, property_name: "Alam Villa", property_slug: "alam-villa" }] : []; }
    if (query.includes("from public.booking_items")) return [{ id: "item-1", room_id: null }];
    if (query.includes("from public.manual_payments")) return [];
    throw new Error(`Unhandled SQL in test: ${query}`);
  };
  tag.begin = vi.fn((callback: (tx: any) => Promise<unknown>) => {
    const run = state.queue.then(() => callback(tag));
    state.queue = run.then(() => { state.committed = true; }, () => undefined);
    return run;
  });
  tag.json = (value: unknown) => value;
  return { sql: tag };
});

import { createReservation } from "../src/services/booking.service.js";
const input = (idempotencyKey: string) => ({ idempotencyKey, propertyId: "11111111-1111-4111-8111-111111111111", inventoryType: "ENTIRE_PROPERTY" as const, checkIn: new Date("2026-09-18"), checkOut: new Date("2026-09-21"), adultCount: 4, childCount: 1, specialRequests: "Late arrival", houseRulesAccepted: true as const, cancellationPolicyAccepted: true as const, privacyPolicyAccepted: true as const, guest: { fullName: "Aiman Zulkifli", email: "aiman@example.com", phone: "0123456789" } });

describe("atomic Supabase reservation creation", () => {
  beforeEach(() => { state.bookings.length = 0; state.committed = false; state.queue = Promise.resolve(); });
  it("commits before returning the WhatsApp URL", async () => { const result = await createReservation(undefined, input("38ee4edb-acaa-44d4-b33b-fd6e42f20998")); expect(state.committed).toBe(true); expect(result.booking.status).toBe("PENDING_APPROVAL"); expect(result.whatsappUrl).toContain("https://wa.me/"); });
  it("is idempotent", async () => { const first=await createReservation(undefined,input("48ee4edb-acaa-44d4-b33b-fd6e42f20998"));const retry=await createReservation(undefined,input("48ee4edb-acaa-44d4-b33b-fd6e42f20998"));expect(state.bookings).toHaveLength(1);expect(retry.booking.id).toBe(first.booking.id); });
  it("serializes simultaneous conflicting requests", async () => { const results=await Promise.allSettled([createReservation(undefined,input("58ee4edb-acaa-44d4-b33b-fd6e42f20998")),createReservation(undefined,input("68ee4edb-acaa-44d4-b33b-fd6e42f20998"))]);expect(results.filter(r=>r.status==="fulfilled")).toHaveLength(1);expect(results.filter(r=>r.status==="rejected")).toHaveLength(1);expect(state.bookings).toHaveLength(1); });
});

import { describe, expect, it } from "vitest";
import {
  canTransition,
  inventoryConflicts,
  normalizeMalaysianPhone,
  reservationBlocksAvailability,
} from "../src/modules/bookings/reservation-rules.js";
import { buildReservationMessage, makeWhatsAppUrl } from "../src/services/whatsapp.service.js";

describe("manual reservation rules", () => {
  it("normalizes Malaysian phone numbers for WhatsApp", () => {
    expect(normalizeMalaysianPhone("012-345 6789")).toBe("60123456789");
    expect(normalizeMalaysianPhone("+6012 345 6789")).toBe("60123456789");
    expect(() => normalizeMalaysianPhone("123")).toThrow(/valid Malaysian/);
  });

  it("blocks active pending reservations and releases expired reservations", () => {
    const now = new Date("2026-09-04T10:00:00Z");
    expect(reservationBlocksAvailability({ status: "PENDING_APPROVAL", expiresAt: new Date("2026-09-04T11:00:00Z") }, now)).toBe(true);
    expect(reservationBlocksAvailability({ status: "PENDING_APPROVAL", expiresAt: new Date("2026-09-04T09:00:00Z") }, now)).toBe(false);
    expect(reservationBlocksAvailability({ status: "EXPIRED", expiresAt: null }, now)).toBe(false);
    expect(reservationBlocksAvailability({ status: "PAYMENT_SUBMITTED", expiresAt: null }, now)).toBe(true);
  });

  it("enforces the approval and manual payment transition sequence", () => {
    expect(canTransition("PENDING_APPROVAL", "AWAITING_PAYMENT")).toBe(true);
    expect(canTransition("AWAITING_PAYMENT", "PAYMENT_SUBMITTED")).toBe(true);
    expect(canTransition("AWAITING_PAYMENT", "CONFIRMED")).toBe(false);
    expect(canTransition("PAYMENT_SUBMITTED", "CONFIRMED")).toBe(true);
    expect(canTransition("PENDING_APPROVAL", "REJECTED")).toBe(true);
  });

  it("prevents whole-property and same-room conflicts but allows other rooms", () => {
    expect(inventoryConflicts({ inventoryType: "ENTIRE_PROPERTY" }, { inventoryType: "ROOM", roomId: "a" })).toBe(true);
    expect(inventoryConflicts({ inventoryType: "ROOM", roomId: "a" }, { inventoryType: "ENTIRE_PROPERTY" })).toBe(true);
    expect(inventoryConflicts({ inventoryType: "ROOM", roomId: "a" }, { inventoryType: "ROOM", roomId: "a" })).toBe(true);
    expect(inventoryConflicts({ inventoryType: "ROOM", roomId: "a" }, { inventoryType: "ROOM", roomId: "b" })).toBe(false);
  });

  it("creates an encoded Malay WhatsApp message without identity information", () => {
    const message = buildReservationMessage({
      reference: "SUKA-20260904-A8K2", propertyName: "Alam Villa", selectionName: "Seluruh homestay",
      checkIn: new Date("2026-09-18"), checkOut: new Date("2026-09-21"), adultCount: 4, childCount: 1,
      customerName: "Aiman", customerPhone: "60123456789", customerEmail: "aiman@example.com",
      subtotalSen: 186000, cleaningFeeSen: 9000, extraGuestFeeSen: 8000, totalSen: 203000,
      specialRequests: "",
    });
    expect(message).toContain("SUKA-20260904-A8K2");
    expect(message).toContain("4 dewasa, 1 kanak-kanak");
    expect(message).toContain("Jumlah keseluruhan: RM2030.00");
    expect(message).not.toMatch(/kad pengenalan|passport|identity/i);
    const url = makeWhatsAppUrl("60123456789", message);
    expect(url).toMatch(/^https:\/\/wa\.me\/60123456789\?text=/);
    expect(decodeURIComponent(url.split("text=")[1]!)).toBe(message);
  });
});

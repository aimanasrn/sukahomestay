import { describe, expect, it } from "vitest";
import { checkAvailability } from "../services/availabilityService.js";

describe("checkAvailability", () => {
  it("blocks whole-house bookings when a homestay booking overlaps", () => {
    const result = checkAvailability({
      request: {
        bookingType: "whole_house",
        checkInDate: "2026-07-10",
        checkOutDate: "2026-07-12",
      },
      existingBookings: [
        {
          bookingType: "homestay",
          checkInDate: "2026-07-11",
          checkOutDate: "2026-07-13",
          status: "booked",
        },
      ],
    });

    expect(result.available).toBe(false);
    expect(result.reason).toBe("whole_house_conflict");
  });

  it("allows homestay when only another roomstay overlaps", () => {
    const result = checkAvailability({
      request: {
        bookingType: "homestay",
        checkInDate: "2026-07-10",
        checkOutDate: "2026-07-12",
      },
      existingBookings: [
        {
          bookingType: "roomstay",
          roomId: "room-1",
          checkInDate: "2026-07-10",
          checkOutDate: "2026-07-12",
          status: "booked",
        },
      ],
    });

    expect(result.available).toBe(true);
  });

  it("blocks roomstay when the same room already has a pending booking", () => {
    const result = checkAvailability({
      request: {
        bookingType: "roomstay",
        roomId: "room-2",
        checkInDate: "2026-07-10",
        checkOutDate: "2026-07-12",
      },
      existingBookings: [
        {
          bookingType: "roomstay",
          roomId: "room-2",
          checkInDate: "2026-07-11",
          checkOutDate: "2026-07-13",
          status: "pending",
        },
      ],
    });

    expect(result.available).toBe(false);
    expect(result.reason).toBe("roomstay_conflict");
  });

  it("ignores cancelled and rejected bookings", () => {
    const result = checkAvailability({
      request: {
        bookingType: "whole_house",
        checkInDate: "2026-07-10",
        checkOutDate: "2026-07-12",
      },
      existingBookings: [
        {
          bookingType: "homestay",
          checkInDate: "2026-07-10",
          checkOutDate: "2026-07-12",
          status: "cancelled",
        },
        {
          bookingType: "roomstay",
          roomId: "room-1",
          checkInDate: "2026-07-10",
          checkOutDate: "2026-07-12",
          status: "rejected",
        },
      ],
    });

    expect(result.available).toBe(true);
  });

  it("blocks dates when availability rules mark the stay as blocked", () => {
    const result = checkAvailability({
      request: {
        bookingType: "homestay",
        checkInDate: "2026-07-10",
        checkOutDate: "2026-07-12",
      },
      existingBookings: [],
      availabilityRules: [
        {
          bookingType: "homestay",
          date: "2026-07-11",
          status: "blocked",
        },
      ],
    });

    expect(result.available).toBe(false);
    expect(result.reason).toBe("homestay_rule_conflict");
  });
});

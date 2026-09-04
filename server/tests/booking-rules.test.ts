import { describe, expect, it } from "vitest";
import {
  calculateNights,
  calculatePrice,
  canCancel,
  rangesOverlap,
} from "../src/modules/bookings/booking-rules.js";

describe("booking rules", () => {
  it("counts nights and allows back-to-back stays", () => {
    expect(
      calculateNights(new Date("2026-09-03"), new Date("2026-09-06")),
    ).toBe(3);
    expect(
      rangesOverlap(
        { checkIn: new Date("2026-09-03"), checkOut: new Date("2026-09-06") },
        { checkIn: new Date("2026-09-06"), checkOut: new Date("2026-09-08") },
      ),
    ).toBe(false);
  });
  it("detects every true overlap shape", () => {
    const existing = {
      checkIn: new Date("2026-09-10"),
      checkOut: new Date("2026-09-15"),
    };
    expect(
      rangesOverlap(
        { checkIn: new Date("2026-09-09"), checkOut: new Date("2026-09-11") },
        existing,
      ),
    ).toBe(true);
    expect(
      rangesOverlap(
        { checkIn: new Date("2026-09-12"), checkOut: new Date("2026-09-16") },
        existing,
      ),
    ).toBe(true);
    expect(
      rangesOverlap(
        { checkIn: new Date("2026-09-11"), checkOut: new Date("2026-09-14") },
        existing,
      ),
    ).toBe(true);
  });
  it("calculates weekday, weekend, seasonal, cleaning and extra guest fees in sen", () => {
    const result = calculatePrice({
      checkIn: new Date("2026-09-03T00:00:00Z"),
      checkOut: new Date("2026-09-07T00:00:00Z"),
      guests: 6,
      includedGuests: 4,
      weekdayPriceSen: 40000,
      weekendPriceSen: 50000,
      cleaningFeeSen: 8000,
      extraGuestFeeSen: 3000,
      seasonalRates: [
        {
          startDate: new Date("2026-09-05T00:00:00Z"),
          endDate: new Date("2026-09-05T00:00:00Z"),
          nightlyPriceSen: 70000,
        },
      ],
    });
    expect(result.nights).toBe(4);
    expect(result.subtotalSen).toBe(200000);
    expect(result.extraGuestFeeSen).toBe(24000);
    expect(result.totalSen).toBe(232000);
  });
  it("enforces three-day cancellation window", () => {
    const now = new Date("2026-09-03T00:00:00Z");
    expect(canCancel("CONFIRMED", new Date("2026-09-06T00:00:00Z"), now)).toBe(
      true,
    );
    expect(canCancel("CONFIRMED", new Date("2026-09-05T00:00:00Z"), now)).toBe(
      false,
    );
    expect(canCancel("CANCELLED", new Date("2026-09-20T00:00:00Z"), now)).toBe(
      false,
    );
  });
});

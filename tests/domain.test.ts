import { describe, it, expect } from "vitest";
import {
  calculateQuote,
  overlaps,
  canonicalPackage,
  whatsappMessage,
  type Booking,
} from "../src/domain";
import { demoCatalog } from "../src/data";
describe("inventory and pricing", () => {
  it("keeps whole house on the four component resources", () =>
    expect(canonicalPackage(["ROOM_C", "MAIN", "ROOM_A", "ROOM_B"])).toBe(
      "WHOLE",
    ));
  it("allows same day turnover", () =>
    expect(
      overlaps("2027-01-01", "2027-01-03", "2027-01-03", "2027-01-05"),
    ).toBe(false));
  it("whole house overrides summed add-ons", () => {
    const q = calculateQuote(
      {
        check_in: "2027-01-01",
        check_out: "2027-01-03",
        resources: ["MAIN", "ROOM_A", "ROOM_B", "ROOM_C"],
      },
      demoCatalog,
    );
    expect(q.total_sen).toBe(160000);
    expect(q.bedrooms).toBe(7);
    expect(q.bathrooms).toBe(6);
  });
  it("date rules precede weekend and add-on rates; fee applied once", () => {
    const c = structuredClone(demoCatalog);
    c.settings.cleaning_fee = 1000;
    c.settings.deposit_percent = 25;
    c.accommodations[1].weekend_rate = 19000;
    c.rate_rules = [
      {
        id: "test",
        package_id: "ROOM_A",
        start_date: "2027-01-02",
        end_date: "2027-01-03",
        nightly_sen: 20000,
      },
    ];
    const q = calculateQuote(
      {
        check_in: "2027-01-02",
        check_out: "2027-01-04",
        resources: ["MAIN", "ROOM_A"],
      },
      c,
    );
    expect(q.total_sen).toBe(130000);
    expect(q.deposit_sen).toBe(32500);
  });
  it("rejects invalid inventory selections", () =>
    expect(() =>
      calculateQuote(
        {
          check_in: "2027-01-01",
          check_out: "2027-01-02",
          resources: ["ROOM_A", "ROOM_B"],
        },
        demoCatalog,
      ),
    ).toThrow("INVALID_RESOURCES"));
  it("WhatsApp languages use saved snapshot, not new catalog prices", () => {
    const b = {
      reference: "SK-TEST",
      name: "Test Guest",
      phone: "0123456789",
      check_in: "2027-01-01",
      check_out: "2027-01-03",
      resources: ["MAIN", "ROOM_B"],
      adults: 2,
      children: 1,
      special_requests: "Test request",
      quote: calculateQuote(
        {
          check_in: "2027-01-01",
          check_out: "2027-01-03",
          resources: ["MAIN", "ROOM_B"],
        },
        demoCatalog,
      ),
    } as Booking;
    const bm = whatsappMessage(b, "ms"),
      en = whatsappMessage(b, "en");
    expect(bm).toContain("Rujukan: SK-TEST");
    expect(en).toContain("Reference: SK-TEST");
    expect(bm).toContain("5 bilik tidur · 4 bilik air");
    expect(en).toContain("5 bedrooms · 4 bathrooms");
    expect(en).toContain("Test request");
    expect(en).toContain("1,140");
  });
});

import { describe, expect, it } from "vitest";
import { monthDays, monthStart, nightState, rangeError } from "../src/calendar";
import {
  malaysiaDate,
  selectedResources,
  type Allocation,
} from "../src/domain";
const rows = [
  {
    resource_id: "ROOM_A",
    check_in: "2026-10-12",
    check_out: "2026-10-15",
    state: "unavailable",
  },
  {
    resource_id: "MAIN",
    check_in: "2026-10-20",
    check_out: "2026-10-22",
    state: "pending",
    expires_at: "2099-01-01T00:00:00Z",
  },
] as Allocation[];
describe("availability calendar", () => {
  it("MAIN leaves roomstays free; Whole House blocks every unit", () => {
    const main = [{ ...rows[0], resource_id: "MAIN" }] as Allocation[];
    expect(nightState("2026-10-13", ["MAIN"], main)).toBe("unavailable");
    expect(nightState("2026-10-13", ["ROOM_A", "ROOM_B"], main)).toBe(
      "available",
    );
    expect(nightState("2026-10-13", selectedResources("WHOLE"), main)).toBe(
      "unavailable",
    );
    const whole = selectedResources("WHOLE").map((resource_id) => ({
      ...rows[0],
      resource_id,
    }));
    for (const resource of selectedResources("WHOLE")) {
      expect(nightState("2026-10-13", [resource], whole)).toBe("unavailable");
    }
  });
  it("uses Malaysia midnight regardless of machine timezone", () => {
    expect(malaysiaDate(new Date("2026-10-01T15:59:59Z"))).toBe("2026-10-01");
    expect(malaysiaDate(new Date("2026-10-01T16:00:00Z"))).toBe("2026-10-02");
  });
  it("checks each selected inventory resource", () => {
    expect(nightState("2026-10-13", ["MAIN"], rows)).toBe("available");
    expect(nightState("2026-10-13", ["ROOM_A"], rows)).toBe("unavailable");
    expect(nightState("2026-10-13", ["MAIN", "ROOM_A"], rows)).toBe(
      "unavailable",
    );
    expect(nightState("2026-10-13", selectedResources("WHOLE"), rows)).toBe(
      "unavailable",
    );
    expect(nightState("2026-10-20", ["ROOM_B"], rows)).toBe("available");
    expect(nightState("2026-10-20", ["MAIN"], rows)).toBe("pending");
  });
  it("accepts checkout at a booked night and rejects crossing it", () => {
    expect(
      rangeError("2026-10-10", "2026-10-12", ["ROOM_A"], rows, "2026-10-01"),
    ).toBe("");
    expect(
      rangeError("2026-10-10", "2026-10-16", ["ROOM_A"], rows, "2026-10-01"),
    ).toBe("RANGE_BLOCKED");
    expect(
      rangeError("2026-10-15", "2026-10-16", ["ROOM_A"], rows, "2026-10-01"),
    ).toBe("");
  });
  it("ignores expired pending holds immediately", () => {
    const expired = [{ ...rows[1], expires_at: "2020-01-01T00:00:00Z" }];
    expect(nightState("2026-10-20", ["MAIN"], expired)).toBe("available");
    expect(
      rangeError("2026-10-20", "2026-10-22", ["MAIN"], expired, "2026-10-01"),
    ).toBe("");
  });
  it("rejects incomplete, past, reversed, same-day and overlong stays", () => {
    for (const [ci, co] of [
      ["", ""],
      ["2026-09-30", "2026-10-02"],
      ["2026-10-02", "2026-10-01"],
      ["2026-10-02", "2026-10-02"],
      ["2026-10-01", "2027-01-01"],
    ])
      expect(rangeError(ci, co, ["MAIN"], [], "2026-10-01")).toBe(
        "INVALID_DATES",
      );
  });
  it("navigates across year and leap-month boundaries", () => {
    expect(monthStart("2026-12-15", 1)).toBe("2027-01-01");
    expect(monthDays("2028-02-01")).toHaveLength(29);
  });
});

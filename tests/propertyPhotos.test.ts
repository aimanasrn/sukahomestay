import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { demoCatalog } from "../src/data";
import {
  interleavePhotos,
  propertyPhotos,
  withPropertyPhotos,
} from "../src/propertyPhotos";

describe("owner photo galleries", () => {
  it("includes every supplied photo in its correct unit and in Whole House", () => {
    expect(propertyPhotos.MAIN).toHaveLength(23);
    expect(propertyPhotos.ROOM_A).toHaveLength(10);
    expect(propertyPhotos.ROOM_B).toHaveLength(8);
    expect(propertyPhotos.ROOM_C).toHaveLength(7);
    expect(propertyPhotos.WHOLE).toHaveLength(48);
    for (const url of propertyPhotos.WHOLE) {
      expect(existsSync(`public${url}`), url).toBe(true);
    }
    expect(
      propertyPhotos.ROOM_A.every((url) => url.includes("roomstay-1/")),
    ).toBe(true);
    expect(
      propertyPhotos.ROOM_B.every((url) => url.includes("roomstay-2/")),
    ).toBe(true);
    expect(
      propertyPhotos.ROOM_C.every((url) => url.includes("roomstay-3/")),
    ).toBe(true);
  });

  it("fills empty live/cached galleries without overwriting admin photos or settings", () => {
    const source = structuredClone(demoCatalog);
    source.accommodations.forEach((a) => {
      a.photos = [];
    });
    source.accommodations[0].photos = ["https://example.com/admin-main.jpg"];
    source.accommodations[0].rate = 12345;
    const result = withPropertyPhotos(source);
    expect(result.accommodations[0].photos).toEqual(
      source.accommodations[0].photos,
    );
    expect(result.accommodations[0].rate).toBe(12345);
    expect(result.settings).toEqual(source.settings);
    expect(
      result.accommodations.find((a) => a.id === "ROOM_A")?.photos,
    ).toEqual(propertyPhotos.ROOM_A);
    expect(
      result.accommodations.find((a) => a.id === "WHOLE")?.photos,
    ).toContain("https://example.com/admin-main.jpg");
    expect(source.accommodations[1].photos).toEqual([]);
    source.accommodations.find((a) => a.id === "WHOLE")!.photos = [
      "https://example.com/whole.jpg",
    ];
    expect(
      withPropertyPhotos(source).accommodations.find((a) => a.id === "WHOLE")
        ?.photos,
    ).toEqual(["https://example.com/whole.jpg"]);
  });

  it("spreads homepage selections across units and removes duplicates", () => {
    expect(
      interleavePhotos([
        ["main", "kitchen"],
        ["room1"],
        ["room2"],
        ["room3", "main"],
      ]),
    ).toEqual(["main", "room1", "room2", "room3", "kitchen"]);
    expect(interleavePhotos([])).toEqual([]);
  });
});

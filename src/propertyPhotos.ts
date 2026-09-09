import type { Catalog, PackageId } from "./domain";

// Owner-supplied photos, September 2026. First photo is the cover.
function gallery(folder: string, first: number, last: number, cover: number) {
  return [
    cover,
    ...Array.from({ length: last - first + 1 }, (_, i) => first + i).filter(
      (number) => number !== cover,
    ),
  ].map((number) => `/photos/${folder}/img_${number}.webp`);
}

const main = gallery("homestay-utama", 7865, 7887, 7877);
const room1 = gallery("roomstay-1", 7893, 7902, 7900);
const room2 = gallery("roomstay-2", 7903, 7910, 7908);
const room3 = gallery("roomstay-3", 7911, 7917, 7912);

// Interleave galleries so every unit is represented before additional angles.
export function interleavePhotos(galleries: string[][]): string[] {
  const length = Math.max(0, ...galleries.map((photos) => photos.length));
  return [
    ...new Set(
      Array.from({ length }, (_, i) =>
        galleries.flatMap((photos) => (photos[i] ? [photos[i]] : [])),
      ).flat(),
    ),
  ];
}

export const propertyPhotos: Record<PackageId, string[]> = {
  MAIN: main,
  ROOM_A: room1,
  ROOM_B: room2,
  ROOM_C: room3,
  WHOLE: interleavePhotos([main, room1, room2, room3]),
};

// Keep admin-managed galleries when present. Empty live or cached demo
// galleries use the bundled owner photos without changing rates or settings.
export function withPropertyPhotos(catalog: Catalog): Catalog {
  const accommodations = catalog.accommodations.map((a) => ({
    ...a,
    photos: a.photos.length ? [...a.photos] : [...propertyPhotos[a.id]],
  }));
  const whole = accommodations.find((a) => a.id === "WHOLE");
  if (
    whole &&
    !catalog.accommodations.find((a) => a.id === "WHOLE")?.photos.length
  ) {
    whole.photos = interleavePhotos(
      accommodations.filter((a) => a.id !== "WHOLE").map((a) => a.photos),
    );
  }
  return { ...catalog, accommodations };
}

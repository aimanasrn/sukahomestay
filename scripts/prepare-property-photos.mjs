// Usage: node scripts/prepare-property-photos.mjs <extracted-folder-root>
// Each source folder contains the original JPGs supplied by the owner.
import sharp from "sharp";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.argv[2];
if (!root) throw new Error("Provide the extracted photo folder root.");
let inputBytes = 0,
  outputBytes = 0,
  count = 0;
for (const [source, destination] of [
  ["Homestay", "homestay-utama"],
  ["Roomstay 1", "roomstay-1"],
  ["Roomstay 2", "roomstay-2"],
  ["Roomstay 3", "roomstay-3"],
]) {
  const output = path.resolve("public/photos", destination);
  await mkdir(output, { recursive: true });
  const files = (await readdir(path.join(root, source)))
    .filter((file) => /^IMG_\d+\.JPG$/i.test(file))
    .sort();
  for (const file of files) {
    const input = path.join(root, source, file);
    const target = path.join(
      output,
      file.replace(/\.jpg$/i, ".webp").toLowerCase(),
    );
    // Honor camera orientation; preserve framing and avoid upscaling.
    const result = await sharp(input)
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 84, effort: 6 })
      .toFile(target);
    inputBytes += (await stat(input)).size;
    outputBytes += result.size;
    count++;
  }
}
console.log(JSON.stringify({ count, inputBytes, outputBytes }));

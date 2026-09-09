import { test, expect } from "@playwright/test";

test("owner galleries load and allow browsing every unit", async ({ page }) => {
  for (const [id, count, folder] of [
    ["MAIN", 23, "homestay-utama"],
    ["ROOM_A", 10, "roomstay-1"],
    ["ROOM_B", 8, "roomstay-2"],
    ["ROOM_C", 7, "roomstay-3"],
    ["WHOLE", 48, "homestay-utama"],
  ] as const) {
    await page.goto(`/stay/${id}`);
    await page.getByRole("button", { name: "EN", exact: true }).click();
    const cover = page.locator(".detail-hero img");
    await expect(cover).toHaveAttribute(
      "src",
      new RegExp(`/photos/${folder}/`),
    );
    await expect
      .poll(() => cover.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    await expect(page.locator(".detail-photo-thumb")).toHaveCount(count - 1);
    await expect(page.locator(".detail-hero .photo-caption")).toHaveCount(0);
    await page.locator(".detail-hero-button").click();
    await expect(page.locator(".stay-gallery-controls")).toContainText(
      `1 / ${count}`,
    );
    await page.locator(".stay-gallery-controls button").last().click();
    await expect(page.locator(".stay-gallery-controls")).toContainText(
      `2 / ${count}`,
    );
    await expect
      .poll(() =>
        page
          .locator(".stay-lightbox img")
          .evaluate((img: HTMLImageElement) => img.naturalWidth),
      )
      .toBeGreaterThan(0);
    await page.keyboard.press("Escape");
    await expect(page.locator(".stay-lightbox")).toHaveCount(0);
  }
});

test("mobile branding and gallery do not overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/stay/ROOM_A");
  await expect(page.locator("header .logo")).toHaveAttribute(
    "aria-label",
    "Suka Room&Homestay",
  );
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  await page.locator(".detail-photo-thumb").first().click();
  await expect(page.locator(".stay-gallery-controls")).toContainText("2 / 10");
  await expect
    .poll(() =>
      page
        .locator(".stay-lightbox img")
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
});

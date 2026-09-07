import { test, expect } from "@playwright/test";
test("bilingual demo booking, inventory availability, and admin payment workflow", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Satu rumah",
  );
  await page
    .getByRole("button", { name: "Semak Ketersediaan", exact: true })
    .click();
  await page.getByRole("button", { name: "Teruskan", exact: true }).click();
  await page.getByRole("button", { name: "Teruskan", exact: true }).click();
  await page.getByRole("button", { name: /Roomstay B 1 bilik/ }).click();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Roomstay B 1 bedroom/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("complementary")).toContainText("1,140");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Full name", exact: true })
    .fill("Automated Demo Guest");
  await page
    .getByRole("textbox", { name: "Phone number", exact: true })
    .fill("0123456789");
  await page.getByRole("button", { name: "BM", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Nama penuh" })).toHaveValue(
    "Automated Demo Guest",
  );
  await page.getByRole("button", { name: "Teruskan", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Hantar Permintaan Tempahan" }),
  ).toBeDisabled();
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Hantar Permintaan Tempahan" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Kenangan baharu",
  );
  await expect(page.getByText(/Permintaan demo disimpan/)).toBeVisible();
  await page.getByRole("link", { name: "Admin", exact: true }).click();
  await page.getByRole("button", { name: "Buka papan pemuka demo" }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "Automated Demo Guest" }),
  ).toContainText("Menunggu");
  await page.getByRole("button", { name: "Maklumat", exact: true }).click();
  await page
    .getByRole("button", { name: "Sahkan tempahan", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Rekod deposit");
  await page
    .getByRole("spinbutton", { name: "Jumlah (RM)", exact: true })
    .fill("1140");
  await page
    .getByRole("textbox", { name: "Rujukan bayaran" })
    .fill("TEST-ONLY");
  await page
    .getByRole("button", { name: "Rekod bayaran", exact: true })
    .click();
  await page.getByRole("button", { name: "Maklumat", exact: true }).click();
  await page
    .getByRole("button", { name: "Sahkan tempahan", exact: true })
    .click();
  await expect(
    page.getByRole("row").filter({ hasText: "Automated Demo Guest" }),
  ).toContainText("Disahkan");
});
test("mobile homepage has no horizontal overflow and exposes all search fields", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("spinbutton", { name: "Tetamu", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(
    page
      .getByRole("navigation")
      .getByRole("link", { name: "Galeri", exact: true }),
  ).toBeVisible();
});

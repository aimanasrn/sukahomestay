import { test, expect } from "@playwright/test";
test("multiple roomstays and WhatsApp enquiry retain the selected details", async ({
  page,
}) => {
  await page.goto("/book");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  const units = page.locator(".calendar-accommodations");
  await units.getByRole("button", { name: /Roomstay 1/ }).click();
  await units.getByRole("button", { name: /Homestay Utama/ }).click();
  await units.getByRole("button", { name: /Roomstay 2/ }).click();
  await expect(
    units.getByRole("button", { name: /Roomstay 1/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    units.getByRole("button", { name: /Roomstay 2/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    units.getByRole("button", { name: /Homestay Utama/ }),
  ).toHaveAttribute("aria-pressed", "false");
  const days = page.locator(".range-day[aria-disabled='false']");
  await expect(days.first()).toBeEnabled();
  const firstDate = await days.first().getAttribute("data-date");
  const checkout = new Date(`${firstDate}T12:00:00Z`);
  checkout.setUTCDate(checkout.getUTCDate() + 2);
  await days.first().click();
  await page
    .locator(`[data-date='${checkout.toISOString().slice(0, 10)}']`)
    .click();
  await expect(page.locator(".calendar-summary")).toContainText("600");
  await page
    .getByRole("button", { name: "Continue Booking", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Full name", exact: true })
    .fill("Roomstay Test Guest");
  const href = await page.locator("a.whatsapp-float").getAttribute("href");
  expect(href).toContain("https://wa.me/60139498048?");
  const message = new URL(href!).searchParams.get("text");
  expect(message).toContain("Roomstay 1 + Roomstay 2");
  expect(message).toContain("Roomstay Test Guest");
  expect(message).toContain("Check-in:");
  await page
    .getByRole("textbox", { name: "Phone number", exact: true })
    .fill("0123456789");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Send booking request", exact: true })
    .click();
  await expect(page.locator(".success-details")).toContainText(
    "Roomstay 1 + Roomstay 2",
  );
  const savedLink = await page
    .locator(".success-actions a")
    .getAttribute("href");
  expect(new URL(savedLink!).searchParams.get("text")).toContain(
    "Reference: DEMO-",
  );
});
test("bilingual demo booking, inventory availability, and admin payment workflow", async ({
  page,
}) => {
  await page.goto("/");
  const toDateInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 7);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 2);
  await page
    .getByRole("textbox", { name: "Tarikh masuk", exact: true })
    .fill(toDateInput(checkIn));
  await page
    .getByRole("textbox", { name: "Tarikh keluar", exact: true })
    .fill(toDateInput(checkOut));
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Satu rumah",
  );
  await page
    .getByRole("button", { name: "Semak Ketersediaan", exact: true })
    .click();
  await page
    .getByRole("checkbox", { name: "Roomstay 2 Tersedia", exact: true })
    .check();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: "Roomstay 2 Available", exact: true }),
  ).toBeChecked();
  await expect(page.locator(".calendar-summary")).toContainText("1,140");
  await page
    .getByRole("button", { name: "Continue Booking", exact: true })
    .click();
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
  // Recording payment refreshes this modal in place; it no longer closes.
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("1,140");
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

import { test, expect } from "@playwright/test";

test("customer can search and open a property", async ({ page }) => {
  await page.route("**/rest/v1/properties*", (route) => route.fulfill({ status:200, contentType:"application/json", json:{ id:"11111111-1111-4111-8111-111111111111",name:"Alam Villa Langkawi",slug:"alam-villa-langkawi",description:"A serene timber villa.",address:"18 Jalan Pantai Tengah",city:"Langkawi",state:"Kedah",max_guests:8,bedrooms:3,bathrooms:3,base_price_sen:62000,cleaning_fee_sen:9000,security_deposit_sen:30000,check_in_time:"15:00",check_out_time:"11:00",house_rules:"No smoking.",cancellation_policy:"Three days notice.",status:"PUBLISHED",property_images:[{id:"i1",storage_path:"/assets/alam-villa-hero.png",alt:"Villa",sort_order:0}],property_amenities:[],rooms:[] } }));
  await page.goto("/");
  await page.getByRole("button", { name: "Search stays" }).click();
  await expect(page).toHaveURL(/search/);
  await page.getByRole("link", { name: /Alam Villa Langkawi/ }).first().click();
  await expect(page).toHaveURL(/properties\/alam-villa-langkawi/);
  await expect(page.getByRole("heading", { name: "Alam Villa Langkawi" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Check availability" })).toBeVisible();
});

test("anonymous visitors cannot open the admin workspace", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/login/);
  await expect(page.getByRole("heading", { name: "Good to have you back." })).toBeVisible();
});

test("reservation is saved before WhatsApp opens and success state is shown", async ({ page }) => {
  await page.addInitScript(() => { window.open = ((url?: string | URL) => { sessionStorage.setItem("opened-whatsapp", String(url)); return null; }) as typeof window.open; });
  await page.route("**/api/v1/bookings/quote", (route) => route.fulfill({ json: { success: true, message: "ok", data: { nights: 3, subtotalSen: 186000, cleaningFeeSen: 9000, extraGuestFeeSen: 0, totalSen: 195000 } } }));
  await page.route("**/api/v1/bookings/reserve", async (route) => route.fulfill({ status: 201, json: { success: true, message: "saved", data: { booking: { id: "b1", reference: "SUKA-20260904-A8K2", status: "PENDING_APPROVAL", checkIn: "2026-09-18", checkOut: "2026-09-21", adultCount: 4, childCount: 0, guestCount: 4, subtotalSen: 186000, cleaningFeeSen: 9000, extraGuestFeeSen: 0, totalSen: 195000, property: { name: "Alam Villa Langkawi" }, items: [], payments: [] }, whatsappUrl: "https://wa.me/60123456789?text=saved" } } }));
  await page.goto("/checkout?property=11111111-1111-4111-8111-111111111111&slug=alam-villa-langkawi&checkIn=2026-09-18&checkOut=2026-09-21&guests=4");
  await page.getByLabel("Full name").fill("Aiman Zulkifli"); await page.getByLabel("Email address").fill("aiman@example.com"); await page.getByLabel("Phone number").fill("0123456789");
  await page.getByLabel(/house rules/i).check(); await page.getByLabel(/cancellation policy/i).check(); await page.getByLabel(/privacy policy/i).check();
  await page.getByRole("button", { name: "Reserve via WhatsApp" }).click();
  await expect(page).toHaveURL(/reservation-success\/SUKA-20260904-A8K2/);
  await expect(page.getByText("Reservation received")).toBeVisible();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("opened-whatsapp"))).toContain("https://wa.me/");
});

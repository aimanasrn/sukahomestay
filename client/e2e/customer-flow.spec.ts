import { test, expect } from '@playwright/test';
test('customer can search and open a property',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'Search stays'}).click();await expect(page).toHaveURL(/search/);await page.getByRole('link',{name:/Alam Villa Langkawi/}).first().click();await expect(page.getByRole('heading',{name:'Alam Villa Langkawi'})).toBeVisible();await expect(page.getByRole('link',{name:'Check availability'})).toBeVisible()});
test('admin dashboard is responsive and shows operational data',async({page})=>{await page.goto('/admin');await expect(page.getByRole('heading',{name:/Good morning/})).toBeVisible();await expect(page.getByText('Revenue overview')).toBeVisible();await expect(page.getByText('Upcoming stays')).toBeVisible()});
test('reservation is saved before WhatsApp opens and success state is shown',async({page})=>{
  await page.addInitScript(()=>{window.open=((url?:string|URL)=>{sessionStorage.setItem('opened-whatsapp',String(url));return null}) as typeof window.open});
  await page.route('**/api/v1/bookings/quote',route=>route.fulfill({json:{success:true,message:'ok',data:{nights:3,subtotalSen:186000,cleaningFeeSen:9000,extraGuestFeeSen:0,totalSen:195000}}}));
  await page.route('**/api/v1/bookings/reserve',async route=>{
    const request=route.request();
    expect(request.method()).toBe('POST');
    await route.fulfill({status:201,json:{success:true,message:'saved',data:{whatsappUrl:'https://wa.me/60123456789?text=saved',booking:{id:'booking-1',reference:'SUKA-20260904-A8K2',userId:null,status:'PENDING_APPROVAL',checkIn:'2026-09-18',checkOut:'2026-09-21',guestCount:5,adultCount:4,childCount:1,totalSen:195000,subtotalSen:186000,cleaningFeeSen:9000,extraGuestFeeSen:0,expiresAt:'2026-09-04T12:00:00+08:00',property:{name:'Alam Villa Langkawi'},items:[],payments:[]}}}});
  });
  await page.goto('/checkout?property=11111111-1111-4111-8111-111111111111');
  for(const name of ['I agree to the house rules.','I agree to the cancellation policy.','I agree to the privacy policy.']) await page.getByRole('checkbox',{name}).check();
  await page.getByRole('button',{name:'Reserve via WhatsApp'}).click();
  await expect(page).toHaveURL(/reservation-success\/SUKA-20260904-A8K2/);
  await expect(page.getByRole('heading',{name:'Pending admin approval'})).toBeVisible();
  expect(await page.evaluate(()=>sessionStorage.getItem('opened-whatsapp'))).toContain('wa.me/60123456789');
});

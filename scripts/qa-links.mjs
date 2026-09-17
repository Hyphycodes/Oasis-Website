import { chromium } from '@playwright/test';
const browser=await chromium.launch();
const page=await browser.newPage();
const urls=[
'https://tables.toasttab.com/restaurants/43040713-bf74-449f-bd19-00594dd956fa/findTime',
'https://oasismexicanlockport.toast.site/order',
'https://www.oasismexicankitchenbar.com/event-details/oasis-fridays-2026-09-18-22-00',
'https://www.oasismexicankitchenbar.com/event-details/oasis-latin-saturdays-2026-09-19-22-00',
'https://www.tickeri.com/events/nwn48quznb96/junior-h-paint-sip',
'https://www.instagram.com/oasismexbar/',
'https://www.tiktok.com/@oasislockport',
'https://www.facebook.com/profile.php?id=61582541071820'];
for (const url of urls) {
 try {const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000});console.log(JSON.stringify({url,status:response.status(),title:await page.title(),text:(await page.locator('body').innerText()).slice(0,850)}));}
 catch(error){console.log(JSON.stringify({url,error:error.message.slice(0,120)}));}
}
await browser.close();

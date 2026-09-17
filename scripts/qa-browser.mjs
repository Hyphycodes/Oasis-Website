import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const origin = process.env.QA_URL || 'http://127.0.0.1:3000';
const out = process.env.QA_OUTPUT || '/tmp/oasis-browser-qa';
const mutate = process.env.QA_MUTATE === 'true';
if (mutate && !/^http:\/\/(127\.0\.0\.1|localhost):/.test(origin)) throw Error('Mutation checks are local only.');
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
const errors=[]; const results=[];
const qaName = `QA website verification ${Date.now()}`;
page.on('pageerror',error=>errors.push(error.message));
const routes=['/','/menu','/events','/events/oasis-fridays','/events/oasis-latin-saturdays','/events/snoopy-paint-sip-night','/catering','/private-events','/visit','/careers','/legal/privacy'];
try {
  for (const width of (process.env.QA_WORKFLOWS_ONLY ? [] : [1440,360,390,430])) {
    await page.setViewportSize({width,height:900});
    for (const route of routes) {
      const response=await page.goto(origin+route, {waitUntil:'networkidle'});
      expect(response.status(),route).toBe(200);
      await expect(page.locator('main h1')).toHaveCount(1);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
      expect(overflow,`${width} ${route} overflow`).toBe(false);
      const canonical=await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBeTruthy();
      await page.screenshot({path:`${out}/${width}-${route.replaceAll('/','_')||'home'}.png`,fullPage:true});
      results.push({width,route,status:response.status(),overflow,canonical});
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(origin+'/menu#cocktails');
  await expect(page.getByRole('tab',{name:'Cocktails & Bar'})).toHaveAttribute('aria-selected','true');
  await page.getByRole('tab',{name:'Cocktails & Bar'}).press('ArrowRight');
  await expect(page.getByRole('tab',{name:'Brunch',exact:true})).toHaveAttribute('aria-selected','true');
  await page.goto(origin+'/menu#%E0%A4%A');
  await expect(page.getByRole('tab',{name:'Food',exact:true})).toHaveAttribute('aria-selected','true');
  await page.getByRole('button',{name:'Open menu',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Open menu',exact:true})).toBeFocused();
  for(const [legacy,destination] of [['/menus','/menu'],['/menu/brunch','/menu#brunch'],['/event-list','/events'],['/join-our-team','/careers']]){
    await page.goto(origin+legacy);expect(page.url()).toBe(origin+destination);
  }
  expect((await page.goto(origin+'/does-not-exist')).status()).toBe(404);
  if(mutate) {
    await page.setViewportSize({width:390,height:844});
    for(const [route,submit] of [['/catering','Send catering enquiry'],['/private-events','Send event enquiry']]){
      await page.goto(origin+route);
      await page.getByRole('button',{name:submit,exact:true}).click();
      await expect(page.locator('main [role="alert"]')).toContainText('highlighted fields');
      await page.locator('input[name="name"]').fill(qaName);
      await page.locator('input[name="email"]').fill('qa@example.com');
      await page.locator('input[name="phone"]').fill('8155550100');
      await page.locator('input[name="date"]').fill('2026-12-20');
      await page.locator('input[name="guests"]').fill('20');
      if(route==='/catering') await page.locator('select[name="fulfillment"]').selectOption('pickup');
      else {await page.locator('select[name="eventType"]').selectOption({label:'Birthday'});await page.locator('select[name="contactPreference"]').selectOption('email');}
      await page.getByRole('button',{name:submit,exact:true}).click();
      await expect(page.getByRole('status')).toContainText('we have your message');
    }
    await page.goto(origin+'/admin/login');
    await page.getByRole('button',{name:/Sam \(Owner\)/}).click();
    await expect(page).toHaveURL(origin+'/admin');
    await page.goto(origin+'/admin/inquiries');
    await expect(page.locator('main li').filter({hasText:qaName})).toHaveCount(2);
    for(const route of ['/admin/menu','/admin/events','/admin/events?tab=drafts','/admin/media','/admin/settings','/admin/website','/admin/team','/admin/theme']){
      const response=await page.goto(origin+route,{waitUntil:'networkidle'});expect(response.status()).toBe(200);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),route).toBe(false);
    }
    await page.goto(origin+'/admin/menu?menu=brunch');
    await page.locator('input[name="name"]').last().fill('QA Brunch');
    await page.getByRole('button',{name:'Add category',exact:true}).click();
    await expect(page.locator('summary').filter({hasText:'QA Brunch'})).toBeVisible();
    await page.goto(origin+'/admin/events?new=1');
    await page.locator('#one-title').fill('QA unpublished event');
    await page.locator('#one-date').fill('2026-12-20');
    await page.locator('#one-start').fill('19:00');
    await page.locator('#one-end').fill('22:00');
    await page.getByRole('button',{name:/Save.*later|Save.*draft/i}).click();
    await page.goto(origin+'/admin/events?tab=drafts');
    await expect(page.getByText('QA unpublished event',{exact:true})).toBeVisible();
  }
  expect(errors).toEqual([]);
} finally {
  await writeFile(`${out}/report.json`,JSON.stringify({origin,results,errors},null,2));
  await browser.close();
}
console.log(JSON.stringify({origin,pages:results.length,errors,output:out}));

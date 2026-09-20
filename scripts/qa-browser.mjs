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
const routes=['/','/menu','/events','/events/oasis-fridays','/events/oasis-latin-saturdays','/events/snoopy-paint-sip-night','/catering','/private-events','/visit','/contact','/careers','/talent','/legal/privacy'];
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
  // Two menus since the brunch tab was retired, so ArrowRight wraps round.
  await page.getByRole('tab',{name:'Cocktails & Bar'}).press('ArrowRight');
  await expect(page.getByRole('tab',{name:'Food',exact:true})).toHaveAttribute('aria-selected','true');
  await page.goto(origin+'/menu#%E0%A4%A');
  await expect(page.getByRole('tab',{name:'Food',exact:true})).toHaveAttribute('aria-selected','true');
  await page.getByRole('button',{name:'Open menu',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Open menu',exact:true})).toBeFocused();
  // The directions chooser: one control, three real deep links, closed by Escape.
  await page.goto(origin+'/contact');
  const directions=page.getByRole('button',{name:/Get directions/});
  await expect(directions).toHaveAttribute('aria-expanded','false');
  await directions.click();
  const maps=page.getByRole('group',{name:/Open directions to/});
  await expect(maps).toBeVisible();
  for(const [name,pattern] of [['Google Maps',/^https:\/\/www\.google\.com\/maps\/dir/],['Apple Maps',/^https:\/\/maps\.apple\.com\//],['Waze',/^https:\/\/www\.waze\.com\/ul/]]){
    await expect(maps.getByRole('link',{name:new RegExp(name)})).toHaveAttribute('href',pattern);
  }
  await page.keyboard.press('Escape');
  await expect(maps).toHaveCount(0);
  await expect(directions).toBeFocused();

  for(const [legacy,destination] of [['/menus','/menu'],['/menu/brunch','/menu'],['/event-list','/events'],['/join-our-team','/careers']]){
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
    // Somebody applies for a job, and somebody shows us their work.
    await page.goto(origin+'/careers');
    await page.getByRole('button',{name:'Send application',exact:true}).click();
    await expect(page.locator('main [role="alert"]')).toContainText('highlighted fields');
    await page.locator('input[name="name"]').fill(qaName);
    await page.locator('input[name="phone"]').fill('8155550100');
    await page.locator('input[name="email"]').fill('qa@example.com');
    await page.locator('textarea[name="availability"]').fill('Weeknights and weekends');
    // The role chooser only exists while something is switched on.
    const role=page.locator('select[name="openingId"]');
    if(await role.count()) await role.selectOption('open');
    await page.getByRole('button',{name:'Send application',exact:true}).click();
    await expect(page.getByRole('status')).toContainText('thanks for putting your name in');

    await page.goto(origin+'/talent');
    await page.getByRole('button',{name:'Send it over',exact:true}).click();
    await expect(page.locator('main [role="alert"]')).toContainText('highlighted fields');
    await page.locator('input[name="name"]').fill(qaName);
    await page.locator('select[name="discipline"]').selectOption('dj');
    await page.locator('textarea[name="pitch"]').fill('Open-format Latin sets.');
    await page.locator('textarea[name="links"]').fill('instagram.com/qa\njavascript:alert(1)');
    await page.getByRole('button',{name:'Send it over',exact:true}).click();
    // Neither an email nor a phone number: the one thing this form insists on.
    await expect(page.locator('main [role="alert"]')).toContainText('highlighted fields');
    await page.locator('input[name="phone"]').fill('8155550142');
    await page.getByRole('button',{name:'Send it over',exact:true}).click();
    await expect(page.getByRole('status')).toContainText('We got it');

    // The development sign-in, when there is one. With ADMIN_REQUIRE_SIGN_IN
    // off the admin is already open and the login page offers no roles.
    await page.goto(origin+'/admin/login');
    const asOwner=page.getByRole('button',{name:/Sam \(Owner\)/});
    if(await asOwner.count()) await asOwner.click();
    await page.goto(origin+'/admin');
    await expect(page).toHaveURL(origin+'/admin');
    await page.goto(origin+'/admin/inquiries');
    await expect(page.locator('main li').filter({hasText:qaName})).toHaveCount(2);
    await page.goto(origin+'/admin/hiring');
    await expect(page.locator('main li').filter({hasText:qaName})).toHaveCount(1);
    await page.goto(origin+'/admin/talent');
    await expect(page.locator('main li').filter({hasText:qaName})).toHaveCount(1);
    // Only real websites survive the link parser; the rest never reaches a
    // member of staff's cursor.
    await page.locator('main a[href^="/admin/talent/"]').filter({hasText:qaName}).first().click();
    await page.waitForURL(/\/admin\/talent\/[0-9a-f-]+$/);
    await expect(page.getByRole('link',{name:/Instagram @qa/})).toHaveAttribute('href','https://instagram.com/qa');
    await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);

    for(const route of ['/admin/menu','/admin/events','/admin/events?tab=drafts','/admin/media','/admin/settings','/admin/website','/admin/team','/admin/theme','/admin/hiring','/admin/hiring/openings','/admin/talent']){
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

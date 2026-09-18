/**
 * Screenshots for docs/runbook.md, taken from a dev server with the local
 * database, signed in as the local owner.
 *
 *   QA_URL=http://localhost:3000 node scripts/generate-runbook-shots.mjs
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const origin = process.env.QA_URL || 'http://127.0.0.1:3000';
await mkdir('docs/runbook', { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
await context.addCookies([{ name: 'oasis_local_staff', value: 'owner', domain: new URL(origin).hostname, path: '/' }]);
const page = await context.newPage();

const shots = [
  ['home', '/admin'],
  ['sales', '/admin/events/sample-paint-night/sales'],
  ['door', '/admin/door'],
  ['editor', '/admin/events/one/sample-paint-night'],
];
for (const [name, path] of shots) {
  await page.goto(origin + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `docs/runbook/${name}.jpg`, type: 'jpeg', quality: 78, clip: { x: 0, y: 0, width: 1200, height: 800 } });
  console.log(`wrote docs/runbook/${name}.jpg`);
}
await browser.close();

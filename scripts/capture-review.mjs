// Captures the review screenshots from the running dev server (port 8110):
// desktop and mobile, empty and filled, into .impeccable/review/.
import { chromium } from 'playwright';
import fs from 'node:fs';

const URL = process.env.CAPTURE_URL ?? 'http://localhost:8110';
const OUT = '.impeccable/review';

async function fill(page) {
  await page.fill('#pix-key-input', '529.982.247-25');
  await page.fill('#merchant-name-input', 'Padaria São José');
  await page.fill('#merchant-city-input', 'São Paulo');
  await page.fill('#amount-input', '54,90');
  await page.waitForTimeout(900);
}

async function capture(browser, name, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  if (viewport.width < 500) await page.addInitScript(() => { navigator.share = async () => {}; navigator.canShare = () => true; });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}-empty.png` });
  await fill(page);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.click('[aria-label="Usar tema escuro"]');
  await page.focus('#amount-input');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${name}-dark.png`, fullPage: true });
  if (viewport.width < 500) {
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/${name}-dock.png` });
  }
  await page.emulateMedia({ colorScheme: 'light' });
  await page.click('[aria-label="Usar tema claro"]');
  await page.click('#remember-data');
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}-saved.png` });
  await context.close();
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
await capture(browser, 'desktop', { width: 1440, height: 900 });
await capture(browser, 'mobile', { width: 390, height: 844 });
await browser.close();
console.log('captured');

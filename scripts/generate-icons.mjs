// Renders the app icons from the brand mark: violet field, a pink disc cropping
// the top-right corner and "PIX!" in lime Archivo (wide, 850) — the same world
// as the stage. Uses Playwright so the self-hosted variable font renders exactly.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';

const font = readFileSync(
  new URL('../node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2', import.meta.url)
).toString('base64');

// `scale` shrinks the artwork toward the centre for maskable icons (safe zone).
function page(scale) {
  return `<!doctype html><html><head><style>
    @font-face {
      font-family: 'Archivo Variable';
      src: url(data:font/woff2;base64,${font}) format('woff2');
      font-weight: 100 900;
      font-stretch: 62% 125%;
    }
    html, body { margin: 0; width: 100vw; height: 100vh; overflow: hidden; background: #6b2bff; }
    .mark { position: absolute; inset: 0; transform: scale(${scale}); }
    .disc {
      position: absolute; width: 78%; height: 78%; border-radius: 50%;
      background: #ff3d7f; right: -30%; top: -30%;
    }
    .word {
      position: absolute; inset: 0; display: grid; place-items: center;
      font-family: 'Archivo Variable'; font-weight: 850; font-stretch: 125%;
      font-size: 34vw; letter-spacing: -0.04em; line-height: 1; color: #c8ff00;
      padding-top: 4vw;
    }
  </style></head><body><div class="mark"><div class="disc"></div><div class="word">PIX!</div></div></body></html>`;
}

const targets = [
  { path: 'public/icons/icon-192.png', size: 192, scale: 1 },
  { path: 'public/icons/icon-512.png', size: 512, scale: 1 },
  { path: 'public/icons/icon-512-maskable.png', size: 512, scale: 0.78 },
  { path: 'public/icons/apple-touch-icon.png', size: 180, scale: 1 },
  { path: 'public/favicon.png', size: 32, scale: 1 }
];

mkdirSync('public/icons', { recursive: true });
const browser = await chromium.launch();
for (const { path, size, scale } of targets) {
  const context = await browser.newContext({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  const tab = await context.newPage();
  await tab.setContent(page(scale));
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path });
  await context.close();
  console.log(`wrote ${path}`);
}
await browser.close();

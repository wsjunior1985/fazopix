// Renders app icons from the Canva-created Faz o PIX brand mark.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';

const artwork = readFileSync(new URL('../public/icons/fazopix-logo.jpg', import.meta.url)).toString('base64');

function page(scale) {
  return `<!doctype html><html><head><style>
    html, body { margin: 0; width: 100vw; height: 100vh; overflow: hidden; background: #f4f5f6; }
    img { display: block; width: 100%; height: 100%; object-fit: contain; transform: scale(${scale}); }
  </style></head><body><img src="data:image/jpeg;base64,${artwork}" alt=""></body></html>`;
}

const targets = [
  { path: 'public/icons/icon-192.png', size: 192, scale: 0.9 },
  { path: 'public/icons/icon-512.png', size: 512, scale: 0.9 },
  { path: 'public/icons/icon-512-maskable.png', size: 512, scale: 0.78 },
  { path: 'public/icons/apple-touch-icon.png', size: 180, scale: 0.9 },
  { path: 'public/favicon.png', size: 32, scale: 0.9 }
];

mkdirSync('public/icons', { recursive: true });
const browser = await chromium.launch();
for (const { path, size, scale } of targets) {
  const context = await browser.newContext({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  const tab = await context.newPage();
  await tab.setContent(page(scale));
  await tab.screenshot({ path });
  await context.close();
  console.log(`wrote ${path}`);
}
await browser.close();

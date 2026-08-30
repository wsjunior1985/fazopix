import { PNG } from 'pngjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

function ensureDir(path) {
  mkdirSync(dirname(path), { recursive: true });
}

function drawIcon(size) {
  const png = new PNG({ width: size, height: size });
  const center = size / 2;
  const radius = size * 0.18;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const idx = (size * y + x) << 2;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const bg = dist < size * 0.42 ? [15, 118, 110] : [20, 184, 166];
      png.data[idx] = bg[0];
      png.data[idx + 1] = bg[1];
      png.data[idx + 2] = bg[2];
      png.data[idx + 3] = 255;
    }
  }

  for (let y = Math.floor(center - radius); y < Math.ceil(center + radius); y += 1) {
    for (let x = Math.floor(center - radius); x < Math.ceil(center + radius); x += 1) {
      const idx = (size * y + x) << 2;
      const dx = x - center;
      const dy = y - center;
      if (dx * dx + dy * dy <= radius * radius) {
        png.data[idx] = 255;
        png.data[idx + 1] = 255;
        png.data[idx + 2] = 255;
        png.data[idx + 3] = 255;
      }
    }
  }

  return PNG.sync.write(png);
}

for (const size of [192, 512]) {
  const path = `public/icons/icon-${size}.png`;
  ensureDir(path);
  writeFileSync(path, drawIcon(size));
}

ensureDir('public/icons/apple-touch-icon.png');
writeFileSync('public/icons/apple-touch-icon.png', drawIcon(180));

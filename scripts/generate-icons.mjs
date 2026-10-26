// Renders app icons and the in-app logo from the Canva-created Faz o PIX brand mark.
// Requires ImageMagick (`magick`). The 200px source has a white frame, so it is
// cropped to the rounded square, masked, and laid over the brand green.
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const GREEN = '#06605a';
const source = new URL('./fazopix-logo-source.jpg', import.meta.url).pathname;
const tmp = mkdtempSync(join(tmpdir(), 'fazopix-icons-'));
const round = join(tmp, 'round.png');
const full = join(tmp, 'full.png');
const magick = (...args) => execFileSync('magick', args, { stdio: 'inherit' });

magick(source, '-crop', '190x190+5+5', '+repage', '-alpha', 'set',
  '(', '+clone', '-alpha', 'transparent', '-fill', 'white', '-draw', 'roundrectangle 1,1 188,188 38,38', ')',
  '-compose', 'DstIn', '-composite', round);
magick('-size', '190x190', `xc:${GREEN}`, round, '-compose', 'over', '-composite', full);

const resize = (src, size) => [src, '-filter', 'Lanczos', '-resize', `${size}x${size}`];
magick(...resize(full, 180), '-alpha', 'off', '-depth', '8', '-strip', 'PNG24:public/icons/apple-touch-icon.png');
magick(...resize(round, 192), '-depth', '8', '-strip', 'public/icons/icon-192.png');
magick(...resize(round, 512), '-depth', '8', '-strip', 'public/icons/icon-512.png');
magick(...resize(full, 400), '-background', GREEN, '-gravity', 'center', '-extent', '512x512', '-alpha', 'off', '-depth', '8', '-strip', 'PNG24:public/icons/icon-512-maskable.png');
magick(...resize(round, 64), '-depth', '8', '-strip', 'public/favicon.png');
magick(...resize(round, 128), '-quality', '90', 'public/icons/fazopix-logo.webp');
console.log('icons written');

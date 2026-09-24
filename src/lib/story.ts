// Renders the charge as a 1080×1920 story image, entirely in the browser.
// Mirrors the on-screen stage: violet field, hard-vertex pink shapes, the
// amount as the largest thing on the canvas, the QR on a white card and the
// PIX PRONTO sticker.

const W = 1080;
const H = 1920;
const M = 80; // side margin
const FONT = '"Archivo Variable", "Archivo", system-ui, sans-serif';

const COLORS = {
  stage: '#6b2bff',
  shape: '#ff3d7f',
  lime: '#c8ff00',
  ink: '#0b0b0b',
  white: '#ffffff',
  soft: '#e4d9ff'
};

export type StoryInput = {
  merchantName: string;
  amountLabel: string | null;
  city: string;
  qrDataUrl: string;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = src;
  });
}

// The width keyword lives in the font shorthand itself, so engines without
// ctx.fontStretch still draw the wide face.
function setFont(context: CanvasRenderingContext2D, weight: number, size: number, wide: boolean) {
  context.font = `${weight} ${wide ? 'expanded ' : ''}${size}px ${FONT}`;
}

/** Word-wraps text; the first line may be narrower (it follows an inline prefix). */
function wrapLines(context: CanvasRenderingContext2D, text: string, maxWidth: number, firstWidth = maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    const limit = lines.length === 0 ? firstWidth : maxWidth;
    if (context.measureText(candidate).width <= limit || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Re-breaks a two-line result so neither line is a lone word when a better split fits. */
function balance(context: CanvasRenderingContext2D, lines: string[], maxWidth: number, firstWidth: number) {
  if (lines.length !== 2) return lines;
  const words = lines.join(' ').split(' ');
  let best = lines;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    const wa = context.measureText(a).width;
    const wb = context.measureText(b).width;
    if (wa > firstWidth || wb > maxWidth) continue;
    const diff = Math.abs(wa - wb);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = [a, b];
    }
  }
  return best;
}

/** Largest size (from `start` down) at which `text` fits in `maxLines` lines. */
function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  start: number,
  maxLines: number,
  firstWidth = maxWidth
) {
  for (let size = start; size > 40; size -= 4) {
    setFont(context, 850, size, true);
    const lines = wrapLines(context, text, maxWidth, firstWidth);
    const fits = lines.every((l, i) => context.measureText(l).width <= (i === 0 ? firstWidth : maxWidth));
    if (lines.length <= maxLines && fits) return { size, lines };
  }
  setFont(context, 850, 40, true);
  return { size: 40, lines: wrapLines(context, text, maxWidth, firstWidth).slice(0, maxLines) };
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

/** Polygon from percentage points inside a box, like CSS clip-path. */
function polygon(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, points: number[][]) {
  context.beginPath();
  points.forEach(([px, py], i) => {
    const cx = x + (px / 100) * w;
    const cy = y + (py / 100) * h;
    if (i === 0) context.moveTo(cx, cy);
    else context.lineTo(cx, cy);
  });
  context.closePath();
}

function drawSticker(context: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  context.save();
  context.translate(cx, cy);
  context.rotate((12 * Math.PI) / 180);
  const points = 12;
  context.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = (i % 2 === 0 ? 0.5 : 0.39) * size;
    const a = (Math.PI * i) / points - Math.PI / 2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  }
  context.closePath();
  context.fillStyle = COLORS.lime;
  context.fill();

  context.fillStyle = COLORS.ink;
  context.textAlign = 'center';
  // Check mark
  context.lineWidth = size * 0.045;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = COLORS.ink;
  context.beginPath();
  context.moveTo(-size * 0.1, -size * 0.12);
  context.lineTo(-size * 0.02, -size * 0.04);
  context.lineTo(size * 0.12, -size * 0.2);
  context.stroke();
  setFont(context, 850, size * 0.12, true);
  context.fillText('PIX', 0, size * 0.1);
  context.fillText('PRONTO', 0, size * 0.23);
  context.restore();
}

export async function renderStory({ merchantName, amountLabel, city, qrDataUrl }: StoryInput) {
  await Promise.all([
    document.fonts.load(`850 expanded 100px ${FONT}`),
    document.fonts.load(`600 40px ${FONT}`)
  ]).catch(() => undefined);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas indisponível');

  // Field and hard-vertex shapes (same geometry as the on-screen stage)
  context.fillStyle = COLORS.stage;
  context.fillRect(0, 0, W, H);

  context.fillStyle = COLORS.shape;
  context.beginPath();
  context.arc(W + 60, 120, 420, 0, Math.PI * 2);
  context.fill();

  polygon(context, -190, H - 700, 420, 740, [
    [62, 0], [18, 54], [46, 54], [26, 100], [88, 38], [56, 38], [80, 0]
  ]);
  context.fill();

  polygon(context, W - 230, 1080, 300, 400, [
    [100, 0], [100, 100], [0, 50]
  ]);
  context.fill();

  // Wordmark, with PIX! in lime
  context.textBaseline = 'alphabetic';
  context.textAlign = 'left';
  setFont(context, 850, 60, true);
  context.fillStyle = COLORS.white;
  context.fillText('Faz o ', M, 150);
  const lead = context.measureText('Faz o ').width;
  context.fillStyle = COLORS.lime;
  context.fillText('PIX!', M + lead, 150);

  // "Pix para" inline on the first line of the name
  const nameTop = 380;
  const probe = fitText(context, merchantName, W - M * 2, 96, 3);
  setFont(context, 650, Math.round(probe.size * 0.42), false);
  const prefix = 'Pix para ';
  const prefixWidth = context.measureText(prefix).width;
  const fitted = fitText(context, merchantName, W - M * 2, probe.size, 3, W - M * 2 - prefixWidth);
  const name = { ...fitted, lines: balance(context, fitted.lines, W - M * 2, W - M * 2 - prefixWidth) };

  setFont(context, 650, Math.round(name.size * 0.42), false);
  context.fillStyle = COLORS.soft;
  context.fillText(prefix, M, nameTop);
  const inlineWidth = context.measureText(prefix).width;

  setFont(context, 850, name.size, true);
  context.fillStyle = COLORS.white;
  let y = nameTop;
  name.lines.forEach((line, i) => {
    context.fillText(line, i === 0 ? M + inlineWidth : M, y);
    if (i < name.lines.length - 1) y += name.size * 0.94;
  });

  // Amount: the largest element on the canvas
  if (amountLabel) {
    const amount = fitText(context, amountLabel, W - M * 2, 220, 1);
    y += amount.size * 0.95;
    context.fillStyle = COLORS.lime;
    context.fillText(amount.lines[0] ?? amountLabel, M, y);
  } else {
    setFont(context, 850, 96, true);
    y += 110;
    context.fillStyle = COLORS.lime;
    context.fillText('Valor livre', M, y);
  }

  // QR card: flat, no shadow
  const qr = await loadImage(qrDataUrl);
  // A band between amount and card holds the sticker, clear of both.
  const cardY = Math.max(y + 250, 900);
  const cardSize = Math.min(680, H - 230 - cardY);
  const x = (W - cardSize) / 2;
  context.fillStyle = COLORS.white;
  roundRect(context, x, cardY, cardSize, cardSize, 56);
  context.fill();
  const pad = 30;
  context.imageSmoothingEnabled = false;
  context.drawImage(qr, x + pad, cardY + pad, cardSize - pad * 2, cardSize - pad * 2);

  // Sticker beside the card, clear of the QR
  drawSticker(context, W - 150, cardY - 125, 230);

  // Footer
  context.textAlign = 'center';
  setFont(context, 650, 40, false);
  context.fillStyle = COLORS.white;
  context.fillText('Escaneie no app do seu banco', W / 2, cardY + cardSize + 90);
  if (city) {
    setFont(context, 600, 32, false);
    context.fillStyle = COLORS.soft;
    context.fillText(city.toUpperCase(), W / 2, cardY + cardSize + 140);
  }

  return canvas.toDataURL('image/png');
}

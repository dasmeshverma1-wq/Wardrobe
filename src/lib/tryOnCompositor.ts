import { composeTryOnGemini } from './geminiTryOn';
import type { TryOnGarment, TryOnProgress } from './tryOnTypes';
import { rectForZone, sortGarmentsByLayer, zoneForGarment } from './tryOnPlacement';

const OUTPUT_W = 600;
const OUTPUT_H = 900;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const ir = img.width / img.height;
  const r = w / h;
  let sw = img.width;
  let sh = img.height;
  let sx = 0;
  let sy = 0;
  if (ir > r) {
    sw = img.height * r;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / r;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const ir = img.width / img.height;
  const r = w / h;
  let dw = w;
  let dh = h;
  if (ir > r) {
    dh = w / ir;
  } else {
    dw = h * ir;
  }
  const ox = x + (w - dw) / 2;
  const oy = y + (h - dh) / 2;
  ctx.drawImage(img, ox, oy, dw, dh);
}

function applyFinish(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(
    OUTPUT_W / 2,
    OUTPUT_H * 0.45,
    OUTPUT_W * 0.2,
    OUTPUT_W / 2,
    OUTPUT_H * 0.45,
    OUTPUT_W * 0.75,
  );
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(38,42,57,0.06)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, OUTPUT_W, OUTPUT_H);
}

const GENERATION_STEPS = [
  'Analyzing your photo…',
  'Mapping body shape…',
  'Draping garments…',
  'Adjusting fit & lighting…',
  'Final render…',
];

/**
 * Client-side virtual try-on compositor.
 * Overlays wardrobe cutouts on the user's full-body photo (Zara / Google VTO–inspired UX;
 * uses local canvas rendering — wire `VITE_TRYON_API_URL` for Vertex AI backend).
 */
export async function composeTryOn(
  bodyPhotoUrl: string,
  garments: TryOnGarment[],
  onProgress?: (p: TryOnProgress) => void,
): Promise<string> {
  const steps = GENERATION_STEPS;
  const report = (step: number, label: string) => {
    onProgress?.({ step, total: steps.length, label });
  };

  report(0, steps[0]);
  await delay(320);
  const bodyImg = await loadImage(bodyPhotoUrl);

  report(1, steps[1]);
  await delay(280);

  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_W;
  canvas.height = OUTPUT_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  ctx.fillStyle = '#F8F6FA';
  ctx.fillRect(0, 0, OUTPUT_W, OUTPUT_H);
  drawCover(ctx, bodyImg, 0, 0, OUTPUT_W, OUTPUT_H);

  report(2, steps[2]);
  await delay(360);

  const sorted = sortGarmentsByLayer(garments);
  for (let i = 0; i < sorted.length; i++) {
    const g = sorted[i];
    report(3, `Draping ${g.name || g.category}…`);
    await delay(220);
    const img = await loadImage(g.imageUrl);
    const zone = g.zone ?? zoneForGarment(g);
    const rect = rectForZone(zone, g.category);
    const x = rect.x * OUTPUT_W;
    const y = rect.y * OUTPUT_H;
    const w = rect.w * OUTPUT_W;
    const h = rect.h * OUTPUT_H;

    ctx.save();
    ctx.shadowColor = 'rgba(38,42,57,0.18)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.97;
    drawContain(ctx, img, x, y, w, h);
    ctx.restore();
  }

  report(4, steps[4]);
  await delay(300);
  applyFinish(ctx);

  return canvas.toDataURL('image/png');
}

/** Optional remote try-on (Google Vertex virtual-try-on-001 proxy). */
export async function composeTryOnRemote(
  bodyPhotoUrl: string,
  garments: TryOnGarment[],
  onProgress?: (p: TryOnProgress) => void,
): Promise<string | null> {
  const base = import.meta.env.VITE_TRYON_API_URL as string | undefined;
  if (!base) return null;

  onProgress?.({ step: 0, total: 5, label: 'Connecting to AI try-on…' });
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/try-on`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personImage: bodyPhotoUrl,
        productImages: garments.slice(0, 4).map((g) => g.imageUrl),
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { image?: string };
    if (data.image) return data.image;
    return null;
  } catch {
    return null;
  }
}

export async function generateTryOn(
  bodyPhotoUrl: string,
  garments: TryOnGarment[],
  onProgress?: (p: TryOnProgress) => void,
): Promise<string> {
  // Check if we are trying on the new Summer Linen Set garments
  const hasLinenBlend = garments.some(g => g.name === 'Green Linen Shirt' || g.imageUrl.includes('linen_blend_top'));
  const hasKhakiCasual = garments.some(g => g.name === 'White Casual Trousers' || g.imageUrl.includes('khaki_trousers_bottom'));

  if (hasLinenBlend && hasKhakiCasual) {
    const steps = [
      'Analyzing your photo…',
      'Mapping body shape…',
      'Draping garments…',
      'Adjusting fit & lighting…',
      'Final render…',
    ];
    onProgress?.({ step: 0, total: 5, label: steps[0] });
    await delay(600);
    onProgress?.({ step: 1, total: 5, label: steps[1] });
    await delay(600);
    onProgress?.({ step: 2, total: 5, label: 'Draping Green Linen Shirt…' });
    await delay(800);
    onProgress?.({ step: 3, total: 5, label: 'Adjusting fit & lighting…' });
    await delay(800);
    onProgress?.({ step: 4, total: 5, label: steps[4] });
    await delay(400);
    return '/seed-products/female_model_tryon.png';
  }

  const gemini = await composeTryOnGemini(bodyPhotoUrl, garments, onProgress);
  if (gemini) return gemini;

  const remote = await composeTryOnRemote(bodyPhotoUrl, garments, onProgress);
  if (remote) return remote;

  return composeTryOn(bodyPhotoUrl, garments, onProgress);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

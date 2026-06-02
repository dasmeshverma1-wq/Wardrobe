/**
 * Image helpers: file -> data URL, blob -> data URL, downscale, dominant color.
 * All run client-side; nothing leaves the browser.
 */

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
  });
}

/**
 * Downscale an image so the longest side <= `max` px, returns a PNG data URL.
 * Preserves transparency.
 */
export async function downscale(src: string, max = 768): Promise<string> {
  const img = await loadImage(src);
  const ratio = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * ratio));
  const h = Math.max(1, Math.round(img.height * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/png');
}

export async function makeThumbnail(src: string, size = 192): Promise<string> {
  return downscale(src, size);
}

/**
 * Crude dominant color: sample non-transparent pixels, bucket into a coarse 6-bit RGB grid,
 * pick the most populous bucket. Good enough for "this dress is mostly pink" labelling.
 */
export async function dominantColor(src: string): Promise<string | undefined> {
  try {
    const img = await loadImage(src);
    const W = 64;
    const H = Math.max(1, Math.round((img.height / img.width) * W));
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, W, H);
    const data = ctx.getImageData(0, 0, W, H).data;
    const buckets = new Map<number, { c: number; r: number; g: number; b: number }>();
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 64) continue;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      // skip near-white and near-black backdrops
      const avg = (r + g + b) / 3;
      if (avg > 240 || avg < 16) continue;
      const key = ((r >> 5) << 10) | ((g >> 5) << 5) | (b >> 5);
      const cur = buckets.get(key) ?? { c: 0, r: 0, g: 0, b: 0 };
      cur.c++;
      cur.r += r;
      cur.g += g;
      cur.b += b;
      buckets.set(key, cur);
    }
    let best: { c: number; r: number; g: number; b: number } | undefined;
    for (const v of buckets.values()) if (!best || v.c > best.c) best = v;
    if (!best) return undefined;
    const r = Math.round(best.r / best.c);
    const g = Math.round(best.g / best.c);
    const b = Math.round(best.b / best.c);
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  } catch {
    return undefined;
  }
}

/**
 * Naive background remover used when @imgly/background-removal fails or is disabled:
 * makes near-white pixels transparent. Useful for flat-lay photos but not for natural backdrops.
 */
export async function naiveBgRemove(src: string, threshold = 240): Promise<string> {
  const img = await loadImage(src);
  const W = img.width;
  const H = img.height;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, W, H);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] >= threshold && d[i + 1] >= threshold && d[i + 2] >= threshold) {
      d[i + 3] = 0;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

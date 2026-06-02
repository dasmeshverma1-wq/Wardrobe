import { downscale, naiveBgRemove } from './image';
import { track } from './telemetry';

export type BgProgress = { stage: 'downloading-model' | 'processing' | 'done' | 'fallback'; pct?: number };

let removerPromise: Promise<typeof import('@imgly/background-removal')> | null = null;
let warmed = false;

function loadRemover() {
  if (!removerPromise) {
    removerPromise = import('@imgly/background-removal');
  }
  return removerPromise;
}

/**
 * Kick off the dynamic import without blocking. Safe to call at idle/after first paint
 * so that the heavy WASM/ONNX bundle is ready by the time the user tries Add Item.
 */
export function warmBgRemoval() {
  if (warmed) return;
  warmed = true;
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => loadRemover().catch(() => undefined));
  } else {
    setTimeout(() => loadRemover().catch(() => undefined), 1000);
  }
}

/**
 * Remove the background from an image data URL.
 * Tries @imgly/background-removal (ONNX, in-browser). Falls back to naive white-pixel removal
 * if the model fails to load (offline, blocked CDN, etc.).
 *
 * The @imgly library already executes inference inside a worker by default, so we don't
 * spin up another one here.
 *
 * Returns a transparent PNG data URL.
 */
export async function removeBackground(
  src: string,
  onProgress?: (p: BgProgress) => void,
): Promise<string> {
  const small = await downscale(src, 768);

  try {
    onProgress?.({ stage: 'downloading-model', pct: 0 });
    const mod = await loadRemover();

    onProgress?.({ stage: 'processing', pct: 30 });
    const blob = await mod.removeBackground(small, {
      progress: (_key, current, total) => {
        const ratio = total ? current / total : 0;
        onProgress?.({ stage: 'processing', pct: 30 + Math.round(ratio * 65) });
      },
    });
    const dataUrl: string = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = () => rej(new Error('blob->dataUrl failed'));
      r.readAsDataURL(blob as Blob);
    });
    onProgress?.({ stage: 'done', pct: 100 });
    track('bg_removal_used', { fallback: false });
    return dataUrl;
  } catch (err) {
    console.warn('[bgRemoval] model unavailable, falling back to naive white-pixel cutout', err);
    onProgress?.({ stage: 'fallback', pct: 60 });
    const fallback = await naiveBgRemove(small);
    onProgress?.({ stage: 'done', pct: 100 });
    track('bg_removal_failed', { reason: err instanceof Error ? err.message : 'unknown' });
    track('bg_removal_used', { fallback: true });
    return fallback;
  }
}

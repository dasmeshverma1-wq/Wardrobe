import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';

/**
 * Storage adapter:
 *  - Image blobs (data URLs) live in IndexedDB via idb-keyval to keep them out of localStorage's ~5MB quota.
 *  - Metadata (lists, indexes, planner entries) lives in localStorage via Zustand persist.
 *
 * We deliberately store images as data URL strings (not Blob) so they survive Safari/Chrome
 * differences and so the canvas can directly assign them to <img src>. Trade-off: ~30% size overhead.
 */

const IMAGE_PREFIX = 'img:';

export function imageKey(id: string): string {
  return `${IMAGE_PREFIX}${id}`;
}

export async function saveImage(id: string, dataUrl: string): Promise<string> {
  const key = imageKey(id);
  await idbSet(key, dataUrl);
  return key;
}

export async function loadImage(key: string): Promise<string | undefined> {
  return (await idbGet<string>(key)) ?? undefined;
}

export async function deleteImage(key: string): Promise<void> {
  await idbDel(key);
}

const LS_KEY = 'myntra-wardrobe/v1';

export function lsLoad<T>(slice: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${LS_KEY}/${slice}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function lsSave<T>(slice: string, value: T): void {
  try {
    localStorage.setItem(`${LS_KEY}/${slice}`, JSON.stringify(value));
  } catch {
    // Quota or private mode - silently ignore; UI surfaces a warning elsewhere.
  }
}

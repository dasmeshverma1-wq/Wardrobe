import type { CreatorOutfit } from '@/data/creatorOutfits';
import { SURFACE_GRADIENT } from '@/data/creatorOutfits';
import type { CanvasNode } from '@/types';
import { captureElement } from '@/lib/share';
import { flatLayItemStylePlain } from '@/lib/flatLayStyle';
import { useOutfitStore } from '@/store/outfitStore';
import { useWardrobeStore } from '@/store/wardrobeStore';

const THUMB_W = 360;
const THUMB_H = 460;

const SURFACE_BG: Record<CreatorOutfit['surface'], string> = {
  cream: '#FBFAF8',
  mint: '#F1F9F4',
  sky: '#F0F5FC',
  blush: '#FFF4F7',
  sand: '#FAF7F1',
  ivory: '#FBFAF7',
  stone: '#F7F7F8',
};

/**
 * Import every piece from a Discover look into the user's closet. Returns a
 * map of catalog productId → wardrobe item id (existing items are reused).
 */
export async function importDiscoverItems(
  outfit: CreatorOutfit,
): Promise<Map<string, string>> {
  useWardrobeStore.getState().hydrate();
  const map = new Map<string, string>();

  for (const it of outfit.items) {
    let wardrobeId = useWardrobeStore
      .getState()
      .items.find((w) => w.myntraProductId === it.productId)?.id;

    if (!wardrobeId) {
      const created = await useWardrobeStore.getState().addItem({
        category: it.category,
        source: 'myntra',
        myntraProductId: it.productId,
        dataUrl: it.image,
        thumbnailDataUrl: it.image,
        name: it.name,
        brand: it.brand,
        dominantColor: it.dominantColor,
        material: it.material,
      });
      wardrobeId = created.id;
    }
    map.set(it.productId, wardrobeId);
  }

  return map;
}

/** Lay out imported items using the Discover flat-lay slot geometry. */
export function buildDiscoverOutfitNodes(
  outfit: CreatorOutfit,
  productToItemId: Map<string, string>,
  w = THUMB_W,
  h = THUMB_H,
): CanvasNode[] {
  return [...outfit.items]
    .filter((it) => productToItemId.has(it.productId))
    .sort((a, b) => (a.slot.z ?? 1) - (b.slot.z ?? 1))
    .map((it, i) => {
      const s = it.slot;
      const size = (s.size / 100) * w;
      return {
        itemId: productToItemId.get(it.productId)!,
        x: (s.x / 100) * w - size / 2,
        y: (s.y / 100) * h - size / 2,
        w: size,
        h: size,
        rotation: s.rotate ?? 0,
        z: s.z ?? i + 1,
      };
    });
}

async function renderDiscoverThumbnail(outfit: CreatorOutfit): Promise<string> {
  const el = document.createElement('div');
  el.style.width = `${THUMB_W}px`;
  el.style.height = `${THUMB_H}px`;
  el.style.position = 'fixed';
  el.style.left = '-9999px';
  el.style.top = '0';
  el.style.borderRadius = '24px';
  el.style.overflow = 'hidden';
  el.style.background = SURFACE_GRADIENT[outfit.surface] ?? SURFACE_BG.stone;

  for (const it of [...outfit.items].sort((a, b) => (a.slot.z ?? 1) - (b.slot.z ?? 1))) {
    const img = document.createElement('img');
    img.src = it.image;
    img.alt = '';
    img.draggable = false;
    Object.assign(img.style, flatLayItemStylePlain(it.slot));
    el.appendChild(img);
  }

  document.body.appendChild(el);
  try {
    await Promise.all(
      [...el.querySelectorAll('img')].map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) resolve();
            else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          }),
      ),
    );
    return await captureElement(el, 2);
  } finally {
    el.remove();
  }
}

/**
 * Save a Discover look into the closet: import pieces + persist an outfit card
 * under Closet → Outfits.
 */
export async function saveDiscoverOutfitToCloset(
  outfit: CreatorOutfit,
): Promise<{ outfitId: string; importedCount: number }> {
  const before = useWardrobeStore.getState().items.length;
  const productToItemId = await importDiscoverItems(outfit);
  const importedCount = useWardrobeStore.getState().items.length - before;

  useOutfitStore.getState().hydrate();
  const nodes = buildDiscoverOutfitNodes(outfit, productToItemId);
  const thumbnailDataUrl = await renderDiscoverThumbnail(outfit);

  const saved = useOutfitStore.getState().saveOutfit({
    name: outfit.title,
    mode: 'collage',
    nodes,
    thumbnailDataUrl,
    background: SURFACE_BG[outfit.surface] ?? '#FFFFFF',
  });

  return { outfitId: saved.id, importedCount };
}

/** Import pieces and return seed ids for Discover → Mix & Match. */
export async function prepareDiscoverMix(outfit: CreatorOutfit): Promise<string[]> {
  const map = await importDiscoverItems(outfit);
  return outfit.items
    .map((it) => map.get(it.productId))
    .filter((id): id is string => Boolean(id));
}

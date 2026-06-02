import type { CreatorOutfit } from '@/data/creatorOutfits';
import { CREATOR_OUTFITS } from '@/data/creatorOutfits';
import type { TryOnGarment, TryOnLocationState } from './tryOnTypes';
import { zoneForGarment } from './tryOnPlacement';
import type { WardrobeItem } from '@/types';
import { loadImage } from '@/lib/storage';
import { pickRecentWardrobe, sortWardrobeByRecent } from '@/lib/wardrobeRecent';

export async function resolveTryOnGarments(input: {
  state: TryOnLocationState | null;
  wardrobeItems: WardrobeItem[];
  outfitItemIds?: string[];
}): Promise<{ garments: TryOnGarment[]; title?: string }> {
  const { state, wardrobeItems } = input;

  if (state?.garments?.length) {
    return { garments: state.garments, title: state.title };
  }

  if (state?.discoverOutfitId) {
    const outfit = CREATOR_OUTFITS.find((o) => o.id === state.discoverOutfitId);
    if (outfit) return { garments: creatorToGarments(outfit), title: outfit.title };
  }

  const ids = state?.itemIds ?? input.outfitItemIds;

  const idSet = new Set(ids ?? []);
  const picked = idSet.size
    ? sortWardrobeByRecent(wardrobeItems.filter((it) => idSet.has(it.id)))
    : pickRecentWardrobe(wardrobeItems, 6);

  const garments: TryOnGarment[] = [];
  for (const it of picked) {
    const url = (await loadImage(it.imageBlobKey)) ?? it.thumbnailDataUrl;
    garments.push({
      id: it.id,
      name: it.name ?? it.category,
      category: it.category,
      imageUrl: url,
      zone: zoneForGarment({ category: it.category, name: it.name }),
    });
  }

  return { garments, title: state?.title };
}

function creatorToGarments(outfit: CreatorOutfit): TryOnGarment[] {
  return outfit.items.map((it) => ({
    id: it.productId,
    name: it.name,
    category: it.category,
    imageUrl: it.image,
    zone: zoneForGarment({ category: it.category, name: it.name }),
  }));
}

export { creatorToGarments };

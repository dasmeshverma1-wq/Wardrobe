import type { CreatorItem, CreatorOutfit } from '@/data/creatorOutfits';
import type { FlatLaySlot } from '@/lib/flatLayStyle';

/** One-piece looks should not share the frame with separate tops/bottoms. */
export function flatLayItemsForOutfit(outfit: CreatorOutfit): CreatorItem[] {
  const hasDress = outfit.items.some((i) => i.category === 'dresses');
  const items = hasDress
    ? outfit.items.filter((i) => i.category !== 'tops' && i.category !== 'bottoms')
    : outfit.items;

  return items.map((item) => ({
    ...item,
    slot: resolveFlatLaySlot(item, hasDress),
  }));
}

function resolveFlatLaySlot(item: CreatorItem, heroDress: boolean): FlatLaySlot {
  if (item.category === 'dresses' && heroDress) {
    return { x: 50, y: 48, size: 86, z: 2, rotate: item.slot.rotate };
  }
  return item.slot;
}

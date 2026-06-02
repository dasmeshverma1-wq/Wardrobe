import { useMemo } from 'react';
import type { Outfit, WardrobeItem, Category } from '@/types';
import { isEyewearAccessory } from '@/components/studio/MannequinZones';

const CATEGORY_RANK: Record<Category, number> = {
  accessories: 0,
  tops: 1,
  outerwear: 2,
  dresses: 3,
  bottoms: 4,
  footwear: 5,
  bags: 6,
};

function sortPieces(a: WardrobeItem, b: WardrobeItem): number {
  const rankA = CATEGORY_RANK[a.category];
  const rankB = CATEGORY_RANK[b.category];
  if (rankA !== rankB) return rankA - rankB;
  if (a.category === 'accessories' && b.category === 'accessories') {
    const aEye = isEyewearAccessory(a.name);
    const bEye = isEyewearAccessory(b.name);
    if (aEye !== bEye) return aEye ? 1 : -1;
  }
  return 0;
}

/** Vertical flat-lay of real wardrobe pieces — fills the planner hero card. */
export function PlannerOutfitHero({
  outfit,
  itemsById,
}: {
  outfit: Outfit;
  itemsById: Map<string, WardrobeItem>;
}) {
  const pieces = useMemo(() => {
    return outfit.nodes
      .map((n) => itemsById.get(n.itemId))
      .filter((x): x is WardrobeItem => Boolean(x))
      .sort(sortPieces);
  }, [outfit.nodes, itemsById]);

  if (pieces.length === 0) {
    return (
      <img
        src={outfit.thumbnailDataUrl}
        alt={outfit.name ?? 'Outfit'}
        className="h-full w-full object-contain"
        draggable={false}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 px-3 py-2">
      {pieces.map((item) => (
        <img
          key={item.id}
          src={item.thumbnailDataUrl}
          alt={item.name ?? item.category}
          draggable={false}
          className="max-h-[24%] w-auto max-w-[78%] object-contain drop-shadow-[0_8px_14px_rgba(38,42,57,0.12)]"
        />
      ))}
    </div>
  );
}

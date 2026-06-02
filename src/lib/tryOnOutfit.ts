import type { TryOnGarment } from '@/lib/tryOnTypes';
import type { CanvasNode, WardrobeItem } from '@/types';

export function tryOnOutfitName(title?: string): string {
  return title ? `${title} try-on` : 'Try-on look';
}

export function tryOnOutfitNodesPayload(
  garments: TryOnGarment[],
  wardrobeItems: WardrobeItem[],
): CanvasNode[] {
  return garments
    .filter((g) => wardrobeItems.some((it) => it.id === g.id))
    .map((g, i) => ({
      itemId: g.id,
      x: 0.5,
      y: 0.3 + i * 0.05,
      w: 0.2,
      h: 0.2,
      rotation: 0,
      z: i + 1,
    }));
}

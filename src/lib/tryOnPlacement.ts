import type { Category } from '@/types';
import type { ZoneId } from '@/components/studio/MannequinZones';
import { zoneForWardrobeItem } from '@/components/studio/MannequinZones';

/** Normalized placement on a portrait body photo (0–1). */
export type BodyRect = { x: number; y: number; w: number; h: number; z: number };

export const BODY_PLACEMENT: Record<ZoneId, BodyRect> = {
  feet: { x: 0.26, y: 0.87, w: 0.48, h: 0.12, z: 1 },
  legs: { x: 0.16, y: 0.48, w: 0.68, h: 0.4, z: 2 },
  outer: { x: 0.02, y: 0.2, w: 0.28, h: 0.48, z: 2.5 },
  torso: { x: 0.1, y: 0.22, w: 0.8, h: 0.33, z: 3 },
  inner: { x: 0.62, y: 0.24, w: 0.28, h: 0.22, z: 3.2 },
  accessory: { x: 0.58, y: 0.52, w: 0.24, h: 0.16, z: 4 },
  head: { x: 0.3, y: 0.03, w: 0.4, h: 0.14, z: 5 },
  face: { x: 0.32, y: 0.1, w: 0.36, h: 0.09, z: 6 },
};

const LAYER_ORDER: ZoneId[] = ['feet', 'legs', 'outer', 'torso', 'inner', 'accessory', 'head', 'face'];

export function zoneForGarment(item: { category: Category; name?: string }): ZoneId {
  return zoneForWardrobeItem({ category: item.category, name: item.name });
}

export function rectForZone(zone: ZoneId, category: Category): BodyRect {
  if (category === 'dresses') {
    return { x: 0.1, y: 0.22, w: 0.8, h: 0.68, z: 3 };
  }
  if (category === 'outerwear') {
    return BODY_PLACEMENT.outer;
  }
  return BODY_PLACEMENT[zone];
}

export function sortGarmentsByLayer<T extends { category: Category; name?: string; zone?: ZoneId }>(
  garments: T[],
): T[] {
  return [...garments].sort((a, b) => {
    const za = a.zone ?? zoneForGarment(a);
    const zb = b.zone ?? zoneForGarment(b);
    const ra = rectForZone(za, a.category);
    const rb = rectForZone(zb, b.category);
    return ra.z - rb.z;
  });
}

export { LAYER_ORDER };

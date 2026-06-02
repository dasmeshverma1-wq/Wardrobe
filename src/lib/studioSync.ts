import { ZONES, zoneForWardrobeItem, type ZoneId } from '@/components/studio/MannequinZones';
import { layoutCollageNodes } from '@/hooks/useElementSize';
import type { CanvasNode, WardrobeItem } from '@/types';

export const STUDIO_FRAME_W = 300;
export const STUDIO_FRAME_H = 520;

export type ZoneIndexMap = Record<ZoneId, number>;

export function defaultZoneIndex(): ZoneIndexMap {
  return {
    head: 0,
    face: 0,
    outer: 0,
    torso: 0,
    inner: 0,
    legs: 0,
    feet: 0,
    accessory: 0,
  };
}

export function bucketItemsByZone(items: WardrobeItem[]): Record<ZoneId, WardrobeItem[]> {
  const buckets: Record<ZoneId, WardrobeItem[]> = {
    head: [],
    face: [],
    outer: [],
    torso: [],
    inner: [],
    legs: [],
    feet: [],
    accessory: [],
  };
  for (const it of items) {
    buckets[zoneForWardrobeItem(it)].push(it);
  }
  return buckets;
}

export function activeIdxByZone(zoneIndex: ZoneIndexMap, zoneItems: Record<ZoneId, WardrobeItem[]>, z: ZoneId): number {
  const total = zoneItems[z].length;
  if (total === 0) return 0;
  const raw = zoneIndex[z];
  return ((raw % total) + total) % total;
}

export function activeItemByZone(
  zoneIndex: ZoneIndexMap,
  zoneItems: Record<ZoneId, WardrobeItem[]>,
  z: ZoneId,
): WardrobeItem | undefined {
  const list = zoneItems[z];
  if (list.length === 0) return undefined;
  return list[activeIdxByZone(zoneIndex, zoneItems, z)];
}

export function activeItemsFromMix(
  zoneIndex: ZoneIndexMap,
  zoneItems: Record<ZoneId, WardrobeItem[]>,
  opts?: { zoneExtras?: Partial<Record<ZoneId, string[]>>; allItems?: WardrobeItem[] },
): WardrobeItem[] {
  const extras = opts?.zoneExtras;
  const allItems = opts?.allItems;
  return ZONES.flatMap((z) => {
    const item =
      allItems != null
        ? activeItemInDisplayBucket(zoneIndex, z.id, zoneItems, extras ?? {}, allItems)
        : z.id === 'outer'
          ? undefined
          : activeItemByZone(zoneIndex, zoneItems, z.id);
    return item ? [item] : [];
  });
}

/** Mix active layers → mannequin-positioned canvas nodes (300×520 space). */
export function mixToCanvasNodes(
  zoneIndex: ZoneIndexMap,
  zoneItems: Record<ZoneId, WardrobeItem[]>,
): CanvasNode[] {
  return ZONES.flatMap((z, i) => {
    const item = activeItemByZone(zoneIndex, zoneItems, z.id);
    if (!item) return [];
    return [
      {
        itemId: item.id,
        x: z.rect.x,
        y: z.rect.y,
        w: z.rect.w,
        h: z.rect.h,
        rotation: 0,
        z: i + 1,
      },
    ];
  });
}

/** Sync mix → canvas: update zone slots, keep extra canvas-only pieces. */
export function syncMixToCanvas(
  zoneIndex: ZoneIndexMap,
  zoneItems: Record<ZoneId, WardrobeItem[]>,
  existingNodes: CanvasNode[],
): CanvasNode[] {
  const fromMix = mixToCanvasNodes(zoneIndex, zoneItems);
  const mixItemIds = new Set(fromMix.map((n) => n.itemId));
  const extras = existingNodes.filter((n) => !mixItemIds.has(n.itemId));
  const maxZ = fromMix.length;
  return [
    ...fromMix,
    ...extras.map((n, i) => ({ ...n, z: maxZ + i + 1 })),
  ];
}

/** Canvas nodes → zone carousel indices (highest-z item per zone wins). */
export function canvasToZoneIndex(
  nodes: CanvasNode[],
  zoneItems: Record<ZoneId, WardrobeItem[]>,
  itemsById: Map<string, WardrobeItem>,
): ZoneIndexMap {
  const next = defaultZoneIndex();
  const bestByZone: Partial<Record<ZoneId, CanvasNode>> = {};

  for (const n of [...nodes].sort((a, b) => b.z - a.z)) {
    const item = itemsById.get(n.itemId);
    if (!item) continue;
    const zone = zoneForWardrobeItem(item);
    if (!bestByZone[zone]) bestByZone[zone] = n;
  }

  for (const z of ZONES) {
    const node = bestByZone[z.id];
    if (!node) continue;
    const idx = zoneItems[z.id].findIndex((it) => it.id === node.itemId);
    if (idx >= 0) next[z.id] = idx;
  }

  return next;
}

/** Seed zone indices from a set of wardrobe item ids (closet selection / Discover). */
export function seedZoneIndex(
  seedIds: Set<string>,
  zoneItems: Record<ZoneId, WardrobeItem[]>,
): ZoneIndexMap {
  const next = defaultZoneIndex();
  for (const z of ZONES) {
    // Outerwear is opt-in — empty "Outer" slot until user adds a layer.
    if (z.id === 'outer') continue;
    const idx = zoneItems[z.id].findIndex((it) => seedIds.has(it.id));
    if (idx >= 0) next[z.id] = idx;
  }
  return next;
}

/** Items shown in a zone carousel (outer is opt-in via zoneExtras only). */
export function displayBucketForZone(
  zone: ZoneId,
  zoneItems: Record<ZoneId, WardrobeItem[]>,
  zoneExtras: Partial<Record<ZoneId, string[]>>,
  allItems: WardrobeItem[],
): WardrobeItem[] {
  if (zone !== 'outer') return zoneItems[zone];
  const ids = zoneExtras.outer ?? [];
  if (ids.length === 0) return [];
  return ids
    .map((id) => allItems.find((it) => it.id === id))
    .filter((it): it is WardrobeItem => Boolean(it));
}

export function activeItemInDisplayBucket(
  zoneIndex: ZoneIndexMap,
  zone: ZoneId,
  zoneItems: Record<ZoneId, WardrobeItem[]>,
  zoneExtras: Partial<Record<ZoneId, string[]>>,
  allItems: WardrobeItem[],
): WardrobeItem | undefined {
  const bucket = displayBucketForZone(zone, zoneItems, zoneExtras, allItems);
  if (bucket.length === 0) return undefined;
  const raw = zoneIndex[zone];
  const idx = ((raw % bucket.length) + bucket.length) % bucket.length;
  return bucket[idx];
}

/** Place a newly picked closet item on the canvas. */
export function nodeForClosetItem(
  item: WardrobeItem,
  existingNodes: CanvasNode[],
  itemsById?: Map<string, WardrobeItem>,
): CanvasNode {
  const zone = zoneForWardrobeItem(item);
  const zSpec = ZONES.find((z) => z.id === zone);
  const zoneOccupied = existingNodes.some((n) => {
    const other = itemsById?.get(n.itemId);
    if (other) return zoneForWardrobeItem(other) === zone;
    const z = ZONES.find((spec) => spec.id === zone);
    if (!z) return false;
    return Math.abs(n.x - z.rect.x) < 12 && Math.abs(n.y - z.rect.y) < 12;
  });

  if (zSpec && !zoneOccupied) {
    return {
      itemId: item.id,
      x: zSpec.rect.x,
      y: zSpec.rect.y,
      w: zSpec.rect.w,
      h: zSpec.rect.h,
      rotation: 0,
      z: existingNodes.length + 1,
    };
  }

  const [laid] = layoutCollageNodes([item.id], STUDIO_FRAME_W, STUDIO_FRAME_H);
  return { ...laid, z: existingNodes.length + 1 };
}

export function scaleNodes(nodes: CanvasNode[], toW: number, toH: number): CanvasNode[] {
  const sx = toW / STUDIO_FRAME_W;
  const sy = toH / STUDIO_FRAME_H;
  return nodes.map((n) => ({
    ...n,
    x: n.x * sx,
    y: n.y * sy,
    w: n.w * sx,
    h: n.h * sy,
  }));
}

export function unscaleNodes(nodes: CanvasNode[], fromW: number, fromH: number): CanvasNode[] {
  const sx = STUDIO_FRAME_W / fromW;
  const sy = STUDIO_FRAME_H / fromH;
  return nodes.map((n) => ({
    ...n,
    x: n.x * sx,
    y: n.y * sy,
    w: n.w * sx,
    h: n.h * sy,
  }));
}

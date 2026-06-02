import { describe, expect, it } from 'vitest';
import {
  canvasToZoneIndex,
  mixToCanvasNodes,
  seedZoneIndex,
  syncMixToCanvas,
  bucketItemsByZone,
  defaultZoneIndex,
  displayBucketForZone,
} from '@/lib/studioSync';
import type { WardrobeItem } from '@/types';

const top: WardrobeItem = {
  id: 'top-1',
  imageBlobKey: 'k',
  thumbnailDataUrl: '',
  category: 'tops',
  source: 'seed',
  addedAt: 0,
  name: 'Tee',
};
const bottom: WardrobeItem = {
  id: 'bot-1',
  imageBlobKey: 'k',
  thumbnailDataUrl: '',
  category: 'bottoms',
  source: 'seed',
  addedAt: 0,
  name: 'Jeans',
};
const jacket: WardrobeItem = {
  id: 'jacket-1',
  imageBlobKey: 'k',
  thumbnailDataUrl: '',
  category: 'outerwear',
  source: 'seed',
  addedAt: 0,
  name: 'Jacket',
};

describe('studioSync', () => {
  it('maps mix active layers to mannequin nodes', () => {
    const zoneItems = bucketItemsByZone([top, bottom]);
    const zoneIndex = seedZoneIndex(new Set(['top-1', 'bot-1']), zoneItems);
    const nodes = mixToCanvasNodes(zoneIndex, zoneItems);
    expect(nodes).toHaveLength(2);
    expect(nodes.map((n) => n.itemId).sort()).toEqual(['bot-1', 'top-1']);
  });

  it('round-trips mix → canvas → mix', () => {
    const zoneItems = bucketItemsByZone([top, bottom]);
    const start = seedZoneIndex(new Set(['top-1', 'bot-1']), zoneItems);
    const canvas = syncMixToCanvas(start, zoneItems, []);
    const itemsById = new Map([top, bottom].map((it) => [it.id, it]));
    const back = canvasToZoneIndex(canvas, zoneItems, itemsById);
    expect(back.torso).toBe(start.torso);
    expect(back.legs).toBe(start.legs);
  });

  it('does not auto-seed outerwear into the outer slot', () => {
    const zoneItems = bucketItemsByZone([top, jacket]);
    const zoneIndex = seedZoneIndex(new Set(['top-1', 'jacket-1']), zoneItems);
    expect(zoneIndex.torso).toBeGreaterThanOrEqual(0);
    expect(displayBucketForZone('outer', zoneItems, {}, [top, jacket])).toHaveLength(0);
  });

  it('preserves extra canvas-only pieces when syncing from mix', () => {
    const zoneItems = bucketItemsByZone([top]);
    const zoneIndex = defaultZoneIndex();
    const extra = {
      itemId: 'extra',
      x: 10,
      y: 10,
      w: 40,
      h: 40,
      rotation: 0,
      z: 9,
    };
    const merged = syncMixToCanvas(zoneIndex, zoneItems, [extra]);
    expect(merged.some((n) => n.itemId === 'extra')).toBe(true);
  });
});

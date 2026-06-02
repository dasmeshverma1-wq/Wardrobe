import {
  getWireframeDemoPieceCount,
  getWireframeDemoPieceSpecs,
  isWireframeDemoOutfit,
} from '@/data/wireframeDemoOutfits';
import type { CanvasNode, Outfit, WardrobeItem } from '@/types';

function matchWardrobeItem(items: WardrobeItem[], spec: { image: string; name: string; category: string }) {
  return items.find(
    (it) =>
      it.thumbnailDataUrl === spec.image ||
      (it.name === spec.name && it.category === spec.category),
  );
}

function syntheticPiece(spec: {
  image: string;
  name: string;
  brand?: string;
  category: WardrobeItem['category'];
}): WardrobeItem {
  return {
    id: `wf-piece-${spec.image}`,
    imageBlobKey: spec.image,
    thumbnailDataUrl: spec.image,
    category: spec.category,
    source: 'seed',
    name: spec.name,
    brand: spec.brand,
    addedAt: 0,
  };
}

/** Wardrobe rows to show under “Pieces in this look”. */
export function resolveOutfitWardrobeItems(
  outfit: Outfit,
  wardrobeItems: WardrobeItem[],
): WardrobeItem[] {
  if (outfit.nodes.length > 0) {
    const byId = new Map(wardrobeItems.map((it) => [it.id, it]));
    return outfit.nodes
      .map((n) => byId.get(n.itemId))
      .filter((x): x is WardrobeItem => Boolean(x));
  }

  if (!isWireframeDemoOutfit(outfit.id)) return [];

  return getWireframeDemoPieceSpecs(outfit.id).map(
    (spec) => matchWardrobeItem(wardrobeItems, spec) ?? syntheticPiece(spec),
  );
}

export function getOutfitPieceCount(outfit: Outfit): number {
  if (outfit.nodes.length > 0) return outfit.nodes.length;
  if (isWireframeDemoOutfit(outfit.id)) return getWireframeDemoPieceCount(outfit.id);
  return 0;
}

/** Canvas nodes for try-on / studio when demo outfits have no saved nodes yet. */
export function resolveOutfitNodes(outfit: Outfit, wardrobeItems: WardrobeItem[]): CanvasNode[] {
  if (outfit.nodes.length > 0) return outfit.nodes;

  if (!isWireframeDemoOutfit(outfit.id)) return [];

  return resolveOutfitWardrobeItems(outfit, wardrobeItems).map((item, index) => ({
    itemId: item.id,
    x: 50,
    y: 42 + index * 18,
    w: 62,
    h: 62,
    rotation: 0,
    z: index + 1,
  }));
}

export function resolveOutfitItemIds(outfit: Outfit, wardrobeItems: WardrobeItem[]): string[] {
  if (outfit.nodes.length > 0) return outfit.nodes.map((n) => n.itemId);
  return resolveOutfitWardrobeItems(outfit, wardrobeItems).map((it) => it.id);
}

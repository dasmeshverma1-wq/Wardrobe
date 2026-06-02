import { OUTFIT_PHOTOS } from '@/data/outfitCatalog';
import type { Category, Outfit } from '@/types';

export type WireframeOutfitPieceSpec = {
  image: string;
  name: string;
  brand?: string;
  category: Category;
};

type WireframeDemoOutfitDef = Outfit & {
  pieceSpecs: WireframeOutfitPieceSpec[];
};

const WIREFRAME_DEMO_OUTFIT_DEFS: WireframeDemoOutfitDef[] = [
  {
    id: 'wf-demo-resort',
    name: 'Resort weekend',
    mode: 'try-on',
    nodes: [],
    thumbnailDataUrl: OUTFIT_PHOTOS.f1Model,
    createdAt: 1,
    pieceSpecs: [
      {
        image: OUTFIT_PHOTOS.f1Top,
        name: 'Printed Crop Top',
        brand: 'Roadster',
        category: 'tops',
      },
      {
        image: OUTFIT_PHOTOS.f1Skirt,
        name: 'Pleated Midi Skirt',
        brand: 'Mango',
        category: 'bottoms',
      },
    ],
  },
  {
    id: 'wf-demo-city',
    name: 'City brunch',
    mode: 'try-on',
    nodes: [],
    thumbnailDataUrl: OUTFIT_PHOTOS.f2Model,
    createdAt: 2,
    pieceSpecs: [
      {
        image: OUTFIT_PHOTOS.f2Top,
        name: 'Relaxed Knit Top',
        brand: 'H&M',
        category: 'tops',
      },
      {
        image: OUTFIT_PHOTOS.f2Jeans,
        name: 'Classic Blue Jeans',
        brand: "Levi's",
        category: 'bottoms',
      },
    ],
  },
  {
    id: 'wf-demo-evening',
    name: 'Evening out',
    mode: 'try-on',
    nodes: [],
    thumbnailDataUrl: OUTFIT_PHOTOS.f3Model,
    createdAt: 3,
    pieceSpecs: [
      {
        image: OUTFIT_PHOTOS.f3Top,
        name: 'Ribbed Tank Top',
        brand: 'Forever 21',
        category: 'tops',
      },
      {
        image: OUTFIT_PHOTOS.f3Jeans,
        name: 'High-Rise Jeans',
        brand: 'Roadster',
        category: 'bottoms',
      },
    ],
  },
];

/** View-only outfits shown on Home when persona is "has photos" and the closet has none saved yet. */
export const WIREFRAME_DEMO_OUTFITS: Outfit[] = WIREFRAME_DEMO_OUTFIT_DEFS.map(
  ({ pieceSpecs: _pieceSpecs, ...outfit }) => outfit,
);

const DEMO_PIECES_BY_ID = Object.fromEntries(
  WIREFRAME_DEMO_OUTFIT_DEFS.map((def) => [def.id, def.pieceSpecs]),
) as Record<string, WireframeOutfitPieceSpec[]>;

export function isWireframeDemoOutfit(id: string): boolean {
  return id.startsWith('wf-demo-');
}

export function getWireframeDemoPieceSpecs(outfitId: string): WireframeOutfitPieceSpec[] {
  return DEMO_PIECES_BY_ID[outfitId] ?? [];
}

export function getWireframeDemoPieceCount(outfitId: string): number {
  return DEMO_PIECES_BY_ID[outfitId]?.length ?? 0;
}

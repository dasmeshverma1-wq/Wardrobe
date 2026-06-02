import { CREATOR_OUTFITS } from '@/data/creatorOutfits';
import { MYNTRA_SAMPLES } from '@/data/myntraSamples';
import type { WireframeOutfitPieceSpec } from '@/data/wireframeDemoOutfits';
import type { Category, Outfit } from '@/types';

const FLAT_LAY_DIR = '/seed-products/creator-rails/flat-lay';
const TRY_ON_DIR = '/seed-products/creator-rails/try-on';

const FLAT_LAY_FILES = [
  'b5d14e7f6e52a24d0c02dc28b88449d1.jpg',
  'f9ef25221be60e194333fbfab908ab48.jpg',
  'a8415f5dfa57890913a295a8c9212ae2.jpg',
  'd4f35e22a83d82d8e4fbdcfed0e31576.jpg',
  '4828386b5b87659a35cec3c9d3534cb1.jpg',
] as const;

const MODEL_FILES = [
  '40a8bd46b59c1f914ba1c7fb80df242f.jpg',
  '2de852583df1395f9d98964be1e49446.jpg',
  'fbd10ed1ec5d5cd6537f502639b53aca.jpg',
] as const;

const FLAT_LAY_TITLES = [
  'Weekend layers',
  'Neutral edit',
  'Soft tailoring',
  'City casual',
  'Holiday pack',
] as const;

const FLAT_LAY_CREATORS = [
  '@stylebyria',
  '@minimal.edit',
  '@closet.capsule',
  '@urbanweave',
  '@myntra.creators',
] as const;

const TRY_ON_TITLES = ['Sunset stroll', 'Street style', 'Evening edit'] as const;

const TRY_ON_CREATORS = ['@myntra.ai', '@tryon.studio', '@looklab'];

/** Maps model-hero looks to Discover creator items for try-on garment cutouts. */
const TRY_ON_DISCOVER_IDS = ['co-import-f1', 'co-import-f2', 'co-import-f3'] as const;

export type HomeRailOutfitDef = Outfit & {
  creator: string;
  pieceSpecs: WireframeOutfitPieceSpec[];
  /** Creator discover outfit — powers AI try-on garment list. */
  discoverOutfitId?: string;
};

function pieceBundle(index: number): WireframeOutfitPieceSpec[] {
  const slice = MYNTRA_SAMPLES.slice(index, index + 4);
  return slice.map((s) => ({
    image: s.image,
    name: s.name,
    brand: s.brand,
    category: s.category,
  }));
}

function buildFlatLayOutfits(): HomeRailOutfitDef[] {
  return FLAT_LAY_FILES.map((file, i) => ({
    id: `home-fl-${i + 1}`,
    name: FLAT_LAY_TITLES[i] ?? `Creator look ${i + 1}`,
    creator: FLAT_LAY_CREATORS[i] ?? '@myntra.creators',
    mode: 'dressing-room' as const,
    nodes: [],
    thumbnailDataUrl: `${FLAT_LAY_DIR}/${file}`,
    createdAt: 100 + i,
    pieceSpecs: pieceBundle(i * 2),
  }));
}

function buildTryOnOutfits(): HomeRailOutfitDef[] {
  return MODEL_FILES.map((file, i) => {
    const discoverId = TRY_ON_DISCOVER_IDS[i % TRY_ON_DISCOVER_IDS.length];
    const discover = CREATOR_OUTFITS.find((o) => o.id === discoverId);
    const pieceSpecs: WireframeOutfitPieceSpec[] =
      discover?.items.map((it) => ({
        image: it.image,
        name: it.name,
        brand: it.brand,
        category: it.category as Category,
      })) ?? pieceBundle(i);

    return {
      id: `home-ai-${i + 1}`,
      name: TRY_ON_TITLES[i] ?? `AI look ${i + 1}`,
      creator: TRY_ON_CREATORS[i] ?? '@myntra.ai',
      mode: 'try-on' as const,
      nodes: [],
      thumbnailDataUrl: `${TRY_ON_DIR}/${file}`,
      createdAt: 200 + i,
      discoverOutfitId: discoverId,
      pieceSpecs,
    };
  });
}

export const HOME_FLAT_LAY_OUTFITS = buildFlatLayOutfits();
export const HOME_TRY_ON_OUTFITS = buildTryOnOutfits();

const BY_ID = Object.fromEntries(
  [...HOME_FLAT_LAY_OUTFITS, ...HOME_TRY_ON_OUTFITS].map((o) => [o.id, o]),
) as Record<string, HomeRailOutfitDef>;

export function isHomeRailOutfit(id: string): boolean {
  return id.startsWith('home-fl-') || id.startsWith('home-ai-');
}

export function getHomeRailOutfit(id: string): HomeRailOutfitDef | undefined {
  return BY_ID[id];
}

export function homeRailToOutfit(def: HomeRailOutfitDef): Outfit {
  const { pieceSpecs: _p, creator: _c, discoverOutfitId: _d, ...outfit } = def;
  return outfit;
}

export function getHomeRailPieceSpecs(outfitId: string): WireframeOutfitPieceSpec[] {
  return BY_ID[outfitId]?.pieceSpecs ?? [];
}

export function getHomeRailDiscoverId(outfitId: string): string | undefined {
  return BY_ID[outfitId]?.discoverOutfitId;
}

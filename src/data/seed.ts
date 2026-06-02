import type { WardrobeItem } from '@/types';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { SEED_PHOTOS } from './seedImages';

type SeedSpec = {
  category: WardrobeItem['category'];
  image: string;
  name: string;
  brand?: string;
  dominantColor?: string;
  material?: WardrobeItem['material'];
};

/**
 * Full starter catalog — every entry is a real photo from `public/seed-products/`.
 * New installs seed the whole list; existing closets receive missing items via
 * `syncSeedCatalog()` on the next app load.
 */
const SEEDS: SeedSpec[] = [
  // Tops
  { category: 'tops', image: SEED_PHOTOS.blackTee, name: 'Cotton Crew Tee', brand: 'Roadster', dominantColor: '#1B1C20', material: 'cotton' },
  { category: 'tops', image: SEED_PHOTOS.beigeHoodie, name: 'Sand Pullover Hoodie', brand: 'H&M', dominantColor: '#D9C7A0', material: 'cotton' },
  { category: 'tops', image: SEED_PHOTOS.whiteCropTop, name: 'Ribbed Crop Top', brand: 'Mango', dominantColor: '#F5F0E5', material: 'cotton' },
  { category: 'tops', image: SEED_PHOTOS.kimonoCropTop, name: 'Kimono-style Crop Top', brand: 'Forever 21', dominantColor: '#E8B5C4', material: 'silk' },
  { category: 'tops', image: SEED_PHOTOS.dressShirt, name: 'Classic Dress Shirt', brand: 'Marks & Spencer', dominantColor: '#FAFBFC', material: 'cotton' },
  { category: 'tops', image: SEED_PHOTOS.whiteBlouse, name: 'Classic White Blouse', brand: 'Marks & Spencer', dominantColor: '#FAFBFC', material: 'cotton' },
  { category: 'tops', image: SEED_PHOTOS.redShirt, name: 'Red Cotton Shirt', brand: 'Roadster', dominantColor: '#C41E2A', material: 'cotton' },
  { category: 'tops', image: SEED_PHOTOS.linenBeachShirt, name: 'Linen Beach Shirt', brand: 'Roadster', dominantColor: '#E8E4DC', material: 'cotton' },
  { category: 'tops', image: SEED_PHOTOS.whiteLinenShirt, name: 'White Linen Shirt', brand: 'H&M', dominantColor: '#FAFBFC', material: 'cotton' },
  { category: 'tops', image: SEED_PHOTOS.hawaiianShirt, name: 'Floral Hawaiian Shirt', brand: 'Roadster', dominantColor: '#2E8B57', material: 'cotton' },
  { category: 'tops', image: SEED_PHOTOS.elegantTop, name: 'Elegant Wrap Top', brand: 'Mango', dominantColor: '#E8E4DC', material: 'silk' },
  { category: 'tops', image: SEED_PHOTOS.f1Top, name: 'Printed Crop Top', brand: 'Roadster', dominantColor: '#E8B5C4', material: 'cotton' },
  { category: 'tops', image: SEED_PHOTOS.f2Top, name: 'Relaxed Knit Top', brand: 'H&M', dominantColor: '#7F8285', material: 'cotton' },
  { category: 'tops', image: SEED_PHOTOS.f3Top, name: 'Ribbed Tank Top', brand: 'Forever 21', dominantColor: '#1B1C20', material: 'cotton' },
  { category: 'tops', image: SEED_PHOTOS.m1Shirt, name: 'Oxford Cotton Shirt', brand: 'Marks & Spencer', dominantColor: '#FAFBFC', material: 'cotton' },
  { category: 'tops', image: SEED_PHOTOS.greenTopFemale, name: 'Olive Knit Top', brand: 'Roadster', dominantColor: '#5C6647', material: 'cotton' },

  // Bottoms
  { category: 'bottoms', image: SEED_PHOTOS.blackJeans, name: 'Slim-Fit Black Jeans', brand: "Levi's", dominantColor: '#1B1C20', material: 'denim' },
  { category: 'bottoms', image: SEED_PHOTOS.blueJeans, name: 'Classic Blue Jeans', brand: "Levi's", dominantColor: '#4A6B8F', material: 'denim' },
  { category: 'bottoms', image: SEED_PHOTOS.blueJeansFaded, name: 'Faded Blue Jeans', brand: 'Wrangler', dominantColor: '#6B8FAF', material: 'denim' },
  { category: 'bottoms', image: SEED_PHOTOS.whiteJoggers, name: 'Off-White Joggers', brand: 'Adidas', dominantColor: '#F4F4F5', material: 'cotton' },
  { category: 'bottoms', image: SEED_PHOTOS.greyJoggers, name: 'Stone Grey Joggers', brand: 'Nike', dominantColor: '#7F8285', material: 'cotton' },
  { category: 'bottoms', image: SEED_PHOTOS.swimShorts, name: 'Riviera Swim Shorts', brand: 'Decathlon', dominantColor: '#1F4F7A', material: 'other' },
  { category: 'bottoms', image: SEED_PHOTOS.khakiChinos, name: 'Khaki Chino Pants', brand: 'Roadster', dominantColor: '#B8A88A', material: 'cotton' },
  { category: 'bottoms', image: SEED_PHOTOS.khakiPants, name: 'Khaki Casual Pants', brand: 'Roadster', dominantColor: '#B8A88A', material: 'cotton' },
  { category: 'bottoms', image: SEED_PHOTOS.greenShorts, name: 'Green Casual Shorts', brand: 'Decathlon', dominantColor: '#5C8A5C', material: 'cotton' },
  { category: 'bottoms', image: SEED_PHOTOS.denimShortsRipped, name: 'Ripped Denim Shorts', brand: 'H&M', dominantColor: '#4A6B8F', material: 'denim' },
  { category: 'bottoms', image: SEED_PHOTOS.orangeSwimShorts, name: 'Orange Swim Shorts', brand: 'Decathlon', dominantColor: '#E86A2C', material: 'other' },
  { category: 'bottoms', image: SEED_PHOTOS.blueSwimShorts, name: 'Blue Swim Shorts', brand: 'Decathlon', dominantColor: '#1F4F7A', material: 'other' },
  { category: 'bottoms', image: SEED_PHOTOS.yellowShorts, name: 'Yellow Belted Shorts', brand: 'Roadster', dominantColor: '#E8C840', material: 'cotton' },
  { category: 'bottoms', image: SEED_PHOTOS.greenDrawstringShorts, name: 'Green Drawstring Shorts', brand: 'Decathlon', dominantColor: '#5C8A5C', material: 'cotton' },
  { category: 'bottoms', image: SEED_PHOTOS.whiteBottomFemale, name: 'White Wide-Leg Trousers', brand: 'Mango', dominantColor: '#FAFBFC', material: 'cotton' },
  { category: 'bottoms', image: SEED_PHOTOS.f1Skirt, name: 'Pleated Midi Skirt', brand: 'Mango', dominantColor: '#FAFBFC', material: 'cotton' },
  { category: 'bottoms', image: SEED_PHOTOS.f2Jeans, name: 'Relaxed Fit Jeans', brand: "Levi's", dominantColor: '#4A6B8F', material: 'denim' },
  { category: 'bottoms', image: SEED_PHOTOS.f3Jeans, name: 'High-Rise Jeans', brand: 'Roadster', dominantColor: '#4A6B8F', material: 'denim' },
  { category: 'bottoms', image: SEED_PHOTOS.m1Pants, name: 'Tailored Chinos', brand: 'Roadster', dominantColor: '#B8A88A', material: 'cotton' },

  // Outerwear
  { category: 'outerwear', image: SEED_PHOTOS.greenDenimJacket, name: 'Army Green Denim Jacket', brand: 'Wrangler', dominantColor: '#5C6647', material: 'denim' },

  // Hats
  { category: 'accessories', image: SEED_PHOTOS.strawHat, name: 'Wide-Brim Straw Hat', brand: 'Accessorize', dominantColor: '#D4B97A', material: 'other' },
  { category: 'accessories', image: SEED_PHOTOS.detectiveHat, name: 'Felt Detective Hat', brand: 'Forever 21', dominantColor: '#3A3A3A', material: 'wool' },
  { category: 'accessories', image: SEED_PHOTOS.blueCap, name: 'Cobalt Snapback Cap', brand: 'Puma', dominantColor: '#1B5BC9', material: 'cotton' },
  { category: 'accessories', image: SEED_PHOTOS.brownFeltHat, name: 'Brown Felt Hat', brand: 'Accessorize', dominantColor: '#5B4630', material: 'wool' },
  { category: 'accessories', image: SEED_PHOTOS.blueBeanie, name: 'Blue Knit Beanie', brand: 'Roadster', dominantColor: '#1B5BC9', material: 'wool' },
  { category: 'accessories', image: SEED_PHOTOS.yellowBucketHat, name: 'Yellow Bucket Hat', brand: 'Accessorize', dominantColor: '#E8C840', material: 'cotton' },
  { category: 'accessories', image: SEED_PHOTOS.purpleCap, name: 'Purple Sports Cap', brand: 'Puma', dominantColor: '#6E5DC6', material: 'cotton' },
  { category: 'accessories', image: SEED_PHOTOS.redCap, name: 'Red Baseball Cap', brand: 'Puma', dominantColor: '#C41E2A', material: 'cotton' },
  { category: 'accessories', image: SEED_PHOTOS.canvasBucketHat, name: 'Canvas Bucket Hat', brand: 'Forever 21', dominantColor: '#D4CFC4', material: 'cotton' },
  { category: 'accessories', image: SEED_PHOTOS.greenBucketHat, name: 'Green Bucket Hat', brand: 'Roadster', dominantColor: '#5C6647', material: 'cotton' },

  // Eyewear
  { category: 'accessories', image: SEED_PHOTOS.blackSunglasses, name: 'Black Frame Sunglasses', brand: 'Ray-Ban', dominantColor: '#1B1C20', material: 'other' },
  { category: 'accessories', image: SEED_PHOTOS.roundEyeglasses, name: 'Round Metal Eyeglasses', brand: 'Vincent Chase', dominantColor: '#1B1C20', material: 'other' },
  { category: 'accessories', image: SEED_PHOTOS.sunglassesBlackRim, name: 'Black Rim Sunglasses', brand: 'Ray-Ban', dominantColor: '#1B1C20', material: 'other' },
  { category: 'accessories', image: SEED_PHOTOS.colorfulSunglasses, name: 'Color Lens Sunglasses', brand: 'Vincent Chase', dominantColor: '#E8A040', material: 'other' },

  // Footwear
  { category: 'footwear', image: SEED_PHOTOS.colorfulSportsShoes, name: 'Colorful Sports Sneakers', brand: 'Puma', dominantColor: '#E86A2C', material: 'other' },
  { category: 'footwear', image: SEED_PHOTOS.casualLeatherShoes, name: 'Casual Leather Loafers', brand: 'Clarks', dominantColor: '#5B4630', material: 'leather' },
  { category: 'footwear', image: SEED_PHOTOS.fashionShoes, name: 'Fashion Sneakers', brand: 'Adidas', dominantColor: '#FAFBFC', material: 'other' },
  { category: 'footwear', image: SEED_PHOTOS.clothShoes, name: 'Canvas Slip-Ons', brand: 'Vans', dominantColor: '#D4CFC4', material: 'canvas' },
  { category: 'footwear', image: SEED_PHOTOS.brownFormalShoes, name: 'Brown Formal Oxfords', brand: 'Bata', dominantColor: '#5B4630', material: 'leather' },
  { category: 'footwear', image: SEED_PHOTOS.shoes3d, name: 'Classic White Sneakers', brand: 'Puma', dominantColor: '#FAFBFC', material: 'other' },
  { category: 'footwear', image: SEED_PHOTOS.whiteSneakers, name: 'Court Sneakers', brand: 'Reebok', dominantColor: '#FAFBFC', material: 'other' },
  { category: 'footwear', image: SEED_PHOTOS.colorfulSandals, name: 'Vibrant Summer Sandals', brand: 'Roadster', dominantColor: '#E86A2C', material: 'other' },
  { category: 'footwear', image: SEED_PHOTOS.contemporarySandals, name: 'Leather Strap Sandals', brand: 'H&M', dominantColor: '#D4CFC4', material: 'leather' },
  { category: 'footwear', image: SEED_PHOTOS.vintageBrownSandals, name: 'Vintage Brown Sandals', brand: 'Accessorize', dominantColor: '#8B5A2B', material: 'leather' },
  { category: 'footwear', image: SEED_PHOTOS.purpleFootwearFemale, name: 'Purple Strap Heels', brand: 'Roadster', dominantColor: '#6E5DC6', material: 'leather' },
  { category: 'footwear', image: SEED_PHOTOS.m1Shoes, name: 'Leather Sneakers', brand: 'Clarks', dominantColor: '#5B4630', material: 'leather' },
  { category: 'footwear', image: '/seed-products/strap_sandals_shoes.png', name: 'Purple Strap Sandals', brand: 'Myntra Pick', dominantColor: '#6E5DC6', material: 'leather' },

  // Bags
  { category: 'bags', image: SEED_PHOTOS.blackBag, name: 'Black Crossbody Bag', brand: 'Lavie', dominantColor: '#1B1C20', material: 'leather' },
  { category: 'bags', image: SEED_PHOTOS.brownLeatherHandbag, name: 'Brown Leather Handbag', brand: 'Hidesign', dominantColor: '#8B5A2B', material: 'leather' },
];

const SEEDED_FLAG_KEY = 'myntra-wardrobe/v1/seeded:v10';
const CATALOG_SYNC_KEY = 'myntra-wardrobe/v1/catalog-sync:v10';

const DEPRECATED_SEED_NAMES = new Set([
  'Red Pump Heels',
  'Tan Vegan Tote',
  'Brown Strap Sandals',
  'Khaki Casual Trousers',
  'Linen Blend Shirt',
  'Red Polka Dot Dress',
  'Floral Midi Dress',
]);

let seedInFlight: Promise<void> | null = null;

function isBundledPhoto(url: string): boolean {
  return url.startsWith('/seed-products/');
}

function seedItemKey(it: WardrobeItem): string {
  return `${it.category}::${it.name ?? ''}`;
}

/** Prefer bundled PNGs over legacy inline SVG placeholders. */
function seedItemRank(it: WardrobeItem): number {
  let score = 0;
  if (isBundledPhoto(it.thumbnailDataUrl)) score += 10;
  if (it.brand) score += 1;
  return score;
}

function catalogHasItem(items: WardrobeItem[], spec: SeedSpec): boolean {
  return items.some(
    (it) =>
      it.source === 'seed' &&
      (it.thumbnailDataUrl === spec.image ||
        (it.name === spec.name && it.category === spec.category)),
  );
}

async function addSeedSpec(spec: SeedSpec): Promise<void> {
  await useWardrobeStore.getState().addItem({
    category: spec.category,
    source: 'seed',
    dataUrl: spec.image,
    thumbnailDataUrl: spec.image,
    name: spec.name,
    brand: spec.brand,
    dominantColor: spec.dominantColor,
    material: spec.material,
  });
}

export async function seedWardrobeIfEmpty(): Promise<void> {
  if (seedInFlight) return seedInFlight;
  seedInFlight = (async () => {
    const store = useWardrobeStore.getState();
    store.hydrate();
    if (store.items.length > 0) return;
    if (localStorage.getItem(SEEDED_FLAG_KEY) === '1') return;

    for (const s of SEEDS) {
      await addSeedSpec(s);
    }
    localStorage.setItem(SEEDED_FLAG_KEY, '1');
    localStorage.setItem(CATALOG_SYNC_KEY, '1');
  })();
  try {
    await seedInFlight;
  } finally {
    seedInFlight = null;
  }
}

/** Adds any catalog photos missing from an existing closet (one-time per version). */
export async function syncSeedCatalog(): Promise<void> {
  if (localStorage.getItem(CATALOG_SYNC_KEY) === '1') return;
  useWardrobeStore.getState().hydrate();

  for (const s of SEEDS) {
    const items = useWardrobeStore.getState().items;
    if (!catalogHasItem(items, s)) {
      await addSeedSpec(s);
    }
  }
  localStorage.setItem(CATALOG_SYNC_KEY, '1');
}

export async function dedupeSeedItems(): Promise<void> {
  useWardrobeStore.getState().hydrate();

  const items = useWardrobeStore.getState().items;
  const groups = new Map<string, WardrobeItem[]>();

  for (const it of items) {
    if (it.source !== 'seed') continue;
    if (DEPRECATED_SEED_NAMES.has(it.name ?? '')) continue;
    const key = seedItemKey(it);
    const list = groups.get(key) ?? [];
    list.push(it);
    groups.set(key, list);
  }

  const removeIds = new Set<string>();

  for (const it of items) {
    if (it.source === 'seed' && DEPRECATED_SEED_NAMES.has(it.name ?? '')) {
      removeIds.add(it.id);
    }
  }

  for (const group of groups.values()) {
    if (group.length <= 1) continue;
    const sorted = [...group].sort((a, b) => {
      const rank = seedItemRank(b) - seedItemRank(a);
      if (rank !== 0) return rank;
      return (b.addedAt ?? 0) - (a.addedAt ?? 0);
    });
    for (const dup of sorted.slice(1)) {
      removeIds.add(dup.id);
    }
  }

  // Same bundled image linked twice under different names (legacy sync bug).
  const byThumb = new Map<string, WardrobeItem[]>();
  for (const it of items) {
    if (it.source !== 'seed' || removeIds.has(it.id)) continue;
    if (!isBundledPhoto(it.thumbnailDataUrl)) continue;
    const list = byThumb.get(it.thumbnailDataUrl) ?? [];
    list.push(it);
    byThumb.set(it.thumbnailDataUrl, list);
  }
  for (const group of byThumb.values()) {
    if (group.length <= 1) continue;
    const sorted = [...group].sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0));
    for (const dup of sorted.slice(1)) {
      removeIds.add(dup.id);
    }
  }

  for (const id of removeIds) {
    await useWardrobeStore.getState().removeItem(id);
  }
}

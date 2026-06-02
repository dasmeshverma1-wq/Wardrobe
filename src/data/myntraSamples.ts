import type { Category, MaterialTag } from '@/types';
import { SEED_PHOTOS } from './seedImages';

/**
 * Pretend "Past Purchases" from Myntra. In a real integration this would be a feed call.
 * Each item has a fake productId we keep on the WardrobeItem to enable future
 * Complete-the-Look recommendations.
 */

export type MyntraSample = {
  productId: string;
  name: string;
  brand: string;
  image: string;
  category: Category;
  material?: MaterialTag;
  dominantColor: string;
  pricePaise: number;
  purchasedOn: string;
};

export const MYNTRA_SAMPLES: MyntraSample[] = [
  {
    productId: 'mnt-2401',
    name: 'Khaki Chino Pants',
    brand: 'HERE&NOW',
    image: SEED_PHOTOS.khakiChinos,
    category: 'bottoms',
    material: 'cotton',
    dominantColor: '#B8A88A',
    pricePaise: 199900,
    purchasedOn: '2026-05-08',
  },
  {
    productId: 'mnt-2402',
    name: 'Classic White Blouse',
    brand: 'Roadster',
    image: SEED_PHOTOS.whiteBlouse,
    category: 'tops',
    material: 'cotton',
    dominantColor: '#FFFFFF',
    pricePaise: 79900,
    purchasedOn: '2026-05-08',
  },
  {
    productId: 'mnt-2403',
    name: 'Army Green Denim Jacket',
    brand: 'Marks & Spencer',
    image: SEED_PHOTOS.greenDenimJacket,
    category: 'outerwear',
    material: 'denim',
    dominantColor: '#5C6647',
    pricePaise: 449900,
    purchasedOn: '2026-04-29',
  },
  {
    productId: 'mnt-2404',
    name: 'Red Baseball Cap',
    brand: 'Puma',
    image: SEED_PHOTOS.redCap,
    category: 'accessories',
    material: 'cotton',
    dominantColor: '#C41E2A',
    pricePaise: 99900,
    purchasedOn: '2026-04-12',
  },
  {
    productId: 'mnt-2405',
    name: 'Classic Blue Jeans',
    brand: "Levi's",
    image: SEED_PHOTOS.blueJeans,
    category: 'bottoms',
    material: 'denim',
    dominantColor: '#4A6B8F',
    pricePaise: 289900,
    purchasedOn: '2026-03-30',
  },
  {
    productId: 'mnt-2406',
    name: 'Black Frame Sunglasses',
    brand: 'Ray-Ban',
    image: SEED_PHOTOS.sunglassesBlackRim,
    category: 'accessories',
    material: 'other',
    dominantColor: '#282C3F',
    pricePaise: 899900,
    purchasedOn: '2026-03-18',
  },
  {
    productId: 'mnt-2501',
    name: 'Printed Crop Top',
    brand: 'Roadster',
    image: SEED_PHOTOS.f1Top,
    category: 'tops',
    material: 'cotton',
    dominantColor: '#E8B5C4',
    pricePaise: 129900,
    purchasedOn: '2026-06-01',
  },
  {
    productId: 'mnt-2502',
    name: 'Pleated Midi Skirt',
    brand: 'Mango',
    image: SEED_PHOTOS.f1Skirt,
    category: 'bottoms',
    material: 'cotton',
    dominantColor: '#FAFBFC',
    pricePaise: 189900,
    purchasedOn: '2026-06-01',
  },
  {
    productId: 'mnt-2503',
    name: 'Olive Knit Top',
    brand: 'Roadster',
    image: SEED_PHOTOS.greenTopFemale,
    category: 'tops',
    material: 'cotton',
    dominantColor: '#5C6647',
    pricePaise: 149900,
    purchasedOn: '2026-06-01',
  },
  {
    productId: 'mnt-2504',
    name: 'White Wide-Leg Trousers',
    brand: 'Mango',
    image: SEED_PHOTOS.whiteBottomFemale,
    category: 'bottoms',
    material: 'cotton',
    dominantColor: '#FAFBFC',
    pricePaise: 219900,
    purchasedOn: '2026-06-01',
  },
  {
    productId: 'mnt-2505',
    name: 'Purple Strap Heels',
    brand: 'Roadster',
    image: SEED_PHOTOS.purpleFootwearFemale,
    category: 'footwear',
    material: 'leather',
    dominantColor: '#6E5DC6',
    pricePaise: 249900,
    purchasedOn: '2026-06-01',
  },
  {
    productId: 'mnt-2506',
    name: 'Oxford Cotton Shirt',
    brand: 'Marks & Spencer',
    image: SEED_PHOTOS.m1Shirt,
    category: 'tops',
    material: 'cotton',
    dominantColor: '#FAFBFC',
    pricePaise: 179900,
    purchasedOn: '2026-06-01',
  },
];

export function formatRupees(paise: number): string {
  return `\u20B9${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

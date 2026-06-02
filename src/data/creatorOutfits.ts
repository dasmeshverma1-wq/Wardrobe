import type { Category, MaterialTag } from '@/types';
import { isEyewearAccessory } from '@/components/studio/MannequinZones';
import { SEED_PHOTOS } from './seedImages';

export type CreatorBadge = 'myntra' | 'creator';

export type CreatorItem = {
  productId: string;
  name: string;
  brand: string;
  image: string;
  category: Category;
  material?: MaterialTag;
  dominantColor: string;
  pricePaise: number;
  slot: { x: number; y: number; size: number; rotate?: number; z?: number };
};

export type CreatorOutfit = {
  id: string;
  title: string;
  creator: string;
  badge: CreatorBadge;
  occasion: string;
  surface: 'cream' | 'mint' | 'sky' | 'blush' | 'sand' | 'ivory' | 'stone';
  /** Full-bleed model photo for Discover card hero (flat-lay items still power try-on/bag). */
  heroImage?: string;
  items: CreatorItem[];
};

export const SURFACE_GRADIENT: Record<CreatorOutfit['surface'], string> = {
  cream: 'linear-gradient(160deg, #FBFAF8 0%, #F2EFEA 100%)',
  mint: 'linear-gradient(160deg, #F1F9F4 0%, #E3F1E9 100%)',
  sky: 'linear-gradient(160deg, #F0F5FC 0%, #E2ECF8 100%)',
  blush: 'linear-gradient(160deg, #FFF4F7 0%, #FCE4EC 100%)',
  sand: 'linear-gradient(160deg, #FAF7F1 0%, #F0E9DC 100%)',
  ivory: 'linear-gradient(160deg, #FBFAF7 0%, #F1EEE8 100%)',
  stone: 'linear-gradient(160deg, #F7F7F8 0%, #ECECEF 100%)',
};

/** Centred mannequin flat-lay — x/y are anchor centres (50 = card midline). */
const SLOT = {
  hat: { x: 50, y: 13, size: 36, z: 5 },
  glasses: { x: 50, y: 21, size: 30, z: 6 },
  top: { x: 50, y: 42, size: 62, z: 2 },
  outer: { x: 50, y: 40, size: 66, z: 2 },
  bottom: { x: 50, y: 59, size: 56, z: 1 },
  dress: { x: 50, y: 46, size: 68, z: 2 },
} as const;

function accSlot(name: string) {
  return isEyewearAccessory(name) ? SLOT.glasses : SLOT.hat;
}

type ItemSpec = Omit<CreatorItem, 'slot'> & { slot?: CreatorItem['slot'] };

function withSlots(specs: ItemSpec[]): CreatorItem[] {
  return specs.map((s) => ({
    ...s,
    slot:
      s.slot ??
      (s.category === 'accessories'
        ? accSlot(s.name)
        : s.category === 'outerwear'
        ? SLOT.outer
        : s.category === 'dresses'
        ? SLOT.dress
        : s.category === 'bottoms'
        ? SLOT.bottom
        : SLOT.top),
  }));
}

export { withSlots };

import { OUTFIT_PHOTOS } from './outfitCatalog';

export const CREATOR_OUTFITS: CreatorOutfit[] = [
  {
    id: 'co-import-f1',
    title: 'Soft Skirt Edit',
    creator: 'Myntra Studio',
    badge: 'myntra',
    occasion: 'Brunch · Day',
    surface: 'blush',
    heroImage: OUTFIT_PHOTOS.f1Model,
    items: withSlots([
      {
        productId: 'imp-f1-top',
        name: 'Printed Crop Top',
        brand: 'Roadster',
        image: OUTFIT_PHOTOS.f1Top,
        category: 'tops',
        material: 'cotton',
        dominantColor: '#E8B5C4',
        pricePaise: 129900,
      },
      {
        productId: 'imp-f1-skirt',
        name: 'Pleated Midi Skirt',
        brand: 'Mango',
        image: OUTFIT_PHOTOS.f1Skirt,
        category: 'bottoms',
        material: 'cotton',
        dominantColor: '#FAFBFC',
        pricePaise: 189900,
      },
    ]),
  },
  {
    id: 'co-import-f2',
    title: 'Denim & Knit',
    creator: 'Myntra Studio',
    badge: 'myntra',
    occasion: 'Casual · Weekend',
    surface: 'sky',
    heroImage: OUTFIT_PHOTOS.f2Model,
    items: withSlots([
      {
        productId: 'imp-f2-top',
        name: 'Relaxed Knit Top',
        brand: 'H&M',
        image: OUTFIT_PHOTOS.f2Top,
        category: 'tops',
        material: 'cotton',
        dominantColor: '#7F8285',
        pricePaise: 99900,
      },
      {
        productId: 'imp-f2-jeans',
        name: 'Classic Blue Jeans',
        brand: "Levi's",
        image: OUTFIT_PHOTOS.f2Jeans,
        category: 'bottoms',
        material: 'denim',
        dominantColor: '#4A6B8F',
        pricePaise: 249900,
      },
    ]),
  },
  {
    id: 'co-import-f3',
    title: 'City Casual',
    creator: '@meera.minimal',
    badge: 'creator',
    occasion: 'Day · Evening',
    surface: 'stone',
    heroImage: OUTFIT_PHOTOS.f3Model,
    items: withSlots([
      {
        productId: 'imp-f3-top',
        name: 'Ribbed Tank Top',
        brand: 'Forever 21',
        image: OUTFIT_PHOTOS.f3Top,
        category: 'tops',
        material: 'cotton',
        dominantColor: '#1B1C20',
        pricePaise: 79900,
      },
      {
        productId: 'imp-f3-jeans',
        name: 'High-Rise Jeans',
        brand: 'Roadster',
        image: OUTFIT_PHOTOS.f3Jeans,
        category: 'bottoms',
        material: 'denim',
        dominantColor: '#4A6B8F',
        pricePaise: 219900,
      },
    ]),
  },
  {
    id: 'co-import-m1',
    title: 'Smart Weekend',
    creator: 'Myntra Studio',
    badge: 'myntra',
    occasion: 'Work · Casual',
    surface: 'ivory',
    heroImage: OUTFIT_PHOTOS.m1Model,
    items: withSlots([
      {
        productId: 'imp-m1-shirt',
        name: 'Oxford Cotton Shirt',
        brand: 'Marks & Spencer',
        image: OUTFIT_PHOTOS.m1Shirt,
        category: 'tops',
        material: 'cotton',
        dominantColor: '#FAFBFC',
        pricePaise: 179900,
      },
      {
        productId: 'imp-m1-pants',
        name: 'Tailored Chinos',
        brand: 'Roadster',
        image: OUTFIT_PHOTOS.m1Pants,
        category: 'bottoms',
        material: 'cotton',
        dominantColor: '#B8A88A',
        pricePaise: 199900,
      },
      {
        productId: 'imp-m1-shoes',
        name: 'Leather Sneakers',
        brand: 'Clarks',
        image: OUTFIT_PHOTOS.m1Shoes,
        category: 'footwear',
        material: 'leather',
        dominantColor: '#5B4630',
        pricePaise: 349900,
      },
    ]),
  },
  {
    id: 'co-mono-1',
    title: 'Monochrome Edit',
    creator: 'Myntra Studio',
    badge: 'myntra',
    occasion: 'Office · Evening',
    surface: 'stone',
    items: withSlots([
      {
        productId: 'p-black-tee',
        name: 'Cotton Crew Tee',
        brand: 'Roadster',
        image: SEED_PHOTOS.blackTee,
        category: 'tops',
        material: 'cotton',
        dominantColor: '#1B1C20',
        pricePaise: 79900,
      },
      {
        productId: 'p-black-jeans',
        name: 'Slim-Fit Black Jeans',
        brand: "Levi's",
        image: SEED_PHOTOS.blackJeans,
        category: 'bottoms',
        material: 'denim',
        dominantColor: '#1B1C20',
        pricePaise: 249900,
      },
      {
        productId: 'p-sunglasses-rim',
        name: 'Black Frame Sunglasses',
        brand: 'Ray-Ban',
        image: SEED_PHOTOS.sunglassesBlackRim,
        category: 'accessories',
        material: 'other',
        dominantColor: '#1B1C20',
        pricePaise: 749900,
      },
      {
        productId: 'p-brown-felt',
        name: 'Brown Felt Hat',
        brand: 'Accessorize',
        image: SEED_PHOTOS.brownFeltHat,
        category: 'accessories',
        material: 'wool',
        dominantColor: '#5B4630',
        pricePaise: 189900,
      },
    ]),
  },
  {
    id: 'co-offduty-1',
    title: 'Off-Duty',
    creator: '@dev.styles',
    badge: 'creator',
    occasion: 'Casual · Weekend',
    surface: 'sky',
    items: withSlots([
      {
        productId: 'p-beige-hoodie',
        name: 'Sand Pullover Hoodie',
        brand: 'H&M',
        image: SEED_PHOTOS.beigeHoodie,
        category: 'tops',
        material: 'cotton',
        dominantColor: '#D9C7A0',
        pricePaise: 149900,
      },
      {
        productId: 'p-grey-joggers',
        name: 'Stone Grey Joggers',
        brand: 'Nike',
        image: SEED_PHOTOS.greyJoggers,
        category: 'bottoms',
        material: 'cotton',
        dominantColor: '#7F8285',
        pricePaise: 199900,
      },
      {
        productId: 'p-red-cap',
        name: 'Red Baseball Cap',
        brand: 'Puma',
        image: SEED_PHOTOS.redCap,
        category: 'accessories',
        material: 'cotton',
        dominantColor: '#C41E2A',
        pricePaise: 99900,
      },
      {
        productId: 'p-color-sun',
        name: 'Color Lens Sunglasses',
        brand: 'Vincent Chase',
        image: SEED_PHOTOS.colorfulSunglasses,
        category: 'accessories',
        material: 'other',
        dominantColor: '#E8A040',
        pricePaise: 129900,
      },
    ]),
  },
  {
    id: 'co-smart-1',
    title: 'Smart Casual',
    creator: 'Myntra Studio',
    badge: 'myntra',
    occasion: 'Work · Day',
    surface: 'ivory',
    items: withSlots([
      {
        productId: 'p-white-blouse',
        name: 'Classic White Blouse',
        brand: 'Marks & Spencer',
        image: SEED_PHOTOS.whiteBlouse,
        category: 'tops',
        material: 'cotton',
        dominantColor: '#FAFBFC',
        pricePaise: 179900,
      },
      {
        productId: 'p-khaki-chinos',
        name: 'Khaki Chino Pants',
        brand: 'Roadster',
        image: SEED_PHOTOS.khakiChinos,
        category: 'bottoms',
        material: 'cotton',
        dominantColor: '#B8A88A',
        pricePaise: 219900,
      },
      {
        productId: 'p-round-glasses',
        name: 'Round Metal Eyeglasses',
        brand: 'Vincent Chase',
        image: SEED_PHOTOS.roundEyeglasses,
        category: 'accessories',
        material: 'other',
        dominantColor: '#1B1C20',
        pricePaise: 149900,
      },
      {
        productId: 'p-canvas-hat',
        name: 'Canvas Bucket Hat',
        brand: 'Forever 21',
        image: SEED_PHOTOS.canvasBucketHat,
        category: 'accessories',
        material: 'cotton',
        dominantColor: '#D4CFC4',
        pricePaise: 119900,
      },
    ]),
  },
  {
    id: 'co-resort-1',
    title: 'Resort Ready',
    creator: '@anika.style',
    badge: 'creator',
    occasion: 'Vacation · Day',
    surface: 'blush',
    items: withSlots([
      {
        productId: 'p-hawaiian',
        name: 'Floral Hawaiian Shirt',
        brand: 'Roadster',
        image: SEED_PHOTOS.hawaiianShirt,
        category: 'tops',
        material: 'cotton',
        dominantColor: '#2E8B57',
        pricePaise: 169900,
      },
      {
        productId: 'p-orange-swim',
        name: 'Orange Swim Shorts',
        brand: 'Decathlon',
        image: SEED_PHOTOS.orangeSwimShorts,
        category: 'bottoms',
        material: 'other',
        dominantColor: '#E86A2C',
        pricePaise: 129900,
      },
      {
        productId: 'p-straw-hat',
        name: 'Wide-Brim Straw Hat',
        brand: 'Accessorize',
        image: SEED_PHOTOS.strawHat,
        category: 'accessories',
        material: 'other',
        dominantColor: '#D4B97A',
        pricePaise: 159900,
      },
      {
        productId: 'p-black-sun',
        name: 'Black Frame Sunglasses',
        brand: 'Ray-Ban',
        image: SEED_PHOTOS.blackSunglasses,
        category: 'accessories',
        material: 'other',
        dominantColor: '#1B1C20',
        pricePaise: 749900,
      },
    ]),
  },
  {
    id: 'co-denim-1',
    title: 'Denim Layers',
    creator: 'Myntra Studio',
    badge: 'myntra',
    occasion: 'Casual · Evening',
    surface: 'mint',
    items: withSlots([
      {
        productId: 'p-green-jacket',
        name: 'Army Green Denim Jacket',
        brand: 'Wrangler',
        image: SEED_PHOTOS.greenDenimJacket,
        category: 'outerwear',
        material: 'denim',
        dominantColor: '#5C6647',
        pricePaise: 399900,
      },
      {
        productId: 'p-blue-jeans',
        name: 'Classic Blue Jeans',
        brand: "Levi's",
        image: SEED_PHOTOS.blueJeans,
        category: 'bottoms',
        material: 'denim',
        dominantColor: '#4A6B8F',
        pricePaise: 269900,
      },
      {
        productId: 'p-purple-cap',
        name: 'Purple Sports Cap',
        brand: 'Puma',
        image: SEED_PHOTOS.purpleCap,
        category: 'accessories',
        material: 'cotton',
        dominantColor: '#6E5DC6',
        pricePaise: 99900,
      },
      {
        productId: 'p-sunglasses-rim-2',
        name: 'Black Rim Sunglasses',
        brand: 'Ray-Ban',
        image: SEED_PHOTOS.sunglassesBlackRim,
        category: 'accessories',
        material: 'other',
        dominantColor: '#1B1C20',
        pricePaise: 749900,
      },
    ]),
  },
  {
    id: 'co-city-1',
    title: 'City Polish',
    creator: '@vogue.india',
    badge: 'creator',
    occasion: 'Office · Evening',
    surface: 'cream',
    items: withSlots([
      {
        productId: 'p-linen-shirt',
        name: 'Linen Beach Shirt',
        brand: 'Marks & Spencer',
        image: SEED_PHOTOS.linenBeachShirt,
        category: 'tops',
        material: 'cotton',
        dominantColor: '#E8E4DC',
        pricePaise: 189900,
      },
      {
        productId: 'p-khaki-pants',
        name: 'Khaki Casual Pants',
        brand: 'Roadster',
        image: SEED_PHOTOS.khakiPants,
        category: 'bottoms',
        material: 'cotton',
        dominantColor: '#B8A88A',
        pricePaise: 219900,
      },
      {
        productId: 'p-detective-hat',
        name: 'Felt Detective Hat',
        brand: 'Forever 21',
        image: SEED_PHOTOS.detectiveHat,
        category: 'accessories',
        material: 'wool',
        dominantColor: '#3A3A3A',
        pricePaise: 189900,
      },
      {
        productId: 'p-black-sun-2',
        name: 'Black Frame Sunglasses',
        brand: 'Ray-Ban',
        image: SEED_PHOTOS.blackSunglasses,
        category: 'accessories',
        material: 'other',
        dominantColor: '#1B1C20',
        pricePaise: 749900,
      },
    ]),
  },
];

export function outfitTotalPaise(o: CreatorOutfit): number {
  return o.items.reduce((sum, it) => sum + it.pricePaise, 0);
}

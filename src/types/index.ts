export type Category =
  | 'tops'
  | 'bottoms'
  | 'outerwear'
  | 'dresses'
  | 'footwear'
  | 'bags'
  | 'accessories';

export const CATEGORY_LABELS: Record<Category, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  outerwear: 'Outerwear',
  dresses: 'Dresses',
  footwear: 'Footwear',
  bags: 'Bags',
  accessories: 'Accessories',
};

export const CATEGORY_ORDER: Category[] = [
  'tops',
  'bottoms',
  'outerwear',
  'dresses',
  'footwear',
  'bags',
  'accessories',
];

export type ItemSource = 'camera' | 'gallery' | 'url' | 'myntra' | 'seed';

export type MaterialTag = 'suede' | 'canvas' | 'leather' | 'cotton' | 'denim' | 'silk' | 'wool' | 'other';

export type WardrobeItem = {
  id: string;
  imageBlobKey: string; // key in IndexedDB pointing to the transparent PNG (data URL string)
  thumbnailDataUrl: string; // small preview for fast grids
  category: Category;
  source: ItemSource;
  myntraProductId?: string;
  dominantColor?: string;
  brand?: string;
  material?: MaterialTag;
  addedAt: number;
  name?: string;
  lastWornAt?: number;
  timesWorn?: number;
};

export type StyleProfile = {
  vibes: string[]; // e.g. 'minimal', 'street', 'classic', 'boho', 'sporty'
  occasions: string[]; // 'office', 'casual', 'evening', 'workout'
  palette: 'neutral' | 'warm' | 'cool' | 'bold' | 'monochrome';
  completedAt: number;
};

export type CanvasNode = {
  itemId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  z: number;
};

export type OutfitMode = 'collage' | 'dressing-room' | 'try-on';

export type OutfitGenerationStatus = 'generating' | 'failed';

export type Outfit = {
  id: string;
  name?: string;
  mode: OutfitMode;
  nodes: CanvasNode[];
  thumbnailDataUrl: string;
  background?: string; // CSS color for collage backdrop
  createdAt: number;
  /** Try-on pipeline in progress or failed — shows loading / retry on outfit cards. */
  generationStatus?: OutfitGenerationStatus;
};

export type PlannerEntry = {
  date: string; // YYYY-MM-DD
  outfitId: string;
};

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';

export type ForecastDay = {
  date: string; // YYYY-MM-DD
  tempMaxC: number;
  tempMinC: number;
  precipMm: number;
  condition: WeatherCondition;
};

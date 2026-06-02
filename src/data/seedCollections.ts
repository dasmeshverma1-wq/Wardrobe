import { useCollectionsStore } from '@/store/collectionsStore';
import { useWardrobeStore } from '@/store/wardrobeStore';

type SeedCollectionSpec = {
  name: string;
  description?: string;
  /** Seed catalog item names — resolved to closet IDs on bootstrap. */
  itemNames: string[];
};

/** Starter Sets shown in Wardrobe → Sets for new and existing closets. */
const SEED_COLLECTIONS: SeedCollectionSpec[] = [
  {
    name: 'Beach Day',
    description: 'Sun, sand & swim',
    itemNames: [
      'Linen Beach Shirt',
      'Blue Swim Shorts',
      'Wide-Brim Straw Hat',
      'Vibrant Summer Sandals',
      'Black Frame Sunglasses',
    ],
  },
  {
    name: 'Office Smart',
    description: 'Desk to dinner',
    itemNames: [
      'Classic Dress Shirt',
      'Khaki Chino Pants',
      'Brown Formal Oxfords',
      'Brown Leather Handbag',
    ],
  },
  {
    name: 'Weekend Casual',
    description: 'Easy off-duty',
    itemNames: [
      'Cotton Crew Tee',
      'Classic Blue Jeans',
      'Court Sneakers',
      'Cobalt Snapback Cap',
    ],
  },
  {
    name: 'Monsoon Ready',
    description: 'Rain-proof layers',
    itemNames: [
      'Sand Pullover Hoodie',
      'Slim-Fit Black Jeans',
      'Canvas Slip-Ons',
      'Black Crossbody Bag',
    ],
  },
  {
    name: 'Evening Out',
    description: 'Dress-up nights',
    itemNames: [
      'Elegant Wrap Top',
      'Vintage Brown Sandals',
      'Brown Leather Handbag',
      'Black Rim Sunglasses',
    ],
  },
  {
    name: 'Summer Linen Set',
    description: 'Linen shirt, trousers & sandals',
    itemNames: [
      'Green Linen Shirt',
      'White Casual Trousers',
      'Purple Strap Sandals',
    ],
  },
];

const COLLECTIONS_SYNC_KEY = 'myntra-wardrobe/v1/collections-sync:v4';

function resolveItemIds(names: string[]): string[] {
  const items = useWardrobeStore.getState().items;
  const byName = new Map(
    items.filter((it) => it.source === 'seed' && it.name).map((it) => [it.name!, it.id]),
  );
  return names.map((name) => byName.get(name)).filter((id): id is string => Boolean(id));
}

/** Creates default Sets once the wardrobe catalog is available. */
export async function syncDefaultCollections(): Promise<void> {
  if (localStorage.getItem(COLLECTIONS_SYNC_KEY) === '1') return;

  useCollectionsStore.getState().hydrate();
  useWardrobeStore.getState().hydrate();

  const existingNames = new Set(useCollectionsStore.getState().collections.map((c) => c.name));
  const create = useCollectionsStore.getState().createCollection;

  for (const spec of SEED_COLLECTIONS) {
    if (existingNames.has(spec.name)) continue;
    const itemIds = resolveItemIds(spec.itemNames);
    if (itemIds.length < 2) continue;
    create({
      name: spec.name,
      description: spec.description,
      itemIds,
    });
  }

  localStorage.setItem(COLLECTIONS_SYNC_KEY, '1');
}

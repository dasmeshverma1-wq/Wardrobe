import type { Category, MaterialTag } from '@/types';
import { useWardrobeStore } from '@/store/wardrobeStore';
import type { CartLine } from '@/store/cartStore';
import type { WishlistLine } from '@/store/wishlistStore';
import { MYNTRA_SAMPLES } from '@/data/myntraSamples';
import { guessCategory, guessMaterial } from '@/lib/categorize';

export type MyntraProductInput = {
  productId: string;
  name: string;
  brand: string;
  image: string;
  category?: Category;
  dominantColor?: string;
  material?: MaterialTag;
};

function toProduct(line: CartLine | WishlistLine | (typeof MYNTRA_SAMPLES)[number]): MyntraProductInput {
  if ('category' in line && line.category) {
    return {
      productId: line.productId,
      name: line.name,
      brand: line.brand,
      image: line.image,
      category: line.category,
      dominantColor: line.dominantColor,
      material: line.material,
    };
  }
  return {
    productId: line.productId,
    name: line.name,
    brand: line.brand,
    image: line.image,
    dominantColor: '#686B77',
  };
}

export async function importMyntraProducts(products: MyntraProductInput[]): Promise<number> {
  const store = useWardrobeStore.getState();
  let added = 0;

  for (const p of products) {
    const exists = store.items.some(
      (it) => it.myntraProductId === p.productId || it.thumbnailDataUrl === p.image,
    );
    if (exists) continue;

    const category = p.category ?? guessCategory({ name: p.name });
    const material = p.material ?? guessMaterial({ name: p.name });

    await store.addItem({
      category,
      source: 'myntra',
      dataUrl: p.image,
      thumbnailDataUrl: p.image,
      name: p.name,
      brand: p.brand,
      dominantColor: p.dominantColor ?? '#686B77',
      myntraProductId: p.productId,
      material,
    });
    added += 1;
  }

  return added;
}

export async function importFromCart(lines: CartLine[]): Promise<number> {
  return importMyntraProducts(lines.map(toProduct));
}

export async function importFromWishlist(lines: WishlistLine[]): Promise<number> {
  return importMyntraProducts(lines.map(toProduct));
}

export async function importAllFromCartAndWishlist(
  cart: CartLine[],
  wishlist: WishlistLine[],
): Promise<number> {
  const merged = [...cart.map(toProduct), ...wishlist.map(toProduct)];
  const seen = new Set<string>();
  const unique = merged.filter((p) => {
    if (seen.has(p.productId)) return false;
    seen.add(p.productId);
    return true;
  });
  return importMyntraProducts(unique);
}

import type { NavigateFunction } from 'react-router-dom';
import type { CartLine } from '@/store/cartStore';
import type { WishlistLine } from '@/store/wishlistStore';
import type { Outfit, WardrobeItem } from '@/types';
import { getHomeRailOutfit, isHomeRailOutfit } from '@/data/homeCreatorRails';
import type { LookReferenceStyle } from '@/lib/tryOnTypes';
import { getWireframeDemoPieceSpecs, isWireframeDemoOutfit } from '@/data/wireframeDemoOutfits';
import { resolveOutfitItemIds } from '@/lib/outfitPieces';
import { guessCategory } from '@/lib/categorize';
import { zoneForGarment } from '@/lib/tryOnPlacement';
import type { TryOnGarment, TryOnLocationState } from '@/lib/tryOnTypes';

/** Launch the full try-on wizard (consent → avatar → garments → generate → result). */
export function navigateToTryOn(navigate: NavigateFunction, state?: TryOnLocationState) {
  navigate('/studio/try-on', { state });
}

function lineToGarment(line: { productId: string; name: string; image: string }): TryOnGarment {
  const category = guessCategory({ name: line.name });
  return {
    id: line.productId,
    name: line.name,
    category,
    imageUrl: line.image,
    zone: zoneForGarment({ category, name: line.name }),
  };
}

export function tryOnStateFromCart(cart: CartLine[], title = 'Bag picks'): TryOnLocationState {
  return { title, garments: cart.slice(0, 6).map(lineToGarment) };
}

export function tryOnStateFromWishlist(
  wishlist: WishlistLine[],
  title = 'Wishlist look',
): TryOnLocationState {
  return { title, garments: wishlist.slice(0, 6).map(lineToGarment) };
}

export function tryOnStateFromHomeRail(lookId: string): TryOnLocationState | null {
  const def = getHomeRailOutfit(lookId);
  if (!def?.thumbnailDataUrl) return null;

  const lookReferenceStyle: LookReferenceStyle =
    def.mode === 'dressing-room' ? 'flat-lay' : 'model';

  return {
    outfitId: def.id,
    title: def.name ?? 'Look',
    lookImageUrl: def.thumbnailDataUrl,
    lookReferenceStyle,
    garments: def.pieceSpecs.map((spec) => ({
      id: spec.image,
      name: spec.name,
      category: spec.category,
      imageUrl: spec.image,
      zone: zoneForGarment({ category: spec.category, name: spec.name }),
    })),
  };
}

export function tryOnStateFromOutfit(outfit: Outfit, wardrobeItems: WardrobeItem[] = []): TryOnLocationState {
  if (isHomeRailOutfit(outfit.id)) {
    return tryOnStateFromHomeRail(outfit.id) ?? { outfitId: outfit.id, title: outfit.name };
  }

  const itemIds = resolveOutfitItemIds(outfit, wardrobeItems);
  if (itemIds.length > 0) {
    return {
      outfitId: outfit.id,
      title: outfit.name ?? 'Outfit',
      itemIds,
    };
  }

  if (isWireframeDemoOutfit(outfit.id)) {
    const specs = getWireframeDemoPieceSpecs(outfit.id);
    return {
      outfitId: outfit.id,
      title: outfit.name ?? 'Outfit',
      garments: specs.map((spec) => ({
        id: spec.image,
        name: spec.name,
        category: spec.category,
        imageUrl: spec.image,
        zone: zoneForGarment({ category: spec.category, name: spec.name }),
      })),
    };
  }

  return {
    outfitId: outfit.id,
    title: outfit.name ?? 'Outfit',
    itemIds: [],
  };
}

export function tryOnStateFromItems(itemIds: string[], title?: string): TryOnLocationState {
  return { itemIds, title };
}

export function tryOnStateFromDiscover(discoverOutfitId: string, title?: string): TryOnLocationState {
  return { discoverOutfitId, title };
}

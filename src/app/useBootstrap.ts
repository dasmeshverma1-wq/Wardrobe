import { useEffect, useState } from 'react';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { useOutfitStore } from '@/store/outfitStore';
import { usePlannerStore } from '@/store/plannerStore';
import { useProfileStore } from '@/store/profileStore';
import { useCollectionsStore } from '@/store/collectionsStore';
import { seedWardrobeIfEmpty, dedupeSeedItems, syncSeedCatalog } from '@/data/seed';
import { syncDefaultCollections } from '@/data/seedCollections';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useTryOnStore } from '@/store/tryOnStore';

export function useBootstrap(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      useWardrobeStore.getState().hydrate();
      useOutfitStore.getState().hydrate();
      usePlannerStore.getState().hydrate();
      useProfileStore.getState().hydrate();
      useCollectionsStore.getState().hydrate();
      useCartStore.getState().hydrate();
      useWishlistStore.getState().hydrate();
      void useTryOnStore.getState().hydrate();
      await dedupeSeedItems();
      await seedWardrobeIfEmpty();
      await syncSeedCatalog();
      await dedupeSeedItems();
      await syncDefaultCollections();
      setReady(true);
    })();
  }, []);
  return ready;
}

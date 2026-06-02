import { create } from 'zustand';
import type { WardrobeItem, Category } from '@/types';
import { lsLoad, lsSave, saveImage, deleteImage } from '@/lib/storage';
import { uid } from '@/lib/id';
import { useCollectionsStore } from './collectionsStore';

type AddInput = Omit<WardrobeItem, 'id' | 'imageBlobKey' | 'addedAt'> & { dataUrl: string };

type State = {
  items: WardrobeItem[];
  selectedIds: Set<string>;
  activeCategory: Category | 'all';
  hydrated: boolean;
  hydrate: () => void;
  addItem: (input: AddInput) => Promise<WardrobeItem>;
  updateItem: (id: string, patch: Partial<WardrobeItem>) => void;
  removeItem: (id: string) => Promise<void>;
  setCategory: (c: Category | 'all') => void;
  toggleSelect: (id: string) => void;
  setSelection: (ids: string[]) => void;
  clearSelection: () => void;
  markWorn: (itemIds: string[], at?: number) => void;
};

const SLICE = 'wardrobe';

export const useWardrobeStore = create<State>((set, get) => ({
  items: [],
  selectedIds: new Set(),
  activeCategory: 'all',
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const items = lsLoad<WardrobeItem[]>(SLICE, []);
    set({ items, hydrated: true });
  },

  addItem: async (input) => {
    const id = uid('itm_');
    const imageBlobKey = await saveImage(id, input.dataUrl);
    const item: WardrobeItem = {
      id,
      imageBlobKey,
      thumbnailDataUrl: input.thumbnailDataUrl,
      category: input.category,
      source: input.source,
      myntraProductId: input.myntraProductId,
      dominantColor: input.dominantColor,
      brand: input.brand,
      material: input.material,
      name: input.name,
      addedAt: Date.now(),
    };
    set((s) => {
      const items = [item, ...s.items];
      lsSave(SLICE, items);
      return { items };
    });
    return item;
  },

  updateItem: (id, patch) => {
    set((s) => {
      const items = s.items.map((it) => (it.id === id ? { ...it, ...patch } : it));
      lsSave(SLICE, items);
      return { items };
    });
  },

  removeItem: async (id) => {
    const target = get().items.find((it) => it.id === id);
    if (target) {
      await deleteImage(target.imageBlobKey);
    }
    set((s) => {
      const items = s.items.filter((it) => it.id !== id);
      const selectedIds = new Set(s.selectedIds);
      selectedIds.delete(id);
      lsSave(SLICE, items);
      return { items, selectedIds };
    });
    // Cascade: drop the deleted id from any Collections that reference it.
    useCollectionsStore.getState().pruneItems([id]);
  },

  setCategory: (c) => set({ activeCategory: c }),

  toggleSelect: (id) =>
    set((s) => {
      const selectedIds = new Set(s.selectedIds);
      if (selectedIds.has(id)) selectedIds.delete(id);
      else selectedIds.add(id);
      return { selectedIds };
    }),

  setSelection: (ids) => set({ selectedIds: new Set(ids) }),

  clearSelection: () => set({ selectedIds: new Set() }),

  markWorn: (itemIds, at = Date.now()) => {
    if (itemIds.length === 0) return;
    const ids = new Set(itemIds);
    set((s) => {
      const items = s.items.map((it) =>
        ids.has(it.id)
          ? { ...it, lastWornAt: at, timesWorn: (it.timesWorn ?? 0) + 1 }
          : it,
      );
      lsSave(SLICE, items);
      return { items };
    });
  },
}));

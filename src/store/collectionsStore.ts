import { create } from 'zustand';
import { lsLoad, lsSave } from '@/lib/storage';
import { uid } from '@/lib/id';

/**
 * Wardrobe Collections — themed groupings of items the user curates.
 *
 * Conceptually different from Outfits:
 *   - Outfit  = a styled composition (positioned items on a canvas)
 *   - Collection = a flat set of items grouped by theme ("Beach Day",
 *     "Office Layers", "Wedding Shopping List")
 *
 * Items can belong to multiple collections at once. Removing an item from a
 * collection only removes the reference, the item itself stays in the closet.
 * When an item is deleted from the wardrobe, the parent should call
 * `pruneItems` to drop dangling references.
 */

export type Collection = {
  id: string;
  name: string;
  description?: string;
  itemIds: string[];
  createdAt: number;
  updatedAt: number;
};

const SLICE = 'collections';

type State = {
  collections: Collection[];
  hydrated: boolean;
  hydrate: () => void;
  createCollection: (input: {
    name: string;
    description?: string;
    itemIds?: string[];
  }) => Collection;
  renameCollection: (id: string, name: string, description?: string) => void;
  deleteCollection: (id: string) => void;
  addItems: (id: string, itemIds: string[]) => void;
  removeItems: (id: string, itemIds: string[]) => void;
  pruneItems: (deletedItemIds: string[]) => void;
  getCollection: (id: string) => Collection | undefined;
};

export const useCollectionsStore = create<State>((set, get) => ({
  collections: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({
      collections: lsLoad<Collection[]>(SLICE, []),
      hydrated: true,
    });
  },

  createCollection: ({ name, description, itemIds = [] }) => {
    const now = Date.now();
    const collection: Collection = {
      id: uid('col_'),
      name: name.trim() || 'Untitled collection',
      description: description?.trim() || undefined,
      itemIds: unique(itemIds),
      createdAt: now,
      updatedAt: now,
    };
    set((s) => {
      const collections = [collection, ...s.collections];
      lsSave(SLICE, collections);
      return { collections };
    });
    return collection;
  },

  renameCollection: (id, name, description) => {
    set((s) => {
      const collections = s.collections.map((c) =>
        c.id === id
          ? {
              ...c,
              name: name.trim() || c.name,
              description: description?.trim() || undefined,
              updatedAt: Date.now(),
            }
          : c,
      );
      lsSave(SLICE, collections);
      return { collections };
    });
  },

  deleteCollection: (id) => {
    set((s) => {
      const collections = s.collections.filter((c) => c.id !== id);
      lsSave(SLICE, collections);
      return { collections };
    });
  },

  addItems: (id, itemIds) => {
    if (itemIds.length === 0) return;
    set((s) => {
      const collections = s.collections.map((c) =>
        c.id === id
          ? {
              ...c,
              itemIds: unique([...c.itemIds, ...itemIds]),
              updatedAt: Date.now(),
            }
          : c,
      );
      lsSave(SLICE, collections);
      return { collections };
    });
  },

  removeItems: (id, itemIds) => {
    if (itemIds.length === 0) return;
    const set_ = new Set(itemIds);
    set((s) => {
      const collections = s.collections.map((c) =>
        c.id === id
          ? {
              ...c,
              itemIds: c.itemIds.filter((iid) => !set_.has(iid)),
              updatedAt: Date.now(),
            }
          : c,
      );
      lsSave(SLICE, collections);
      return { collections };
    });
  },

  pruneItems: (deletedItemIds) => {
    if (deletedItemIds.length === 0) return;
    const tombstone = new Set(deletedItemIds);
    set((s) => {
      let mutated = false;
      const collections = s.collections.map((c) => {
        const next = c.itemIds.filter((iid) => !tombstone.has(iid));
        if (next.length === c.itemIds.length) return c;
        mutated = true;
        return { ...c, itemIds: next, updatedAt: Date.now() };
      });
      if (!mutated) return s;
      lsSave(SLICE, collections);
      return { collections };
    });
  },

  getCollection: (id) => get().collections.find((c) => c.id === id),
}));

function unique(list: string[]): string[] {
  return Array.from(new Set(list));
}

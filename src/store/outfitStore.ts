import { create } from 'zustand';
import type { Outfit } from '@/types';
import { lsLoad, lsSave } from '@/lib/storage';
import { uid } from '@/lib/id';

type State = {
  outfits: Outfit[];
  hydrated: boolean;
  hydrate: () => void;
  saveOutfit: (data: Omit<Outfit, 'id' | 'createdAt'> & { id?: string }) => Outfit;
  removeOutfit: (id: string) => void;
  renameOutfit: (id: string, name: string) => void;
  getOutfit: (id: string) => Outfit | undefined;
};

const SLICE = 'outfits';

export const useOutfitStore = create<State>((set, get) => ({
  outfits: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({ outfits: lsLoad<Outfit[]>(SLICE, []), hydrated: true });
  },

  saveOutfit: (data) => {
    const existing = data.id ? get().outfits.find((o) => o.id === data.id) : undefined;
    const outfit: Outfit = {
      id: existing?.id ?? uid('out_'),
      createdAt: existing?.createdAt ?? Date.now(),
      name: data.name,
      mode: data.mode,
      nodes: data.nodes,
      thumbnailDataUrl: data.thumbnailDataUrl,
      background: data.background,
      generationStatus: data.generationStatus,
    };
    set((s) => {
      const outfits = existing
        ? s.outfits.map((o) => (o.id === outfit.id ? outfit : o))
        : [outfit, ...s.outfits];
      lsSave(SLICE, outfits);
      return { outfits };
    });
    return outfit;
  },

  removeOutfit: (id) => {
    set((s) => {
      const outfits = s.outfits.filter((o) => o.id !== id);
      lsSave(SLICE, outfits);
      return { outfits };
    });
  },

  renameOutfit: (id, name) => {
    set((s) => {
      const outfits = s.outfits.map((o) => (o.id === id ? { ...o, name } : o));
      lsSave(SLICE, outfits);
      return { outfits };
    });
  },

  getOutfit: (id) => get().outfits.find((o) => o.id === id),
}));

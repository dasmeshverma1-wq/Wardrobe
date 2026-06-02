import { create } from 'zustand';
import type { PlannerEntry } from '@/types';
import { lsLoad, lsSave } from '@/lib/storage';

type State = {
  entries: Record<string, PlannerEntry>; // keyed by date string
  hydrated: boolean;
  hydrate: () => void;
  pin: (date: string, outfitId: string) => void;
  unpin: (date: string) => void;
  removeOutfitEverywhere: (outfitId: string) => void;
  getEntry: (date: string) => PlannerEntry | undefined;
};

const SLICE = 'planner';

export const usePlannerStore = create<State>((set, get) => ({
  entries: {},
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({
      entries: lsLoad<Record<string, PlannerEntry>>(SLICE, {}),
      hydrated: true,
    });
  },

  pin: (date, outfitId) => {
    set((s) => {
      const entries = { ...s.entries, [date]: { date, outfitId } };
      lsSave(SLICE, entries);
      return { entries };
    });
  },

  unpin: (date) => {
    set((s) => {
      const entries = { ...s.entries };
      delete entries[date];
      lsSave(SLICE, entries);
      return { entries };
    });
  },

  removeOutfitEverywhere: (outfitId) => {
    set((s) => {
      const entries: Record<string, PlannerEntry> = {};
      for (const [d, e] of Object.entries(s.entries)) {
        if (e.outfitId !== outfitId) entries[d] = e;
      }
      lsSave(SLICE, entries);
      return { entries };
    });
  },

  getEntry: (date) => get().entries[date],
}));

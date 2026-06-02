import { create } from 'zustand';
import type { StyleProfile } from '@/types';
import { lsLoad, lsSave } from '@/lib/storage';

const SLICE = 'profile';

type State = {
  profile: StyleProfile | null;
  hydrated: boolean;
  hydrate: () => void;
  save: (p: StyleProfile) => void;
  reset: () => void;
};

export const useProfileStore = create<State>((set, get) => ({
  profile: null,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    const profile = lsLoad<StyleProfile | null>(SLICE, null);
    set({ profile, hydrated: true });
  },
  save: (p) => {
    lsSave(SLICE, p);
    set({ profile: p });
  },
  reset: () => {
    lsSave(SLICE, null);
    set({ profile: null });
  },
}));

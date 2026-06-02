import { create } from 'zustand';
import { lsLoad, lsSave } from '@/lib/storage';

/**
 * Tracks the user's interaction with the Discover swipe feed:
 *   - liked   : outfits the user swiped right / hearted
 *   - passed  : outfits the user swiped left
 *   - history : ordered stack of recent actions (for "Undo / Rewind")
 *
 * Identifiers are CreatorOutfit ids. We persist to localStorage so the feed
 * stays personal across sessions but stays small (no images stored).
 */

export type SwipeAction = 'liked' | 'passed';

export type SwipeHistoryEntry = {
  outfitId: string;
  action: SwipeAction;
  at: number;
};

const SLICE = 'discover';

type Persisted = {
  liked: string[];
  passed: string[];
  history: SwipeHistoryEntry[];
};

type State = Persisted & {
  hydrated: boolean;
  hydrate: () => void;
  record: (outfitId: string, action: SwipeAction) => void;
  undo: () => SwipeHistoryEntry | undefined;
  reset: () => void;
  isLiked: (outfitId: string) => boolean;
};

const HISTORY_CAP = 25;

export const useDiscoverStore = create<State>((set, get) => ({
  liked: [],
  passed: [],
  history: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const persisted = lsLoad<Persisted>(SLICE, { liked: [], passed: [], history: [] });
    set({ ...persisted, hydrated: true });
  },

  record: (outfitId, action) => {
    set((s) => {
      const liked = action === 'liked' ? unique([outfitId, ...s.liked]) : s.liked.filter((id) => id !== outfitId);
      const passed = action === 'passed' ? unique([outfitId, ...s.passed]) : s.passed.filter((id) => id !== outfitId);
      const history = [{ outfitId, action, at: Date.now() }, ...s.history].slice(0, HISTORY_CAP);
      persist({ liked, passed, history });
      return { liked, passed, history };
    });
  },

  undo: () => {
    const { history } = get();
    if (history.length === 0) return undefined;
    const [last, ...rest] = history;
    set((s) => {
      const liked = s.liked.filter((id) => id !== last.outfitId);
      const passed = s.passed.filter((id) => id !== last.outfitId);
      persist({ liked, passed, history: rest });
      return { liked, passed, history: rest };
    });
    return last;
  },

  reset: () => {
    persist({ liked: [], passed: [], history: [] });
    set({ liked: [], passed: [], history: [] });
  },

  isLiked: (outfitId) => get().liked.includes(outfitId),
}));

function unique(list: string[]): string[] {
  return Array.from(new Set(list));
}

function persist(p: Persisted) {
  lsSave<Persisted>(SLICE, p);
}

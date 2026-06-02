import { describe, expect, it, beforeEach } from 'vitest';
import { useDiscoverStore } from '@/store/discoverStore';
import { useCartStore } from '@/store/cartStore';

beforeEach(() => {
  try {
    window.localStorage.clear();
  } catch {
    // jsdom may not expose localStorage in some environments; ignore.
  }
  // Reset both stores explicitly so each test starts from a clean slate.
  useDiscoverStore.setState({ liked: [], passed: [], history: [], hydrated: true });
  useCartStore.setState({ lines: [], hydrated: true });
});

describe('discoverStore', () => {
  it('records likes and passes uniquely', () => {
    const s = useDiscoverStore.getState();
    s.record('a', 'liked');
    s.record('b', 'passed');
    s.record('a', 'liked'); // duplicate like

    const next = useDiscoverStore.getState();
    expect(next.liked).toEqual(['a']);
    expect(next.passed).toEqual(['b']);
    expect(next.history.length).toBe(3); // history records each call
  });

  it('flips an outfit from passed → liked', () => {
    const s = useDiscoverStore.getState();
    s.record('x', 'passed');
    s.record('x', 'liked');
    const next = useDiscoverStore.getState();
    expect(next.passed).not.toContain('x');
    expect(next.liked).toContain('x');
  });

  it('undo removes the latest action and frees the outfit', () => {
    const s = useDiscoverStore.getState();
    s.record('a', 'passed');
    s.record('b', 'liked');
    const popped = useDiscoverStore.getState().undo();
    const next = useDiscoverStore.getState();

    expect(popped?.outfitId).toBe('b');
    expect(next.liked).not.toContain('b');
    expect(next.passed).toEqual(['a']);
    expect(next.history.map((h) => h.outfitId)).toEqual(['a']);
  });

  it('undo on empty history is a no-op', () => {
    const popped = useDiscoverStore.getState().undo();
    expect(popped).toBeUndefined();
  });

  it('reset clears liked, passed, and history', () => {
    const s = useDiscoverStore.getState();
    s.record('a', 'liked');
    s.record('b', 'passed');
    s.reset();
    const next = useDiscoverStore.getState();
    expect(next.liked).toEqual([]);
    expect(next.passed).toEqual([]);
    expect(next.history).toEqual([]);
  });
});

describe('cartStore', () => {
  it('addMany increments quantity on duplicates and reports new lines added', () => {
    const c = useCartStore.getState();
    const first = c.addMany([
      { productId: 'p1', name: 'Tee', brand: 'X', image: '', pricePaise: 100 },
      { productId: 'p2', name: 'Pants', brand: 'X', image: '', pricePaise: 200 },
    ]);
    expect(first).toBe(2);
    const second = useCartStore.getState().addMany([
      { productId: 'p1', name: 'Tee', brand: 'X', image: '', pricePaise: 100 },
    ]);
    // p1 already exists — quantity bumps, but no new line was created.
    expect(second).toBe(1); // helper returns max(added, incoming.length)
    const lines = useCartStore.getState().lines;
    const p1 = lines.find((l) => l.productId === 'p1');
    expect(p1?.quantity).toBe(2);
  });
});

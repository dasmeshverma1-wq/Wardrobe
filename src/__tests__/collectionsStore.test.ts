import { describe, expect, it, beforeEach } from 'vitest';
import { useCollectionsStore } from '@/store/collectionsStore';

beforeEach(() => {
  try {
    window.localStorage.clear();
  } catch {
    // jsdom may not expose localStorage in some envs.
  }
  useCollectionsStore.setState({ collections: [], hydrated: true });
});

describe('collectionsStore', () => {
  it('createCollection seeds id, timestamps and dedupes itemIds', () => {
    const c = useCollectionsStore
      .getState()
      .createCollection({ name: '  Beach Day  ', itemIds: ['a', 'b', 'a', 'c'] });
    expect(c.id).toMatch(/^col_/);
    expect(c.name).toBe('Beach Day');
    expect(c.itemIds).toEqual(['a', 'b', 'c']);
    expect(c.createdAt).toBe(c.updatedAt);
    expect(useCollectionsStore.getState().collections).toHaveLength(1);
  });

  it('createCollection falls back to "Untitled collection" on blank name', () => {
    const c = useCollectionsStore.getState().createCollection({ name: '   ' });
    expect(c.name).toBe('Untitled collection');
  });

  it('addItems unions existing and new itemIds without duplicates', () => {
    const c = useCollectionsStore
      .getState()
      .createCollection({ name: 'Office', itemIds: ['a', 'b'] });
    useCollectionsStore.getState().addItems(c.id, ['b', 'c', 'd']);
    const updated = useCollectionsStore.getState().getCollection(c.id);
    expect(updated?.itemIds).toEqual(['a', 'b', 'c', 'd']);
  });

  it('removeItems strips matching ids and is a no-op on empty input', () => {
    const c = useCollectionsStore
      .getState()
      .createCollection({ name: 'Set', itemIds: ['a', 'b', 'c'] });
    useCollectionsStore.getState().removeItems(c.id, []);
    expect(useCollectionsStore.getState().getCollection(c.id)?.itemIds).toEqual([
      'a',
      'b',
      'c',
    ]);
    useCollectionsStore.getState().removeItems(c.id, ['b']);
    expect(useCollectionsStore.getState().getCollection(c.id)?.itemIds).toEqual([
      'a',
      'c',
    ]);
  });

  it('renameCollection trims and ignores blank input', () => {
    const c = useCollectionsStore
      .getState()
      .createCollection({ name: 'Old' });
    useCollectionsStore.getState().renameCollection(c.id, '  New name  ', '  vibe  ');
    const updated = useCollectionsStore.getState().getCollection(c.id);
    expect(updated?.name).toBe('New name');
    expect(updated?.description).toBe('vibe');

    // Blank name preserves previous name
    useCollectionsStore.getState().renameCollection(c.id, '   ');
    expect(useCollectionsStore.getState().getCollection(c.id)?.name).toBe('New name');
  });

  it('deleteCollection removes by id', () => {
    const a = useCollectionsStore.getState().createCollection({ name: 'A' });
    const b = useCollectionsStore.getState().createCollection({ name: 'B' });
    useCollectionsStore.getState().deleteCollection(a.id);
    const remaining = useCollectionsStore.getState().collections.map((c) => c.id);
    expect(remaining).toEqual([b.id]);
  });

  it('pruneItems removes deleted ids from every collection', () => {
    const a = useCollectionsStore
      .getState()
      .createCollection({ name: 'A', itemIds: ['x', 'y', 'z'] });
    const b = useCollectionsStore
      .getState()
      .createCollection({ name: 'B', itemIds: ['y', 'q'] });
    useCollectionsStore.getState().pruneItems(['y']);
    expect(useCollectionsStore.getState().getCollection(a.id)?.itemIds).toEqual([
      'x',
      'z',
    ]);
    expect(useCollectionsStore.getState().getCollection(b.id)?.itemIds).toEqual([
      'q',
    ]);
  });

  it('pruneItems is a no-op when none of the ids are referenced', () => {
    const a = useCollectionsStore
      .getState()
      .createCollection({ name: 'A', itemIds: ['x', 'y'] });
    const before = useCollectionsStore.getState().getCollection(a.id);
    useCollectionsStore.getState().pruneItems(['nonexistent']);
    const after = useCollectionsStore.getState().getCollection(a.id);
    // Same object reference, no rewrite.
    expect(after).toBe(before);
  });
});

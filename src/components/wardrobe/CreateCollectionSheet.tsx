import { useEffect, useMemo, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ItemCard } from '@/components/wardrobe/ItemCard';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { useCollectionsStore } from '@/store/collectionsStore';
import { CATEGORY_LABELS, CATEGORY_ORDER, type Category } from '@/types';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';

/**
 * Create or extend a collection.
 *
 * Flow:
 *   1. Name + optional vibe description
 *   2. Multi-select items from the closet (filterable by category)
 *   3. Create — saves to the collections store and toasts
 *
 * If `mode` is `addToExisting`, the name step is hidden and saving calls
 * `addItems` on the existing collection rather than creating a new one.
 */
export function CreateCollectionSheet({
  open,
  onClose,
  mode = 'create',
  existingId,
  existingItemIds = [],
  initialName = '',
}: {
  open: boolean;
  onClose: () => void;
  mode?: 'create' | 'addToExisting';
  existingId?: string;
  existingItemIds?: string[];
  initialName?: string;
}) {
  const items = useWardrobeStore((s) => s.items);
  const create = useCollectionsStore((s) => s.createCollection);
  const addItems = useCollectionsStore((s) => s.addItems);

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState('');
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Reset on close so the next open is fresh
  useEffect(() => {
    if (!open) {
      setName(initialName);
      setDescription('');
      setSelectedIds(new Set());
      setFilter('all');
    }
  }, [open, initialName]);

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      if (filter !== 'all' && it.category !== filter) return false;
      // When adding to an existing collection, hide items already in it.
      if (mode === 'addToExisting' && existingItemIds.includes(it.id)) return false;
      return true;
    });
  }, [items, filter, mode, existingItemIds]);

  const isCreate = mode === 'create';
  const canSave =
    isCreate
      ? name.trim().length > 0 && selectedIds.size > 0
      : selectedIds.size > 0 && !!existingId;

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    if (!canSave) return;
    const ids = Array.from(selectedIds);
    if (isCreate) {
      const c = create({
        name,
        description,
        itemIds: ids,
      });
      toast(`Created "${c.name}" with ${ids.length} item${ids.length === 1 ? '' : 's'}`, 'success');
    } else if (existingId) {
      addItems(existingId, ids);
      toast(`Added ${ids.length} item${ids.length === 1 ? '' : 's'}`, 'success');
    }
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isCreate ? 'New collection' : 'Add to collection'}
      maxHeight="92vh"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex-1" />
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className={cn(!canSave && 'opacity-60')}
          >
            {isCreate
              ? `Create${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`
              : `Add${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`}
          </Button>
        </div>
      }
    >
      {isCreate && (
        <section className="pb-2">
          <label className="block">
            <span className="section-label">Name</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Beach Day, Office Layers, Wedding Guest"
              maxLength={42}
              className="input-field mt-2 w-full text-[14px] placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="mt-3 block">
            <span className="section-label">Description (optional)</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short note about this set"
              maxLength={80}
              className="input-field mt-2 w-full placeholder:text-ink-ghost focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </section>
      )}

      {/* Item picker */}
      <section className="mt-4">
        <div className="flex items-center justify-between">
          <p className="section-label">
            Pick items
            <span className="ml-1.5 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums tracking-tightish text-ink-subtle">
              {selectedIds.size}
            </span>
          </p>
          {selectedIds.size > 0 && (
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-[11px] font-semibold tracking-tightish text-ink-faint hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto no-scrollbar px-1">
          <Chip uppercase active={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </Chip>
          {CATEGORY_ORDER.map((c) => (
            <Chip
              key={c}
              uppercase
              active={filter === c}
              onClick={() => setFilter(c)}
            >
              {CATEGORY_LABELS[c]}
            </Chip>
          ))}
        </div>

        {/* Grid */}
        {filteredItems.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-border-subtle bg-bg px-4 py-10 text-center">
            <p className="text-[13px] text-ink-subtle">
              {mode === 'addToExisting' && existingItemIds.length > 0
                ? "All your items in this category are already in the collection."
                : "Nothing in this category yet."}
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {filteredItems.map((it) => (
              <ItemCard
                key={it.id}
                item={it}
                selectable
                selected={selectedIds.has(it.id)}
                onClick={() => toggle(it.id)}
              />
            ))}
          </div>
        )}
      </section>
    </Sheet>
  );
}

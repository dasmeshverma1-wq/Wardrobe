import { useMemo, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ItemCard } from '@/components/wardrobe/ItemCard';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { useCollectionsStore, type Collection } from '@/store/collectionsStore';
import { toast } from '@/components/ui/Toast';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * Detail view for a single collection. Shows the items as a 3-col grid and
 * exposes Add / Remove / Rename / Delete affordances.
 *
 * The "Add items" affordance just closes this sheet and signals the parent to
 * open `CreateCollectionSheet` in `addToExisting` mode (so we don't end up
 * with two stacked modal sheets fighting for focus).
 */
export function CollectionDetailSheet({
  open,
  onClose,
  collection,
  onRequestAddItems,
}: {
  open: boolean;
  onClose: () => void;
  collection: Collection | undefined;
  onRequestAddItems: (id: string) => void;
}) {
  const items = useWardrobeStore((s) => s.items);
  const removeItems = useCollectionsStore((s) => s.removeItems);
  const renameCollection = useCollectionsStore((s) => s.renameCollection);
  const deleteCollection = useCollectionsStore((s) => s.deleteCollection);

  const [editing, setEditing] = useState(false);
  const [removeMode, setRemoveMode] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(collection?.name ?? '');
  const [description, setDescription] = useState(collection?.description ?? '');

  // Sync local edit fields when the active collection changes.
  if (collection && !editing && (name !== collection.name || description !== (collection.description ?? ''))) {
    setName(collection.name);
    setDescription(collection.description ?? '');
  }

  const collectionItems = useMemo(() => {
    if (!collection) return [];
    const itemsById = new Map(items.map((it) => [it.id, it]));
    return collection.itemIds
      .map((id) => itemsById.get(id))
      .filter((it): it is NonNullable<typeof it> => Boolean(it));
  }, [collection, items]);

  if (!collection) return null;

  const togglePending = (id: string) => {
    setPendingRemoval((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const commitRemoval = () => {
    if (pendingRemoval.size === 0) {
      setRemoveMode(false);
      return;
    }
    removeItems(collection.id, Array.from(pendingRemoval));
    toast(`Removed ${pendingRemoval.size} from "${collection.name}"`);
    setPendingRemoval(new Set());
    setRemoveMode(false);
  };

  const commitRename = () => {
    renameCollection(collection.id, name, description);
    setEditing(false);
    toast('Collection updated');
  };

  return (
    <>
      <Sheet
        open={open}
        onClose={() => {
          setEditing(false);
          setRemoveMode(false);
          setPendingRemoval(new Set());
          onClose();
        }}
        maxHeight="92vh"
        title={
          editing ? (
            <span className="text-ink-faint">Editing collection</span>
          ) : (
            <span className="flex items-center gap-2">
              {collection.name}
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold tabular-nums tracking-tightish text-ink-subtle">
                {collection.itemIds.length}
              </span>
            </span>
          )
        }
      >
        {editing ? (
          <section className="pb-2">
            <label className="block">
              <span className="section-label">Name</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={42}
                className="input-field mt-2 w-full text-[14px] focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="mt-3 block">
              <span className="section-label">Description (optional)</span>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={80}
                className="input-field mt-2 w-full text-[13px] focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <div className="mt-5 flex items-center gap-2">
              <Button
                variant="danger"
                onClick={() => setConfirmDelete(true)}
                leadingIcon={<TrashIcon size={16} />}
              >
                Delete
              </Button>
              <div className="flex-1" />
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button onClick={commitRename} leadingIcon={<CheckIcon size={16} />}>
                Save
              </Button>
            </div>
          </section>
        ) : (
          <>
            {collection.description && (
              <p className="text-[13px] leading-[1.45] text-ink-subtle">
                {collection.description}
              </p>
            )}

            {/* Toolbar */}
            <div className="mt-4 flex items-center gap-1.5">
              <ToolbarPill
                onClick={() => onRequestAddItems(collection.id)}
                icon={<PlusIcon size={14} />}
                label="Add items"
                tone="primary"
              />
              <ToolbarPill
                onClick={() => {
                  setRemoveMode((v) => !v);
                  setPendingRemoval(new Set());
                }}
                icon={<TrashIcon size={14} />}
                label={removeMode ? 'Done' : 'Remove'}
                tone={removeMode ? 'ink' : 'default'}
                disabled={collection.itemIds.length === 0}
              />
              <div className="flex-1" />
              <ToolbarPill
                onClick={() => setEditing(true)}
                icon={<EditIcon size={14} />}
                label="Edit"
                tone="default"
              />
            </div>

            {/* Items grid */}
            {collectionItems.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-border-subtle bg-bg px-4 py-12 text-center">
                <p className="text-[14px] font-bold tracking-tightish text-ink-strong">
                  Nothing in here yet
                </p>
                <p className="mt-1 text-[12px] text-ink-faint">
                  Tap "Add items" to start curating this collection.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {collectionItems.map((it) => (
                  <ItemCard
                    key={it.id}
                    item={it}
                    selectable={removeMode}
                    selected={pendingRemoval.has(it.id)}
                    onClick={() => removeMode && togglePending(it.id)}
                  />
                ))}
              </div>
            )}

            {/* Remove confirmation row */}
            {removeMode && pendingRemoval.size > 0 && (
              <div className="sticky bottom-0 -mx-5 mt-6 flex items-center gap-2 border-t border-divider bg-bg px-5 pb-[calc(0.5rem+var(--safe-bottom))] pt-3">
                <p className="text-[13px] font-semibold tracking-tightish text-ink">
                  {pendingRemoval.size} selected
                </p>
                <div className="flex-1" />
                <Button variant="ghost" onClick={() => { setPendingRemoval(new Set()); setRemoveMode(false); }}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={commitRemoval} leadingIcon={<TrashIcon size={16} />}>
                  Remove
                </Button>
              </div>
            )}
          </>
        )}
      </Sheet>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete "${collection.name}"?`}
        body="The collection is removed but the items inside stay in your closet."
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteCollection(collection.id);
          setConfirmDelete(false);
          setEditing(false);
          onClose();
          toast('Collection deleted');
        }}
      />
    </>
  );
}

function ToolbarPill({
  icon,
  label,
  onClick,
  tone = 'default',
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'primary' | 'ink';
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold tracking-tightish transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        tone === 'primary' && 'bg-primary text-white hover:bg-primary-dark',
        tone === 'ink' && 'bg-ink text-white',
        tone === 'default' && 'border border-border bg-bg text-ink hover:bg-bg-soft',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      {icon}
      {label}
    </button>
  );
}

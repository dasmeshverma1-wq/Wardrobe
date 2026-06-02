import type { Collection } from '@/store/collectionsStore';
import type { WardrobeItem } from '@/types';
import { cn } from '@/lib/cn';
import { HangerIcon } from '@/components/ui/Icon';

/**
 * Magazine-style collection card.
 *
 * Layout (inspired by lookbook tiles):
 *   - 4-up mosaic of item thumbnails on top (or fewer + soft placeholder)
 *   - White footer with title, item count, and (optional) description.
 *
 * The whole tile is a button so taps open the detail sheet.
 */
export function CollectionCard({
  collection,
  items,
  onClick,
}: {
  collection: Collection;
  items: WardrobeItem[];
  onClick: () => void;
}) {
  const itemsById = new Map(items.map((it) => [it.id, it]));
  const thumbs = collection.itemIds
    .map((id) => itemsById.get(id))
    .filter((it): it is WardrobeItem => Boolean(it))
    .slice(0, 4);

  const aria = `${collection.name}, ${collection.itemIds.length} ${collection.itemIds.length === 1 ? 'item' : 'items'}${collection.description ? '. ' + collection.description : ''}. Tap to open.`;
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      className={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bg text-left transition-transform active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      )}
    >
      {/* 2x2 mosaic */}
      <div className="grid aspect-square grid-cols-2 gap-px bg-divider/60">
        {Array.from({ length: 4 }).map((_, i) => {
          const it = thumbs[i];
          return (
            <div
              key={i}
              className="relative flex items-center justify-center bg-bg-soft"
            >
              {it ? (
                <img
                  src={it.thumbnailDataUrl}
                  alt=""
                  className="h-[78%] w-[78%] object-contain"
                  draggable={false}
                />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-full bg-bg text-ink-ghost">
                  <HangerIcon size={14} />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold tracking-tightish text-ink-strong">
            {collection.name}
          </p>
          <p className="text-[11px] text-ink-faint">
            {collection.itemIds.length}{' '}
            {collection.itemIds.length === 1 ? 'item' : 'items'}
            {collection.description && (
              <>
                <span className="mx-1.5 text-ink-ghost">·</span>
                <span className="truncate">{collection.description}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </button>
  );
}

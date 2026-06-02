import { useNavigate } from 'react-router-dom';
import { Sheet } from '@/components/ui/Sheet';
import {
  UserIcon,
  SparklesIcon,
  PlusIcon,
  ChevronRightIcon,
  CloseIcon,
} from '@/components/ui/Icon';
import type { WardrobeItem } from '@/types';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { cn } from '@/lib/cn';

type Mode = {
  id: 'dressing-room' | 'try-on';
  title: string;
  sub: string;
  icon: typeof UserIcon;
  badge?: string;
};

const MODES: Mode[] = [
  {
    id: 'dressing-room',
    title: 'Mix and Match',
    sub: 'Fill fixed slots — top, bottom, outer, bag & more.',
    icon: UserIcon,
  },
  {
    id: 'try-on',
    title: 'AI Try-On',
    sub: 'See outfits on your body with AI.',
    icon: SparklesIcon,
  },
];

export function StudioModeSheet({
  open,
  onClose,
  selectedItems,
  onAddMore,
}: {
  open: boolean;
  onClose: () => void;
  selectedItems: WardrobeItem[];
  onAddMore?: () => void;
}) {
  const navigate = useNavigate();
  const toggleSelect = useWardrobeStore((s) => s.toggleSelect);

  const choose = (mode: Mode['id']) => {
    onClose();
    const itemIds = selectedItems.map((it) => it.id);
    window.setTimeout(() => {
      if (mode === 'try-on') {
        navigate('/studio/try-on', { state: { itemIds } });
      } else {
        navigate('/studio', { state: { seedIds: itemIds } });
      }
    }, 80);
  };

  const handleAddMore = () => {
    if (onAddMore) onAddMore();
    else onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          Build an outfit
          <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold tabular-nums tracking-tightish text-ink-subtle">
            {selectedItems.length}
          </span>
        </span>
      }
      maxHeight="68vh"
    >
      <div className="-mx-1 flex gap-2 overflow-x-auto no-scrollbar px-1 py-1">
        {selectedItems.map((it) => (
          <div key={it.id} className="relative shrink-0">
            <div className="h-20 w-20 overflow-hidden rounded-xl border border-border-subtle bg-bg p-2">
              <img
                src={it.thumbnailDataUrl}
                className="h-full w-full object-contain"
                alt=""
                draggable={false}
              />
            </div>
            <button
              onClick={() => toggleSelect(it.id)}
              aria-label={`Remove ${it.name ?? 'item'} from selection`}
              className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-ink-strong text-white transition-colors hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <CloseIcon size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={handleAddMore}
          aria-label="Add more items from the closet"
          className={cn(
            'flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold tracking-tightish text-ink-subtle',
            'border border-dashed border-border transition-colors hover:border-ink hover:text-ink',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          )}
        >
          <PlusIcon size={16} />
          Add more
        </button>
      </div>

      <h2 className="mt-5 text-[14px] font-bold tracking-tightish text-ink-strong">
        Choose a mode
      </h2>
      <p className="mt-0.5 text-[12px] text-ink-faint">
        Each mode saves to your Outfits when you tap Save.
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <li key={m.id}>
              <button
                onClick={() => choose(m.id)}
                aria-label={`${m.title}: ${m.sub}${m.badge ? ` (${m.badge})` : ''}`}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-2xl border border-border-subtle bg-bg p-3.5 text-left transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  m.id === 'try-on'
                    ? 'active:bg-bg-soft hover:border-border'
                    : 'active:bg-bg-soft hover:border-border',
                )}
              >
                <span
                  className={cn(
                    'grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border-subtle',
                    m.id === 'try-on' ? 'bg-accent-aiSoft text-accent-ai' : 'bg-bg text-ink',
                  )}
                >
                  <Icon size={20} />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold tracking-tightish text-ink-strong">
                      {m.title}
                    </span>
                    {m.badge && (
                      <span className="rounded-full border border-border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widish text-ink-subtle">
                        {m.badge}
                      </span>
                    )}
                  </span>
                  <span className="block text-[12px] text-ink-faint">{m.sub}</span>
                </span>
                <ChevronRightIcon size={16} className="text-ink-faint" />
              </button>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}

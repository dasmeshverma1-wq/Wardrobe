import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNav } from '@/components/ui/TopNav';
import { Button } from '@/components/ui/Button';
import {
  UserIcon,
  SparklesIcon,
  PlusIcon,
  ChevronRightIcon,
  CloseIcon,
} from '@/components/ui/Icon';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { toast } from '@/components/ui/Toast';
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

export function StudioModePicker() {
  const navigate = useNavigate();
  const items = useWardrobeStore((s) => s.items);
  const selectedIds = useWardrobeStore((s) => s.selectedIds);
  const toggleSelect = useWardrobeStore((s) => s.toggleSelect);

  const selectedItems = useMemo(
    () => items.filter((it) => selectedIds.has(it.id)),
    [items, selectedIds],
  );

  useEffect(() => {
    if (selectedItems.length === 0) {
      toast('Pick items from your closet first', 'warning');
      navigate('/create-outfit', { replace: true });
    }
  }, [selectedItems.length, navigate]);

  if (selectedItems.length === 0) return null;

  const choose = (mode: Mode['id']) => {
    const itemIds = selectedItems.map((it) => it.id);
    if (mode === 'try-on') {
      navigate('/studio/try-on', { state: { itemIds } });
    } else {
      navigate('/studio', { state: { seedIds: itemIds } });
    }
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-bg">
      <TopNav title="Build an outfit" showBack borderless />
      <div className="scroll-area page-x pb-6">
        <p className="section-label">{selectedItems.length} selected</p>
        <div className="mt-2 -mx-1 flex gap-2 overflow-x-auto no-scrollbar px-1 py-1">
          {selectedItems.map((it) => (
            <div key={it.id} className="relative shrink-0">
              <div className="h-20 w-20 overflow-hidden rounded-xl border border-border-subtle bg-bg p-2">
                <img src={it.thumbnailDataUrl} className="h-full w-full object-contain" alt="" />
              </div>
              <button
                onClick={() => toggleSelect(it.id)}
                aria-label="Remove from selection"
                className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-ink text-white shadow-card"
              >
                <CloseIcon size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={() => navigate('/wardrobe')}
            className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-[11px] font-semibold tracking-tightish text-ink-subtle"
          >
            <PlusIcon size={16} />
            Add more
          </button>
        </div>

        <h2 className="mt-7 text-[15px] font-bold tracking-tightish text-ink">Choose a mode</h2>
        <p className="text-[12px] text-ink-faint">Each mode saves to your Outfits when you tap Save.</p>

        <ul className="mt-3 flex flex-col gap-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <li key={m.id}>
                <button
                  onClick={() => choose(m.id)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-2xl border border-border-subtle bg-bg p-3.5 text-left transition-colors active:bg-bg-soft',
                    m.id === 'try-on' && 'hover:border-border',
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
                      <span className="text-[14px] font-semibold tracking-tightish text-ink">{m.title}</span>
                      {m.badge && (
                        <span className="rounded-full border border-border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widish text-ink-subtle">
                          {m.badge}
                        </span>
                      )}
                    </span>
                    <span className="block text-[12px] text-ink-faint">{m.sub}</span>
                  </span>
                  <ChevronRightIcon size={18} className="text-ink-faint" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-divider bg-bg px-page py-3 pb-[calc(0.75rem+var(--safe-bottom))]">
        <Button fullWidth variant="ghost" onClick={() => navigate('/wardrobe')}>
          Back to closet
        </Button>
      </div>
    </div>
  );
}

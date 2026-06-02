import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNav } from '@/components/ui/TopNav';
import { Sheet } from '@/components/ui/Sheet';
import { ClosetPicker } from '@/components/wardrobe/ClosetPicker';
import { Button } from '@/components/ui/Button';
import { UserIcon, ChevronRightIcon, WandIcon } from '@/components/ui/Icon';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { navigateToTryOn, tryOnStateFromItems } from '@/lib/tryOnNavigation';

type StudioChoice = 'mix' | 'tryon';

const MODES: { id: StudioChoice; title: string; sub: string; icon: typeof UserIcon }[] = [
  {
    id: 'mix',
    title: 'Mix & Match',
    sub: 'Fill fixed slots — top, bottom, outer, bag & more',
    icon: UserIcon,
  },
  {
    id: 'tryon',
    title: 'AI Try-On',
    sub: 'See outfits on your body',
    icon: WandIcon,
  },
];

export function CreateOutfit() {
  const navigate = useNavigate();
  const setSelection = useWardrobeStore((s) => s.setSelection);
  const [modeOpen, setModeOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  function handleContinue(ids: string[]) {
    if (ids.length === 0) {
      toast('Pick at least one item', 'warning');
      return;
    }
    setPendingIds(ids);
    setModeOpen(true);
  }

  function launch(mode: StudioChoice) {
    setSelection(pendingIds);
    setModeOpen(false);
    if (mode === 'tryon') {
      navigateToTryOn(navigate, tryOnStateFromItems(pendingIds));
      return;
    }
    navigate('/studio', { state: { seedIds: pendingIds } });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <TopNav
        title="Create outfit"
        showBack
        onBack={() => navigate(-1)}
        borderless
      />

      <ClosetPicker
        onContinue={handleContinue}
        continueLabel="Continue"
        onAddItems={() => navigate('/wardrobe/add')}
      />

      <Sheet open={modeOpen} onClose={() => setModeOpen(false)} title="How do you want to build it?">
        <div className="flex flex-col gap-2 pb-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => launch(m.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border border-border-subtle bg-bg px-4 py-3 text-left',
                  'transition-colors hover:bg-bg-soft active:scale-[0.99]',
                )}
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <Icon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-bold text-ink-strong">{m.title}</span>
                  <span className="block text-[12px] text-ink-subtle">{m.sub}</span>
                </span>
                <ChevronRightIcon size={18} className="shrink-0 text-ink-faint" />
              </button>
            );
          })}
          <Button variant="ghost" fullWidth onClick={() => setModeOpen(false)}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

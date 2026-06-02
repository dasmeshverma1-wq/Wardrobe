import { Sheet } from '@/components/ui/Sheet';
import { STUDIO_BACKGROUNDS, type StudioBackground } from '@/data/studioBackgrounds';
import { cn } from '@/lib/cn';

type Props = {
  open: boolean;
  onClose: () => void;
  value: StudioBackground;
  onChange: (bg: StudioBackground) => void;
};

/** Minimal background picker — swatches only, opened from the Studio toolbar. */
export function StudioBackgroundSheet({ open, onClose, value, onChange }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title="Background" maxHeight="38vh">
      <div className="grid grid-cols-4 gap-3 pb-2">
        {STUDIO_BACKGROUNDS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => {
              onChange(b);
              onClose();
            }}
            aria-label={`${b.label} background`}
            aria-pressed={value.id === b.id}
            className="flex flex-col items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl"
          >
            <span
              className={cn(
                'h-12 w-12 rounded-2xl ring-1 transition-all',
                value.id === b.id ? 'ring-2 ring-ink-strong scale-105' : 'ring-1 ring-border',
              )}
              style={{ backgroundColor: b.value }}
            />
            <span
              className={cn(
                'text-[10px] tracking-tightish',
                value.id === b.id ? 'font-bold text-ink' : 'text-ink-faint',
              )}
            >
              {b.label}
            </span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

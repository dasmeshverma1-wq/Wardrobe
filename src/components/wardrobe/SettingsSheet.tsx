import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { clear as idbClear } from 'idb-keyval';
import { Sheet } from '@/components/ui/Sheet';
import { ConfirmDialog } from '@/components/ui/Modal';
import {
  SparklesIcon,
  RotateIcon,
  TrashIcon,
  ChevronRightIcon,
  HangerIcon,
  CalendarIcon,
} from '@/components/ui/Icon';
import { useProfileStore } from '@/store/profileStore';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { useOutfitStore } from '@/store/outfitStore';
import { usePlannerStore } from '@/store/plannerStore';
import { useChrome } from '@/store/chromeStore';
import { TryOnScenarioToggle } from '@/components/settings/TryOnScenarioSettings';
import { cn } from '@/lib/cn';

const PALETTE: Record<string, { label: string; swatches: string[] }> = {
  neutral: { label: 'Neutral', swatches: ['#F4F4F6', '#D8D4CC', '#8A8275'] },
  warm: { label: 'Warm', swatches: ['#D9603B', '#C77A1A', '#8C5A36'] },
  cool: { label: 'Cool', swatches: ['#3A78D1', '#3CA67E', '#A7B7C2'] },
  bold: { label: 'Bold', swatches: ['#FF3F6C', '#3CA67E', '#EFC439'] },
  monochrome: { label: 'Mono', swatches: ['#0F1115', '#FFFFFF', '#8A8B91'] },
};

/**
 * Settings drawer accessed from the wardrobe TopNav cog.
 */
export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const profile = useProfileStore((s) => s.profile);
  const itemCount = useWardrobeStore((s) => s.items.length);
  const outfitCount = useOutfitStore((s) => s.outfits.length);
  const plannerCount = usePlannerStore((s) => Object.keys(s.entries).length);
  const wireframeVersion = useChrome((s) => s.wireframeVersion);
  const setWireframeVersion = useChrome((s) => s.setWireframeVersion);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const palette = PALETTE[profile?.palette ?? 'neutral'];
  const vibes = profile?.vibes ?? [];
  const occasions = profile?.occasions ?? [];

  const goEditPrefs = () => {
    onClose();
    window.setTimeout(() => navigate('/onboarding?reset=1'), 120);
  };

  const handleResetEverything = async () => {
    setResetting(true);
    const activeVersion = useChrome.getState().wireframeVersion;
    const activePersona = useChrome.getState().tryOnWireframePersona;
    try {
      await idbClear();
    } catch {
      /* idb may not exist on first run; ignore */
    }
    try {
      window.localStorage.clear();
    } catch {
      /* private mode etc.; the next reload will fall back to seed data */
    }
    // Wiping localStorage clears wireframeVersion, so we re-save the active choice
    localStorage.setItem('myntra-wardrobe/wireframe-version', activeVersion);
    localStorage.setItem('myntra-wardrobe/tryon-wireframe-persona', activePersona);
    
    if (activeVersion === 'v2') {
      window.location.assign('/home');
    } else {
      window.location.assign('/onboarding');
    }
  };

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title="Settings"
        maxHeight="85vh"
        contentClassName="min-h-0 overflow-y-auto overscroll-contain pb-[calc(1rem+var(--safe-bottom))]"
      >
        {/* Wireframe / demo toggles — compact, same pattern as before */}
        <section className="mb-4 rounded-3xl border border-border-subtle bg-bg p-4">
          <p className="section-label text-primary">Wireframe</p>
          <div className="mt-2.5 flex items-center justify-between gap-3">
            <span className="shrink-0 text-[14px] font-semibold text-ink-strong">Active layout</span>
            <div className="flex min-w-0 max-w-[15rem] flex-1 justify-end rounded-full border border-border-subtle bg-bg-soft p-0.5">
              <button
                type="button"
                onClick={() => {
                  setWireframeVersion('v1');
                  onClose();
                }}
                className={cn(
                  'min-w-0 flex-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all',
                  wireframeVersion === 'v1'
                    ? 'bg-ink-strong text-white shadow-sm'
                    : 'text-ink-subtle',
                )}
              >
                V1
              </button>
              <button
                type="button"
                onClick={() => {
                  setWireframeVersion('v2');
                  onClose();
                }}
                className={cn(
                  'min-w-0 flex-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all',
                  wireframeVersion === 'v2'
                    ? 'bg-ink-strong text-white shadow-sm'
                    : 'text-ink-subtle',
                )}
              >
                V2
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-divider pt-3">
            <span className="shrink-0 text-[14px] font-semibold text-ink-strong">Try-on scenario</span>
            <TryOnScenarioToggle />
          </div>
        </section>

        {/* Profile summary card */}
        <section className="rounded-3xl border border-border-subtle bg-bg p-4">
          <p className="section-label text-primary">Your style</p>
          <div className="mt-2.5 flex items-start gap-3">
            <div className="flex shrink-0 -space-x-1.5">
              {palette.swatches.map((c, i) => (
                <span
                  key={i}
                  className="h-7 w-7 rounded-full ring-2 ring-bg"
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold tracking-tightish text-ink-strong">{palette.label} palette</p>
              {vibes.length > 0 ? (
                <p className="mt-0.5 truncate text-[12px] text-ink-subtle">
                  {vibes.join(' · ')}
                </p>
              ) : (
                <p className="mt-0.5 text-[12px] italic text-ink-faint">No vibes selected yet</p>
              )}
              {occasions.length > 0 && (
                <p className="mt-0.5 truncate text-[11px] uppercase tracking-widish text-ink-faint">
                  {occasions.join(' · ')}
                </p>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div
            className={cn(
              'mt-4 grid gap-2 rounded-2xl border border-divider bg-bg-soft p-2',
              wireframeVersion === 'v2' ? 'grid-cols-2' : 'grid-cols-3',
            )}
          >
            <Stat icon={<HangerIcon size={14} />} value={itemCount} label="items" />
            <Stat icon={<SparklesIcon size={14} />} value={outfitCount} label="outfits" />
            {wireframeVersion !== 'v2' && (
              <Stat icon={<CalendarIcon size={14} />} value={plannerCount} label="planned" />
            )}
          </div>
        </section>

        {/* Action list — iOS-style */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-border-subtle bg-bg">
          <SettingsRow
            icon={<SparklesIcon size={16} />}
            title="Edit your preferences"
            subtitle="Update vibes, occasions and palette"
            onClick={goEditPrefs}
          />
          <Divider />
          <SettingsRow
            icon={<RotateIcon size={16} />}
            title="Replay welcome tour"
            subtitle="See the intro screens again"
            onClick={goEditPrefs}
          />
          <Divider />
          <SettingsRow
            icon={<TrashIcon size={16} />}
            title="Reset everything"
            subtitle="Clear wardrobe, outfits, planner and start over"
            onClick={() => setConfirmOpen(true)}
            tone="danger"
          />
        </section>

        <p className="mt-4 px-1 text-[11px] leading-relaxed text-ink-faint">
          Your data lives only on this device. Resetting deletes images, outfits and planner pins —
          this can't be undone.
        </p>
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        title="Reset everything?"
        body={
          <>
            This wipes <strong>{itemCount} items</strong>, <strong>{outfitCount} outfits</strong> and{' '}
            <strong>{plannerCount} planner pins</strong>, then restarts onboarding from scratch.
          </>
        }
        confirmLabel={resetting ? 'Resetting…' : 'Reset everything'}
        destructive
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleResetEverything}
      />
    </>
  );
}

/* ---------- helpers ---------- */

function Stat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl py-1.5">
      <span className="flex items-center gap-1 text-ink">
        {icon}
        <span className="text-[15px] font-bold tabular-nums tracking-tightish">{value}</span>
      </span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widish text-ink-faint">
        {label}
      </span>
    </div>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  onClick,
  tone = 'default',
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      onClick={onClick}
      aria-label={subtitle ? `${title}. ${subtitle}` : title}
      className={cn(
        'flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors',
        'hover:bg-bg-soft active:bg-neutral-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-inset',
      )}
    >
      <span
        className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
          tone === 'danger' ? 'border border-primary/20 bg-bg text-primary' : 'border border-border-subtle bg-bg text-ink',
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate text-[14px] font-semibold tracking-tightish',
            tone === 'danger' ? 'text-primary' : 'text-ink',
          )}
        >
          {title}
        </span>
        {subtitle && (
          <span className="block truncate text-[12px] text-ink-faint">{subtitle}</span>
        )}
      </span>
      <ChevronRightIcon
        size={16}
        className={tone === 'danger' ? 'text-primary/60' : 'text-ink-ghost'}
      />
    </button>
  );
}

function Divider() {
  return <span className="block h-px bg-divider/70" />;
}

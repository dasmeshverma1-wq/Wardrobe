import { useChrome } from '@/store/chromeStore';
import { useTryOnStore } from '@/store/tryOnStore';
import type { TryOnWireframePersona } from '@/lib/tryOnPersona';
import { cn } from '@/lib/cn';

const SCENARIOS: {
  id: TryOnWireframePersona;
  label: string;
  description: string;
}[] = [
  {
    id: 'first-time',
    label: 'First-time',
    description: 'No try-on photos yet — onboarding and promos for new users.',
  },
  {
    id: 'has-photos',
    label: 'Has photos',
    description: 'Returning user with sample avatar and demo outfits (wireframe).',
  },
  {
    id: 'real-time',
    label: 'Real-time',
    description: 'Uses your device camera for selfies and body shots — no auto-filled photos.',
  },
];

/**
 * Try-On wireframe persona — lives in Settings next to the V1 / V2 layout switch.
 */
export function TryOnScenarioSettings() {
  const persona = useChrome((s) => s.tryOnWireframePersona);
  const setPersona = useChrome((s) => s.setTryOnWireframePersona);

  const onSelect = (next: TryOnWireframePersona) => {
    if (next === persona) return;
    setPersona(next);
    if (next === 'real-time' || next === 'first-time') {
      void useTryOnStore.getState().clearAvatar();
    }
  };

  const active = SCENARIOS.find((s) => s.id === persona);

  return (
    <section className="mb-4 rounded-3xl border border-border-subtle bg-bg p-4">
      <p className="section-label text-primary">Try-On user scenario</p>
      <p className="mt-1 text-[12px] leading-snug text-ink-subtle">
        Controls onboarding, sample photos, and whether capture uses the live camera.
      </p>

      <div
        className="mt-3 flex flex-col gap-1 rounded-2xl border border-border-subtle bg-bg-soft p-1"
        role="group"
        aria-label="Try-on user scenario"
      >
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={cn(
              'rounded-xl px-3 py-2.5 text-left transition-colors',
              persona === s.id
                ? 'bg-ink-strong text-white shadow-sm'
                : 'text-ink-subtle hover:bg-white/80 hover:text-ink',
            )}
          >
            <span className="block text-[13px] font-bold tracking-tightish">{s.label}</span>
            <span
              className={cn(
                'mt-0.5 block text-[11px] leading-snug',
                persona === s.id ? 'text-white/80' : 'text-ink-faint',
              )}
            >
              {s.description}
            </span>
          </button>
        ))}
      </div>

      {active && (
        <p className="mt-2.5 text-[11px] leading-relaxed text-ink-faint">
          Active: <span className="font-semibold text-ink-subtle">{active.label}</span>
          {active.id === 'real-time'
            ? ' — open AI Try-On to grant camera access when capturing photos.'
            : null}
        </p>
      )}
    </section>
  );
}

import { useChrome } from '@/store/chromeStore';
import { useTryOnStore } from '@/store/tryOnStore';
import type { TryOnWireframePersona } from '@/lib/tryOnPersona';
import { cn } from '@/lib/cn';

const SCENARIOS: { id: TryOnWireframePersona; label: string }[] = [
  { id: 'first-time', label: 'New' },
  { id: 'has-photos', label: 'Photos' },
  { id: 'real-time', label: 'Live' },
];

/**
 * Compact 3-way pill toggle — matches Active Layout wireframe control in Settings.
 */
export function TryOnScenarioToggle() {
  const persona = useChrome((s) => s.tryOnWireframePersona);
  const setPersona = useChrome((s) => s.setTryOnWireframePersona);

  const onSelect = (next: TryOnWireframePersona) => {
    if (next === persona) return;
    setPersona(next);
    if (next === 'real-time' || next === 'first-time') {
      void useTryOnStore.getState().clearAvatar();
    }
  };

  return (
    <div
      className="flex min-w-0 max-w-[14.5rem] flex-1 justify-end rounded-full border border-border-subtle bg-bg-soft p-0.5"
      role="group"
      aria-label="Try-on user scenario"
    >
      {SCENARIOS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s.id)}
          className={cn(
            'min-w-0 flex-1 rounded-full px-2 py-1 text-[10px] font-bold transition-all',
            persona === s.id ? 'bg-ink-strong text-white shadow-sm' : 'text-ink-subtle',
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

/** @deprecated Use TryOnScenarioToggle inside the Wireframe settings card. */
export function TryOnScenarioSettings() {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[14px] font-semibold text-ink-strong">Try-on scenario</span>
      <TryOnScenarioToggle />
    </div>
  );
}

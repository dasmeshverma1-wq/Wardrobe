import type { BgProgress } from '@/lib/bgRemoval';

export function BgRemovalProgress({ progress }: { progress: BgProgress | null }) {
  if (!progress) return null;
  const label =
    progress.stage === 'downloading-model'
      ? 'Warming up the model…'
      : progress.stage === 'processing'
      ? 'Removing background'
      : progress.stage === 'fallback'
      ? 'Using simple cutout (model unavailable)'
      : 'Done';
  const pct = Math.min(100, Math.max(0, progress.pct ?? 0));
  return (
    <div className="flex flex-col gap-2 py-1">
      <p className="text-[14px] font-semibold tracking-tightish text-ink">{label}</p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-ink transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      {progress.stage === 'downloading-model' && (
        <p className="text-[11px] text-ink-faint">
          First time only ~10 MB download. Cached for next uploads.
        </p>
      )}
    </div>
  );
}

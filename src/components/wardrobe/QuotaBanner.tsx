import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

type Quota = { usage: number; quota: number };

async function readQuota(): Promise<Quota | null> {
  if (typeof navigator === 'undefined' || !('storage' in navigator) || !navigator.storage?.estimate) {
    return null;
  }
  try {
    const est = await navigator.storage.estimate();
    if (typeof est.usage !== 'number' || typeof est.quota !== 'number' || est.quota === 0) return null;
    return { usage: est.usage, quota: est.quota };
  } catch {
    return null;
  }
}

export function QuotaBanner() {
  const [q, setQ] = useState<Quota | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('wardrobe:quotaDismissed') === '1';
  });

  useEffect(() => {
    let alive = true;
    readQuota().then((next) => alive && setQ(next));
    return () => {
      alive = false;
    };
  }, []);

  if (!q || dismissed) return null;
  const pct = q.usage / q.quota;
  if (pct < 0.75) return null;

  const severe = pct >= 0.9;

  return (
    <div className="mx-page mt-3 rounded-2xl border border-border-subtle bg-bg px-4 py-2.5">
      <div className="flex items-start gap-2">
        <span className={cn('mt-1 inline-block h-2 w-2 shrink-0 rounded-full', severe ? 'bg-primary' : 'bg-accent-gold')} />
        <div className="flex-1">
          <div className="text-[12px] font-semibold tracking-tightish text-ink">
            {severe ? 'Your wardrobe storage is almost full' : 'Storage is filling up'}
          </div>
          <div className="text-[11px] text-ink-faint">
            Using {Math.round(pct * 100)}% of the available browser storage. Try removing items you no longer wear.
          </div>
        </div>
        <button
          onClick={() => {
            setDismissed(true);
            try {
              sessionStorage.setItem('wardrobe:quotaDismissed', '1');
            } catch {
              /* ignore */
            }
          }}
          className="text-[11px] font-semibold tracking-tightish text-ink-subtle hover:text-ink"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { CheckIcon } from '@/components/ui/Icon';

/**
 * Brief overlay shown when an outfit is freshly saved.
 * Sized to the mobile shell, animates in, auto-dismisses, then unmounts.
 */
export function SavedCelebration({ trigger }: { trigger: boolean }) {
  const [phase, setPhase] = useState<'in' | 'out' | 'gone'>('gone');

  useEffect(() => {
    if (!trigger) return;
    setPhase('in');
    const t1 = setTimeout(() => setPhase('out'), 1300);
    const t2 = setTimeout(() => setPhase('gone'), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [trigger]);

  if (phase === 'gone') return null;

  return (
    <div
      className={
        'pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center bg-bg/60 backdrop-blur-sm transition-opacity duration-500 ' +
        (phase === 'out' ? 'opacity-0' : 'opacity-100')
      }
      aria-hidden
    >
      <div className="relative animate-pop-in">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-ink text-white shadow-pop">
          <CheckIcon size={36} />
        </div>
        <Sparkle className="absolute -left-3 -top-2 text-primary" delay={0} />
        <Sparkle className="absolute -right-3 -top-3 text-accent-gold" delay={120} />
        <Sparkle className="absolute -right-2 -bottom-2 text-accent-mint" delay={240} />
        <Sparkle className="absolute -left-4 -bottom-1 text-accent-sky" delay={360} />
      </div>
      <p className="mt-5 text-[15px] font-bold tracking-tightish text-ink animate-rise-in">Outfit saved</p>
    </div>
  );
}

function Sparkle({ className, delay }: { className?: string; delay: number }) {
  return (
    <span
      className={'block animate-sparkle ' + (className ?? '')}
      style={{ animationDelay: `${delay}ms` }}
    >
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import {
  WandIcon,
  CheckIcon,
} from '@/components/ui/Icon';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';

/**
 * "Coming soon" surface used as a stub for unfinished features (AI Try-On).
 *
 * Refreshed to feel intentional rather than apologetic — soft pink + lilac
 * gradient stage, an evocative wand illustration, a "Notify me" affordance,
 * and a clean Back button so users don't feel trapped.
 */
export function ComingSoon({ feature }: { feature: string }) {
  const navigate = useNavigate();
  const [notified, setNotified] = useState(false);

  const onNotify = () => {
    setNotified(true);
    toast(`We'll ping you when ${feature} lands`, 'success');
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-bg overflow-hidden">
      {/* Lightweight top bar — stays minimal so the hero owns the screen */}
      <header className="flex shrink-0 items-center page-x pt-3">
        <BackButton onClick={() => navigate(-1)} />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
        {/* Hero stage — pink → lilac gradient, layered cards + wand */}
        <Stage />

        <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          Coming soon
        </p>
        <h1 className="mt-2 text-[28px] font-black leading-[1.05] tracking-tightish text-ink text-balance">
          {feature}
        </h1>
        <p className="mt-3 max-w-[20rem] text-[14px] leading-[1.5] text-ink-subtle text-balance">
          We're crafting an AI try-on that drapes your wardrobe on a digital
          model in seconds. In v1 it's a designed preview only.
        </p>

        <div className="mt-7 flex w-full max-w-[20rem] flex-col gap-2">
          <Button
            fullWidth
            onClick={onNotify}
            disabled={notified}
            leadingIcon={notified ? <CheckIcon size={16} /> : <WandIcon size={16} />}
          >
            {notified ? "We'll let you know" : 'Notify me when it lands'}
          </Button>
          <Button fullWidth variant="ghost" onClick={() => navigate(-1)}>
            Try Collage or Mix and Match
          </Button>
        </div>

        <p className="mt-7 text-[11px] leading-[1.5] text-ink-faint">
          Want to be a beta tester? Reset your preferences in Settings → "Replay
          welcome tour" — we'll reach out via the email you sign up with.
        </p>
      </div>
    </div>
  );
}

/* ---------- hero stage ---------- */

function Stage() {
  return (
    <div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-hero border border-border-subtle bg-bg">
      {/* radial highlight */}
      <span className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-2xl" />

      {/* layered card stack to suggest "AI generates looks" */}
      <Layer
        className="left-[20%] top-[18%] -rotate-[10deg]"
        tone="white"
      />
      <Layer
        className="left-[30%] top-[22%] rotate-[6deg]"
        tone="lilac"
      />
      <Layer
        className="left-[40%] top-[26%] -rotate-[2deg]"
        tone="primary"
      />

      {/* wand glyph centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl border-[1.5px] border-ink bg-white text-primary shadow-[2px_3px_0_rgba(38,42,57,0.22)]">
          <WandIcon size={28} />
        </span>
      </div>

      {/* sparkle accents */}
      <Sparkle className="left-6 top-7" />
      <Sparkle className="right-7 top-12" delay={300} />
      <Sparkle className="left-10 bottom-10" delay={600} />
      <Sparkle className="right-9 bottom-7" delay={900} />
    </div>
  );
}

function Layer({
  className,
  tone,
}: {
  className?: string;
  tone: 'white' | 'lilac' | 'primary';
}) {
  const fill =
    tone === 'white'
      ? 'bg-white'
      : tone === 'lilac'
      ? 'bg-lilac-100'
      : 'bg-primary/10';
  return (
    <span
      className={cn(
        'absolute h-[44%] w-[42%] rounded-3xl border-[1.5px] border-ink shadow-[2px_3px_0_rgba(38,42,57,0.18)]',
        fill,
        className,
      )}
    />
  );
}

function Sparkle({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <span
      className={cn('absolute block animate-sparkle', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-accent-ai">
        <path d="M12 4v3M12 17v3M5 12h3M16 12h3M7 7l2 2M15 15l2 2M7 17l2-2M15 9l2-2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { CloseIcon, ChevronRightIcon } from '@/components/ui/Icon';

export type OnboardingSlideProps = {
  /** CSS background (solid or gradient). */
  background: string;
  /** Bold headline lines — rendered uppercase, stacked. */
  headline: string[];
  /** Progress dash index (0-based). */
  stepIndex: number;
  stepCount: number;
  body?: string;
  ctaLabel: string;
  onNext: () => void;
  onSkip: () => void;
  mockup?: ReactNode;
  /** Replaces default body + CTA when set (import / profile). */
  cardChildren?: ReactNode;
  /** Hide phone mockup area (profile step). */
  hideMockup?: boolean;
  /** Taller card for forms. */
  tallCard?: boolean;
  /** Content-height card anchored to bottom (profile step). */
  compactCard?: boolean;
  ctaDisabled?: boolean;
};

export function OnboardingSlide({
  background,
  headline,
  stepIndex,
  stepCount,
  body,
  ctaLabel,
  onNext,
  onSkip,
  mockup,
  cardChildren,
  hideMockup,
  tallCard,
  compactCard,
  ctaDisabled,
}: OnboardingSlideProps) {
  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background }}
    >
      {/* Headline + close */}
      <header
        className={cn(
          'relative z-30 shrink-0 px-5 pb-3 pt-[max(1.5rem,env(safe-area-inset-top))]',
          hideMockup && 'pb-4',
        )}
      >
        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip onboarding"
          className="absolute right-3 top-[max(1.25rem,env(safe-area-inset-top))] grid h-10 w-10 place-items-center text-ink-strong"
        >
          <CloseIcon size={22} strokeWidth={2.5} />
        </button>
        <h1 className="max-w-[min(100%,16rem)] pr-11 font-sans text-[clamp(2.375rem,10.5vw,3.25rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] text-ink-strong">
          {headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
      </header>

      {/* Phone mockup — sits above card with a light overlap at the bottom edge */}
      {!hideMockup && mockup && (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-0 z-10 flex justify-center',
            tallCard ? 'bottom-[min(44vh,20rem)]' : 'bottom-[14.5rem]',
          )}
        >
          <div className="scale-[1.2]">{mockup}</div>
        </div>
      )}

      {hideMockup && compactCard && <div className="min-h-0 flex-1" aria-hidden />}

      {/* Bottom card — overlaps mockup slightly, or compact content card */}
      <div
        className={cn(
          'relative z-20 rounded-t-[2rem] bg-bg px-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5',
          'shadow-[0_-8px_32px_rgba(38,42,57,0.06)]',
          compactCard ? 'mt-auto shrink-0' : 'mt-auto',
          hideMockup && !compactCard && 'flex min-h-0 flex-1 flex-col overflow-hidden',
          !hideMockup && (tallCard ? 'min-h-[44vh]' : 'min-h-[17.5rem]'),
        )}
      >
        <ProgressDashes current={stepIndex} total={stepCount} />
        {cardChildren ? (
          <div
            className={cn(
              'mt-4',
              hideMockup && !compactCard && 'flex min-h-0 flex-1 flex-col overflow-hidden',
              !hideMockup && tallCard && 'scroll-area max-h-[38vh] overflow-y-auto',
            )}
          >
            {cardChildren}
          </div>
        ) : (
          <>
            {body && (
              <p className="mt-5 text-center text-[16px] font-medium leading-[1.45] tracking-tightish text-ink-strong">
                {body}
              </p>
            )}
            <button
              type="button"
              onClick={onNext}
              disabled={ctaDisabled}
              className={cn(
                'mx-auto mt-6 flex h-12 items-center gap-2.5 rounded-full bg-ink-strong pl-2 pr-5',
                'text-[15px] font-bold text-white transition-transform active:scale-[0.98]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
                'disabled:opacity-40 disabled:active:scale-100',
              )}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15">
                <ChevronRightIcon size={18} className="text-white" strokeWidth={2.5} />
              </span>
              {ctaLabel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ProgressDashes({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="flex justify-center gap-1.5"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-1 rounded-full transition-all duration-300',
            i <= current ? 'w-7 bg-ink-strong' : 'w-4 bg-line',
          )}
        />
      ))}
    </div>
  );
}

export function PhoneMockup({
  children,
  className,
  size = 'default',
}: {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'large';
}) {
  const width = size === 'large' ? 'w-[252px]' : 'w-[210px]';
  const screenH = size === 'large' ? 'h-[400px]' : 'h-[360px]';

  return (
    <div className={cn(width, className)}>
      <div className="rounded-[2.35rem] border-[5px] border-ink-strong bg-ink-strong p-[5px] shadow-[0_20px_40px_rgba(38,42,57,0.18)]">
        <div className="relative overflow-hidden rounded-[1.7rem] bg-bg">
          <div className="flex items-center justify-between bg-bg px-3 pb-0.5 pt-1.5">
            <span className="text-[8px] font-semibold tabular-nums text-ink-strong">9:41</span>
            <span className="mx-auto h-[14px] w-[52px] rounded-full bg-ink-strong" />
            <span className="flex gap-0.5">
              <span className="h-1.5 w-2.5 rounded-sm bg-ink-strong" />
              <span className="h-1.5 w-2 rounded-sm bg-ink-strong" />
            </span>
          </div>
          <div className={cn('overflow-hidden', screenH)}>{children}</div>
          <div className="flex justify-center bg-bg py-1.5">
            <span className="h-1 w-16 rounded-full bg-ink/15" />
          </div>
        </div>
      </div>
    </div>
  );
}

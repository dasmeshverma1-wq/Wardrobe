/**
 * Inline SVG illustrations for the onboarding feature-explainer screens.
 *
 * They render in a soft tinted "stage" card on top of the screen (~50% of the
 * viewport on phones) and pair with title + body copy below.
 *
 * No external assets — every illustration is composed from Tailwind-styled
 * elements + a tiny inline SVG so they ship in the bundle.
 */

import type { ReactNode } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/cn';
import { mockForecastForDate } from '@/lib/weather';

type StageProps = {
  /** Optional gradient direction class names (override the default). */
  surface: 'cream' | 'mint' | 'lime' | 'lilac';
  ariaLabel: string;
  children: ReactNode;
};

const STAGE_BG: Record<StageProps['surface'], string> = {
  cream: 'bg-gradient-to-br from-[#FBF6EC] to-[#F1E7D3]',
  mint: 'bg-gradient-to-br from-[#EAF6EF] to-[#D7EFE0]',
  // Discover stage — soft Watermelon → Lilac to match the new surface.
  lime: 'bg-gradient-to-br from-[#FFE6EE] via-[#FCEAF3] to-[#EDE2FA]',
  lilac: 'bg-gradient-to-br from-[#F4ECFE] to-[#E1D2F4]',
};

function Stage({ surface, ariaLabel, children }: StageProps) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        'relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-hero',
        STAGE_BG[surface],
      )}
    >
      {/* Soft halo */}
      <span className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/55 blur-2xl" />
      {children}
    </div>
  );
}

/* ---------- 1. Build your closet ---------- */

export function ClosetIllustration() {
  return (
    <Stage
      surface="cream"
      ariaLabel="Illustration of an open wardrobe with hanging blazer, white tee, and brown coat, plus boots and a tote on the shelf."
    >
      {/* Wardrobe silhouette */}
      <div className="absolute inset-x-0 bottom-0 top-[14%] flex justify-center">
        <svg viewBox="0 0 240 240" className="h-full w-auto" fill="none">
          {/* Cabinet body */}
          <rect
            x="38"
            y="20"
            width="164"
            height="200"
            rx="14"
            fill="#E9DFC7"
            stroke="#262A39"
            strokeWidth="2.5"
          />
          {/* Inner back panel */}
          <rect x="50" y="32" width="140" height="174" rx="10" fill="#F8F2E2" />
          {/* Door split */}
          <line x1="120" y1="32" x2="120" y2="206" stroke="#262A39" strokeWidth="1.5" opacity="0.35" />
          {/* Hanging rod */}
          <line x1="60" y1="68" x2="180" y2="68" stroke="#8B5A2B" strokeWidth="3" strokeLinecap="round" />
          {/* Door handles */}
          <circle cx="110" cy="120" r="2.5" fill="#262A39" />
          <circle cx="130" cy="120" r="2.5" fill="#262A39" />

          {/* Hanger 1: blazer */}
          <g transform="translate(72,68)">
            <path d="M0 0 L0 10" stroke="#262A39" strokeWidth="1.5" />
            <path
              d="M-22 12 L0 8 L22 12 L24 80 Q0 90 -24 80 Z"
              fill="#262A39"
              stroke="#262A39"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>
          {/* Hanger 2: white tee */}
          <g transform="translate(120,68)">
            <path d="M0 0 L0 10" stroke="#262A39" strokeWidth="1.5" />
            <path
              d="M-20 14 L0 10 L20 14 L22 70 Q0 78 -22 70 Z"
              fill="#FFFFFF"
              stroke="#262A39"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>
          {/* Hanger 3: brown coat */}
          <g transform="translate(168,68)">
            <path d="M0 0 L0 10" stroke="#262A39" strokeWidth="1.5" />
            <path
              d="M-22 12 L0 8 L22 12 L24 90 Q0 100 -24 90 Z"
              fill="#B58A60"
              stroke="#262A39"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>

          {/* Shelf */}
          <line x1="50" y1="170" x2="190" y2="170" stroke="#8B5A2B" strokeWidth="2" />
          {/* Boots on shelf */}
          <g transform="translate(78,148)">
            <rect x="0" y="0" width="14" height="22" rx="2" fill="#5B3A22" stroke="#262A39" strokeWidth="1.2" />
            <rect x="-1" y="20" width="20" height="4" rx="1" fill="#262A39" />
          </g>
          <g transform="translate(102,150)">
            <rect x="0" y="0" width="14" height="20" rx="2" fill="#1B1C20" stroke="#262A39" strokeWidth="1.2" />
            <rect x="-1" y="18" width="20" height="4" rx="1" fill="#262A39" />
          </g>
          {/* Tote bag on shelf */}
          <g transform="translate(140,144)">
            <path d="M2 6 C2 0 18 0 18 6" stroke="#262A39" strokeWidth="1.5" fill="none" />
            <rect x="0" y="6" width="22" height="22" rx="2" fill="#1B1C20" stroke="#262A39" strokeWidth="1.2" />
          </g>
        </svg>
      </div>

      {/* Sticker chips floating around */}
      <FloatChip className="left-3 top-6 -rotate-6" tone="primary" label="+ Tops" />
      <FloatChip className="right-3 top-12 rotate-6" tone="ai" label="+ Shoes" />
      <FloatChip className="bottom-8 left-5 rotate-3" tone="neutral" label="+ Bags" />
    </Stage>
  );
}

/* ---------- 2. Plan your week ---------- */

export function PlannerIllustration() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayTemp = Math.round(mockForecastForDate(format(new Date(), 'yyyy-MM-dd')).tempMaxC);
  return (
    <Stage
      surface="mint"
      ariaLabel="Illustration of a 7-day planner card with Wednesday selected, a sun and cloud above, and an outfit pinned for the day."
    >
      {/* Sun glyph upper-left */}
      <div className="absolute left-6 top-6">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" fill="#EFC439" stroke="#262A39" strokeWidth="1.6" />
          <g stroke="#262A39" strokeWidth="1.6" strokeLinecap="round">
            <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" />
          </g>
        </svg>
      </div>

      {/* Cloud glyph upper-right */}
      <div className="absolute right-6 top-10">
        <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
          <path
            d="M14 32a10 10 0 1 1 1.5-19.9A14 14 0 0 1 46 22a8 8 0 0 1 0 16H14z"
            fill="#FFFFFF"
            stroke="#262A39"
            strokeWidth="1.6"
          />
        </svg>
      </div>

      {/* Day strip card centred */}
      <div className="absolute left-1/2 top-[42%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-3xl border-[1.5px] border-ink bg-white p-3 shadow-[3px_4px_0_rgba(38,42,57,0.18)]">
        <p className="text-[9px] font-bold uppercase tracking-widish text-ink-faint">
          This week
        </p>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {days.map((d, i) => (
            <div
              key={i}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl py-1.5',
                i === 2
                  ? 'font-bold text-ink-strong'
                  : i === 1
                  ? 'text-ink-subtle'
                  : 'text-ink-faint',
              )}
            >
              <span className="text-[8px] font-bold uppercase tracking-widish">
                {d}
              </span>
              <span className="text-[11px] font-bold tracking-tightish">
                {12 + i}
              </span>
              {i === 2 && <span className="h-[3px] w-full rounded-full bg-ink-strong" />}
            </div>
          ))}
        </div>
      </div>

      {/* Pinned outfit thumbnail */}
      <div className="absolute bottom-6 left-1/2 flex w-[64%] -translate-x-1/2 items-center gap-2.5 rounded-2xl border-[1.5px] border-ink bg-white p-2 shadow-[3px_4px_0_rgba(38,42,57,0.18)]">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary/20 bg-bg">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF3F6C" strokeWidth="2">
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-[9px] font-bold uppercase tracking-widish text-primary">
            Wednesday
          </p>
          <p className="text-[12px] font-bold tracking-tightish text-ink leading-tight">
            Office linen
          </p>
        </div>
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-bold tracking-tightish text-ink-subtle">
          {todayTemp}°
        </span>
      </div>
    </Stage>
  );
}

/* ---------- 3. Discover & shop ---------- */

export function DiscoverIllustration() {
  return (
    <Stage
      surface="lime"
      ariaLabel="Illustration of a stack of three swipeable outfit cards with a Saved stamp overlay and a forward swipe arrow."
    >
      {/* Card stack — 3 cards staggered */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Back card */}
        <div className="absolute h-[68%] w-[58%] -rotate-[8deg] rounded-4xl border-[1.5px] border-ink bg-accent-paper shadow-[3px_4px_0_rgba(38,42,57,0.18)]" />
        {/* Middle card */}
        <div className="absolute h-[68%] w-[58%] rotate-[5deg] rounded-4xl border-[1.5px] border-ink bg-accent-cream shadow-[3px_4px_0_rgba(38,42,57,0.18)]" />
        {/* Top card */}
        <div className="relative h-[68%] w-[58%] -rotate-[1.5deg] overflow-hidden rounded-4xl border-[1.5px] border-ink bg-white shadow-[5px_6px_0_rgba(38,42,57,0.22)]">
          {/* Sticker badge */}
          <span className="absolute left-2 top-2 inline-flex -rotate-6 items-center gap-1 rounded-full border-[1.5px] border-ink bg-primary px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widish text-white shadow-[1.5px_2px_0_rgba(38,42,57,0.22)]">
            <span className="grid h-2 w-2 place-items-center rounded-full bg-white text-[6px] text-primary">
              ★
            </span>
            Pick
          </span>
          {/* Mini outfit composition */}
          <div className="absolute inset-0">
            <svg viewBox="0 0 100 130" className="h-full w-full">
              {/* Top */}
              <path
                d="M30 28 L42 22 L58 22 L70 28 L66 60 L34 60 Z"
                fill="#1B1C20"
                stroke="#262A39"
                strokeWidth="1"
              />
              {/* Pants */}
              <path
                d="M36 60 L64 60 L62 100 L52 100 L50 70 L48 70 L46 100 L38 100 Z"
                fill="#4A6B8F"
                stroke="#262A39"
                strokeWidth="1"
              />
              {/* Shoes */}
              <path
                d="M28 100 L40 96 L42 102 L28 102 Z"
                fill="#FFFFFF"
                stroke="#262A39"
                strokeWidth="1"
              />
              <path
                d="M58 96 L70 96 L72 102 L60 102 Z"
                fill="#FFFFFF"
                stroke="#262A39"
                strokeWidth="1"
              />
            </svg>
          </div>
          {/* Footer ribbon */}
          <div className="absolute inset-x-0 bottom-0 border-t-[1.5px] border-ink bg-accent-cream px-1.5 py-1">
            <p className="truncate text-[7px] font-black uppercase tracking-widish text-ink">
              Office Linen
            </p>
          </div>
        </div>
      </div>

      {/* Save sticker overlay — Watermelon → Lilac sweep to match Discover */}
      <span
        className="absolute right-7 top-12 inline-block rotate-[12deg] rounded-md border-[2.5px] border-ink bg-discover-gradient px-2.5 py-0.5 text-[14px] font-black uppercase tracking-widish text-white"
        style={{ fontFamily: "Fraunces, Georgia, 'Times New Roman', serif" }}
      >
        Saved
      </span>

      {/* Small hand swipe arrow */}
      <div className="absolute bottom-7 left-7">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="20" fill="#FFFFFF" stroke="#262A39" strokeWidth="1.5" />
          <path
            d="M14 22h16M22 14l8 8-8 8"
            stroke="#262A39"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Stage>
  );
}

/* ---------- shared float chip ---------- */

function FloatChip({
  className,
  label,
  tone,
}: {
  className?: string;
  label: string;
  tone: 'primary' | 'ai' | 'neutral';
}) {
  const palette =
    tone === 'primary'
      ? 'bg-white text-primary ring-1 ring-primary/25'
      : tone === 'ai'
      ? 'bg-white text-accent-ai ring-1 ring-accent-ai/25'
      : 'bg-ink text-white';
  return (
    <span
      className={cn(
        'absolute inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widish shadow-card',
        palette,
        className,
      )}
    >
      {label}
    </span>
  );
}

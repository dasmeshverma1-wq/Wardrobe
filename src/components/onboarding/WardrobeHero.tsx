/**
 * Onboarding welcome illustration.
 * A hanger sitting in a pastel canvas with three floating "category chip" tiles
 * drifting around it — communicates "your wardrobe, organised" in one image.
 *
 * Pure inline SVG + Tailwind animation; no asset dependency.
 */
export function WardrobeHero() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-hero border border-border-subtle bg-bg">
      {/* Soft halo */}
      <span className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-xl" />

      {/* Sparkles */}
      <Sparkle className="absolute left-5 top-7 text-primary" />
      <Sparkle className="absolute right-7 top-12 text-lilac-700" delay={300} />
      <Sparkle className="absolute right-10 bottom-12 text-accent-gold" delay={600} />
      <Sparkle className="absolute left-8 bottom-8 text-accent-mint" delay={900} />

      {/* Floating chips */}
      <FloatingChip className="left-3 top-1/2 -translate-y-8 -rotate-6" label="Tops" tone="primary" />
      <FloatingChip className="right-3 top-1/3 rotate-6" label="Dresses" tone="ai" />
      <FloatingChip className="bottom-7 left-1/2 -translate-x-1/2 rotate-2" label="Shoes" tone="neutral" />

      {/* Hanger glyph, centred */}
      <div className="absolute inset-0 grid place-items-center">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          {/* Garment silhouette behind */}
          <path
            d="M30 70 L60 50 L90 70 L96 102 Q60 112 24 102 Z"
            fill="#ffffff"
            stroke="#262A39"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Neckline */}
          <path
            d="M52 50 Q60 42 68 50"
            fill="none"
            stroke="#262A39"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Hanger hook */}
          <path
            d="M60 50 L60 38 Q60 30 54 30 Q48 30 48 36"
            fill="none"
            stroke="#262A39"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Hanger bar */}
          <line
            x1="38"
            y1="60"
            x2="82"
            y2="60"
            stroke="#262A39"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Accent dot on garment */}
          <circle cx="60" cy="82" r="3" fill="#FF3F6C" />
        </svg>
      </div>
    </div>
  );
}

function Sparkle({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <span className={'block animate-sparkle ' + (className ?? '')} style={{ animationDelay: `${delay}ms` }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 4v3M12 17v3M5 12h3M16 12h3M7 7l2 2M15 15l2 2M7 17l2-2M15 9l2-2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function FloatingChip({
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
      ? 'bg-white text-primary ring-1 ring-primary/20'
      : tone === 'ai'
      ? 'bg-white text-accent-ai ring-1 ring-accent-ai/20'
      : 'bg-ink text-white';
  return (
    <span
      className={
        'absolute inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widish shadow-card ' +
        palette +
        ' ' +
        (className ?? '')
      }
    >
      {label}
    </span>
  );
}

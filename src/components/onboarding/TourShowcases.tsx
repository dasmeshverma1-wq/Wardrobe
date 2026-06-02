/**
 * Onboarding tour showcases — real product photos, soft gradients, and slow
 * decorative motion aligned with the current Fabric / Discover UI.
 */
import { cn } from '@/lib/cn';
import { mockForecastForDate } from '@/lib/weather';
import { format } from 'date-fns';
import { SEED_PHOTOS } from '@/data/seedImages';
import { SURFACE_GRADIENT } from '@/data/creatorOutfits';

type StageProps = {
  surface: keyof typeof SURFACE_GRADIENT | 'welcome';
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
};

const WELCOME_BG =
  'linear-gradient(155deg, #FFF4F7 0%, #F8F0FF 45%, #F0F5FC 100%)';

function ShowcaseStage({ surface, ariaLabel, children, className }: StageProps) {
  const bg = surface === 'welcome' ? WELCOME_BG : SURFACE_GRADIENT[surface];
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        'relative mx-auto aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-frame ring-1 ring-divider shadow-pop',
        className,
      )}
      style={{ backgroundImage: bg }}
    >
      <span className="pointer-events-none absolute left-1/2 top-[42%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-3xl" />
      {children}
    </div>
  );
}

function ProductCutout({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={cn(
        'pointer-events-none select-none object-contain drop-shadow-[0_12px_18px_rgba(38,42,57,0.14)]',
        className,
      )}
      style={style}
    />
  );
}

/* ---------- Welcome hero ---------- */

const WELCOME_PIECES = [
  { src: SEED_PHOTOS.beigeHoodie, alt: 'Hoodie', className: 'absolute left-[8%] top-[18%] h-[34%] w-[38%] animate-tour-drift-a' },
  { src: SEED_PHOTOS.whiteBlouse, alt: 'Blouse', className: 'absolute right-[6%] top-[14%] h-[32%] w-[36%] animate-tour-drift-b' },
  { src: SEED_PHOTOS.blackJeans, alt: 'Jeans', className: 'absolute bottom-[22%] left-[10%] h-[36%] w-[34%] animate-tour-drift-c' },
  { src: SEED_PHOTOS.strawHat, alt: 'Straw hat', className: 'absolute right-[12%] bottom-[28%] h-[22%] w-[28%] animate-tour-drift-d' },
  { src: SEED_PHOTOS.elegantTop, alt: 'Wrap top', className: 'absolute left-1/2 top-[38%] h-[42%] w-[40%] -translate-x-1/2 animate-tour-drift-center' },
];

export function WelcomeHeroShowcase() {
  return (
    <ShowcaseStage
      surface="welcome"
      ariaLabel="A collage of real wardrobe pieces — hoodie, blouse, jeans, hat, and dress — gently floating."
    >
      {WELCOME_PIECES.map((p) => (
        <ProductCutout key={p.alt} src={p.src} alt={p.alt} className={p.className} />
      ))}
      <span className="absolute left-3 top-3 rounded-full bg-bg/90 px-2.5 py-1 text-[10px] font-semibold text-ink shadow-sm ring-1 ring-divider backdrop-blur-sm">
        Your closet
      </span>
      <span className="absolute bottom-3 right-3 rounded-full bg-accent-aiSoft px-2.5 py-1 text-[10px] font-semibold text-accent-ai shadow-sm ring-1 ring-accent-ai/15">
        Auto-tagged
      </span>
    </ShowcaseStage>
  );
}

/* ---------- Closet grid ---------- */

const CLOSET_GRID = [
  { src: SEED_PHOTOS.blackTee, alt: 'Black tee' },
  { src: SEED_PHOTOS.khakiChinos, alt: 'Khaki chinos' },
  { src: SEED_PHOTOS.greenDenimJacket, alt: 'Denim jacket' },
  { src: SEED_PHOTOS.hawaiianShirt, alt: 'Hawaiian shirt' },
  { src: SEED_PHOTOS.blueJeans, alt: 'Blue jeans' },
  { src: SEED_PHOTOS.elegantTop, alt: 'Wrap top' },
];

export function ClosetShowcase() {
  return (
    <ShowcaseStage
      surface="sand"
      ariaLabel="A grid of real clothing photos organised by category with add chips."
    >
      <div className="absolute inset-x-4 top-4 grid grid-cols-3 gap-2">
        {CLOSET_GRID.map((item, i) => (
          <div
            key={item.alt}
            className="relative aspect-square overflow-hidden rounded-2xl bg-bg/80 ring-1 ring-divider"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <ProductCutout
              src={item.src}
              alt={item.alt}
              className="absolute inset-1 h-[calc(100%-8px)] w-[calc(100%-8px)]"
            />
          </div>
        ))}
      </div>
      <span className="absolute left-4 top-[72%] inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
        + Snap
      </span>
      <span className="absolute right-4 top-[76%] inline-flex items-center gap-1 rounded-full bg-bg/90 px-2.5 py-1 text-[10px] font-semibold text-ink shadow-sm ring-1 ring-divider">
        + Import
      </span>
      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-accent-aiSoft px-3 py-1 text-[10px] font-semibold text-accent-ai">
        Background removed
      </span>
    </ShowcaseStage>
  );
}

/* ---------- Mix & Match canvas spread ---------- */

const MIX_PIECES = [
  { src: SEED_PHOTOS.brownFeltHat, alt: 'Hat', anim: 'animate-onboarding-spread-hat' },
  { src: SEED_PHOTOS.sunglassesBlackRim, alt: 'Sunglasses', anim: 'animate-onboarding-spread-glasses' },
  { src: SEED_PHOTOS.blackTee, alt: 'Top', anim: 'animate-onboarding-spread-top' },
  { src: SEED_PHOTOS.blackJeans, alt: 'Bottom', anim: 'animate-onboarding-spread-bottom' },
];

export function MixMatchShowcase() {
  return (
    <ShowcaseStage
      surface="blush"
      ariaLabel="Four wardrobe pieces starting stacked at the centre and slowly spreading into a flat-lay outfit on a canvas."
    >
      <div className="absolute inset-0">
        {MIX_PIECES.map((p) => (
          <ProductCutout
            key={p.alt}
            src={p.src}
            alt={p.alt}
            className={cn('absolute h-[26%] w-[34%]', p.anim)}
          />
        ))}
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-bg/90 px-2.5 py-1 text-[10px] font-semibold text-ink shadow-sm ring-1 ring-divider backdrop-blur-sm">
        Mix & Match
      </span>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn('h-1.5 rounded-full transition-all', i === 1 ? 'w-4 bg-primary' : 'w-1.5 bg-line')}
          />
        ))}
      </div>
    </ShowcaseStage>
  );
}

/* ---------- Planner — matches DayStrip UI ---------- */

export function PlannerShowcase() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayTemp = Math.round(mockForecastForDate(format(new Date(), 'yyyy-MM-dd')).tempMaxC);
  return (
    <ShowcaseStage
      surface="mint"
      ariaLabel="A week planner with Wednesday selected, weather chip, and a pinned outfit using real product photos."
    >
      <div className="absolute inset-x-4 top-4 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-ink-faint">This week</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-bg/90 px-2 py-1 text-[10px] font-semibold text-ink ring-1 ring-divider">
          <span className="text-accent-gold">☀</span> {todayTemp}°
        </span>
      </div>

      <div className="absolute inset-x-4 top-[14%] grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div
            key={i}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-2xl py-1.5',
              i === 2
                ? 'font-bold text-ink-strong'
                : i === 1
                ? 'text-ink-subtle'
                : 'text-ink-faint',
            )}
          >
            <span className="text-[8px] font-semibold uppercase tracking-widish">{d}</span>
            <span className="text-[12px] font-bold">{12 + i}</span>
            {i === 2 && <span className="h-[3px] w-full rounded-full bg-ink-strong" />}
          </div>
        ))}
      </div>

      <div className="absolute inset-x-4 bottom-[14%] rounded-2xl border border-border-subtle bg-bg p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widish text-primary">Wednesday</p>
        <p className="mt-0.5 text-[13px] font-bold text-ink">Office linen</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-bg">
            <ProductCutout src={SEED_PHOTOS.dressShirt} alt="Shirt" className="absolute inset-0.5 h-[calc(100%-4px)] w-[calc(100%-4px)]" />
          </div>
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-bg">
            <ProductCutout src={SEED_PHOTOS.khakiChinos} alt="Chinos" className="absolute inset-0.5 h-[calc(100%-4px)] w-[calc(100%-4px)]" />
          </div>
          <span className="ml-auto text-[11px] font-semibold tabular-nums text-ink-subtle">Pinned</span>
        </div>
      </div>
    </ShowcaseStage>
  );
}

/* ---------- Discover swipe ---------- */

const DISCOVER_LOOK = [
  { src: SEED_PHOTOS.redCap, alt: 'Cap', className: 'left-1/2 top-[10%] h-[18%] w-[28%] -translate-x-1/2' },
  { src: SEED_PHOTOS.colorfulSunglasses, alt: 'Sunglasses', className: 'left-1/2 top-[20%] h-[14%] w-[26%] -translate-x-1/2' },
  { src: SEED_PHOTOS.beigeHoodie, alt: 'Hoodie', className: 'left-1/2 top-[38%] h-[32%] w-[48%] -translate-x-1/2' },
  { src: SEED_PHOTOS.greyJoggers, alt: 'Joggers', className: 'left-1/2 top-[62%] h-[28%] w-[44%] -translate-x-1/2' },
];

export function DiscoverShowcase() {
  return (
    <ShowcaseStage
      surface="sky"
      ariaLabel="A stack of outfit cards with the top card swiping right to save, showing real product photos."
      className="max-w-[300px]"
    >
      {/* Back cards */}
      <div className="absolute left-1/2 top-[12%] h-[72%] w-[78%] -translate-x-1/2 rotate-[6deg] rounded-4xl border border-border-subtle bg-bg" />
      <div className="absolute left-1/2 top-[10%] h-[72%] w-[78%] -translate-x-1/2 -rotate-[4deg] rounded-4xl border border-primary/20 bg-bg" />

      {/* Swipeable top card */}
      <div className="absolute left-1/2 top-[8%] h-[74%] w-[80%] animate-tour-swipe-card">
        <div className="relative h-full overflow-hidden rounded-4xl bg-bg shadow-pop ring-1 ring-divider">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: SURFACE_GRADIENT.sky }}
          >
            {DISCOVER_LOOK.map((p) => (
              <ProductCutout
                key={p.alt}
                src={p.src}
                alt={p.alt}
                className={cn('absolute', p.className)}
              />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 border-t border-divider bg-bg px-3 py-2">
            <p className="text-[12px] font-bold text-ink">Off-Duty</p>
            <p className="text-[10px] text-ink-faint">Casual · Weekend</p>
          </div>
          <span className="absolute left-2.5 top-2.5 rounded-full bg-bg/90 px-2 py-0.5 text-[9px] font-semibold text-ink ring-1 ring-divider backdrop-blur-sm">
            @dev.styles
          </span>
        </div>
      </div>

      {/* Save stamp — fades in with swipe */}
      <span className="pointer-events-none absolute right-6 top-[22%] z-10 rotate-[12deg] rounded-xl bg-primary px-3 py-1.5 text-[13px] font-bold text-white shadow-pop animate-tour-save-stamp">
        Save
      </span>

      {/* Swipe hint */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-bg/90 px-3 py-1.5 shadow-sm ring-1 ring-divider backdrop-blur-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="animate-tour-swipe-finger text-ink">
          <path
            d="M8 12h8M14 8l4 4-4 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[10px] font-semibold text-ink-subtle">Swipe for more looks</span>
      </div>
    </ShowcaseStage>
  );
}

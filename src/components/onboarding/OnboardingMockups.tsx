/**
 * Mini in-phone UI previews for Estyl-style onboarding slides.
 */
import { cn } from '@/lib/cn';
import { SEED_PHOTOS } from '@/data/seedImages';
import { PhoneMockup } from './OnboardingSlide';

const MINI_OUTFITS = [
  { top: SEED_PHOTOS.blackTee, bottom: SEED_PHOTOS.blackJeans },
  { top: SEED_PHOTOS.whiteBlouse, bottom: SEED_PHOTOS.khakiChinos },
  { top: SEED_PHOTOS.beigeHoodie, bottom: SEED_PHOTOS.greyJoggers },
  { top: SEED_PHOTOS.hawaiianShirt, bottom: SEED_PHOTOS.blueJeans },
];

function MiniImg({ src, className }: { src: string; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className={cn('object-contain', className)}
    />
  );
}

export function HomePhoneMockup() {
  const rails = [
    { line1: 'Bag picks', icon: 'bag' },
    { line1: 'Saved looks', icon: 'heart' },
    { line1: 'Holi', icon: 'spark' },
  ];

  return (
    <PhoneMockup size="large">
      <div className="flex h-full flex-col bg-bg px-2.5 pt-2">
        <p className="text-[7px] font-bold uppercase tracking-widish text-ink-faint">Friday, 29 May</p>
        <p className="text-[13px] font-black leading-tight text-ink-strong">What should you wear?</p>

        <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[7px] font-semibold text-ink-strong">
          ☁ 32°
        </span>

        <div className="mt-2 flex gap-1 overflow-hidden">
          {['Mix & Match', 'Collage', 'Try on'].map((l) => (
            <span
              key={l}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line px-2 py-1 text-[6px] font-semibold text-ink-strong"
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', l === 'Try on' ? 'bg-accent-ai' : 'bg-primary')} />
              {l}
            </span>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-1.5 rounded-2xl border border-line bg-accent-aiSoft/30 px-2 py-1.5">
          <span className="text-[7px] font-bold text-accent-ai">✦</span>
          <p className="text-[6px] font-semibold text-ink-strong">AI Try-On · See it on you</p>
        </div>

        <p className="mt-3 text-[7px] font-bold uppercase tracking-widish text-ink-faint">Suggested</p>
        <div className="mt-1.5 flex gap-1.5 overflow-hidden">
          {rails.map((r) => (
            <div
              key={r.line1}
              className="flex h-[4.5rem] w-[3.6rem] shrink-0 flex-col items-center justify-center rounded-2xl bg-bg shadow-[0_2px_8px_rgba(38,42,57,0.08)]"
            >
              <span className="mb-1 text-[8px] text-ink-strong">
                {r.icon === 'bag' ? '👜' : r.icon === 'heart' ? '♥' : '✦'}
              </span>
              <p className="text-center text-[6px] font-semibold leading-tight text-ink-strong">
                {r.line1}
                <br />
                for you
              </p>
            </div>
          ))}
        </div>

        <div className="mt-auto flex justify-around border-t border-divider pt-1.5">
          {['Home', 'Closet', '+', 'Plan', 'Discover'].map((t) => (
            <span
              key={t}
              className={cn(
                'text-[6px] font-bold',
                t === 'Home' ? 'text-ink-strong' : 'text-ink-faint',
              )}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </PhoneMockup>
  );
}

export function OutfitsPhoneMockup() {
  return (
    <PhoneMockup size="large">
      <div className="flex h-full flex-col bg-bg">
        <div className="flex border-b border-divider px-2 pt-1">
          {['Closet', 'Outfits', 'Sets'].map((t) => (
            <span
              key={t}
              className={cn(
                'flex-1 pb-1.5 text-center text-[8px] font-bold',
                t === 'Outfits' ? 'border-b-2 border-ink-strong text-ink-strong' : 'text-ink-faint',
              )}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-2 gap-1.5 p-2">
          {MINI_OUTFITS.map((o, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border-subtle bg-bg-soft"
            >
              <div className="relative aspect-[4/5] bg-bg">
                <MiniImg src={o.top} className="absolute left-1/2 top-[18%] h-[38%] w-[70%] -translate-x-1/2" />
                <MiniImg src={o.bottom} className="absolute bottom-[8%] left-1/2 h-[34%] w-[65%] -translate-x-1/2" />
              </div>
              <p className="truncate px-1 py-1 text-[7px] font-bold text-ink">Look {i + 1}</p>
            </div>
          ))}
        </div>
      </div>
    </PhoneMockup>
  );
}

export function DiscoverPhoneMockup() {
  return (
    <PhoneMockup size="large">
      <div className="relative h-full bg-gradient-to-b from-[#FFF4F7] to-bg">
        <div className="px-2.5 pt-2">
          <p className="text-[7px] font-bold uppercase text-ink-faint">Editor&apos;s picks</p>
          <p className="text-[12px] font-black text-ink-strong">Today&apos;s Edit</p>
        </div>
        <div className="absolute left-1/2 top-[18%] h-[62%] w-[78%] -translate-x-1/2 rotate-[3deg] rounded-2xl border border-border-subtle bg-bg shadow-sm" />
        <div className="absolute left-1/2 top-[15%] h-[65%] w-[82%] -translate-x-1/2 overflow-hidden rounded-2xl border border-border-subtle bg-bg shadow-md">
          <div className="relative h-[72%] bg-gradient-to-b from-[#F0F5FC] to-bg">
            <MiniImg src={SEED_PHOTOS.beigeHoodie} className="absolute left-1/2 top-[28%] h-[38%] w-[55%] -translate-x-1/2" />
            <MiniImg src={SEED_PHOTOS.greyJoggers} className="absolute bottom-[5%] left-1/2 h-[32%] w-[50%] -translate-x-1/2" />
            <span className="absolute right-2 top-2 rounded-full bg-primary px-1.5 py-0.5 text-[6px] font-bold text-white">
              Save
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-strong/80 to-transparent px-2 pb-2 pt-8">
            <p className="text-[9px] font-bold text-white">Off-Duty</p>
            <div className="mt-2 flex justify-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-bg text-[10px]">✕</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white">♥</span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-bg text-[10px]">↺</span>
            </div>
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
}

export function PlannerPhoneMockup() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <PhoneMockup size="large">
      <div className="flex h-full flex-col bg-bg px-2 pt-2">
        <p className="text-[11px] font-black text-ink-strong">This week</p>
        <div className="mt-2 grid grid-cols-7 gap-0.5">
          {days.map((d, i) => (
            <div
              key={i}
              className={cn(
                'flex flex-col items-center rounded-lg py-1',
                i === 2 ? 'bg-primary-soft' : '',
              )}
            >
              <span className="text-[6px] font-semibold text-ink-faint">{d}</span>
              <span className="text-[9px] font-bold text-ink">{12 + i}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex-1 rounded-2xl border border-border-subtle bg-bg-soft p-2">
          <p className="text-[7px] font-bold uppercase text-primary">Wednesday</p>
          <p className="text-[10px] font-bold text-ink-strong">Office linen</p>
          <div className="mt-2 flex gap-1">
            {[SEED_PHOTOS.dressShirt, SEED_PHOTOS.khakiChinos].map((src) => (
              <div key={src} className="h-10 w-10 rounded-lg border border-border-subtle bg-bg p-0.5">
                <MiniImg src={src} className="h-full w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
}

export function ClosetPhoneMockup() {
  const items = [
    SEED_PHOTOS.blackTee,
    SEED_PHOTOS.elegantTop,
    SEED_PHOTOS.greenDenimJacket,
    SEED_PHOTOS.blueJeans,
    SEED_PHOTOS.strawHat,
    SEED_PHOTOS.whiteBlouse,
  ];
  return (
    <PhoneMockup size="large">
      <div className="flex h-full flex-col bg-bg p-2">
        <p className="text-[10px] font-black text-ink-strong">Closet</p>
        <div className="mt-2 grid flex-1 grid-cols-3 gap-1">
          {items.map((src) => (
            <div key={src} className="aspect-square rounded-lg border border-border-subtle bg-bg p-0.5">
              <MiniImg src={src} className="h-full w-full" />
            </div>
          ))}
        </div>
      </div>
    </PhoneMockup>
  );
}

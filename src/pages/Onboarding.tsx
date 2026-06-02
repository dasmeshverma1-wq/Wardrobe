import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Chip } from '@/components/ui/Chip';
import { CheckIcon, BagIcon, HeartIcon, ChevronRightIcon } from '@/components/ui/Icon';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { importAllFromCartAndWishlist, importFromCart, importFromWishlist } from '@/lib/myntraImport';
import { useProfileStore } from '@/store/profileStore';
import type { StyleProfile } from '@/types';
import { toast } from '@/components/ui/Toast';
import { track } from '@/lib/telemetry';
import { cn } from '@/lib/cn';
import { OnboardingSlide } from '@/components/onboarding/OnboardingSlide';
import {
  HomePhoneMockup,
  OutfitsPhoneMockup,
  DiscoverPhoneMockup,
  PlannerPhoneMockup,
  ClosetPhoneMockup,
} from '@/components/onboarding/OnboardingMockups';

const VIBES = ['Minimal', 'Street', 'Classic', 'Boho', 'Sporty', 'Romantic', 'Edgy'];
const OCCASIONS = ['Office', 'Casual', 'Evening', 'Workout', 'Travel'];

const PALETTES: { id: StyleProfile['palette']; label: string; sub: string; swatches: string[] }[] = [
  { id: 'neutral', label: 'Neutral', sub: 'Whites, greys, beiges', swatches: ['#F4F4F6', '#D8D4CC', '#8A8275'] },
  { id: 'warm', label: 'Warm', sub: 'Reds, terracottas, golds', swatches: ['#D9603B', '#C77A1A', '#8C5A36'] },
  { id: 'cool', label: 'Cool', sub: 'Blues, greens, silvers', swatches: ['#3A78D1', '#3CA67E', '#A7B7C2'] },
  { id: 'bold', label: 'Bold', sub: 'High-saturation colour', swatches: ['#FF3F6C', '#3CA67E', '#EFC439'] },
  { id: 'monochrome', label: 'Mono', sub: 'Black & white', swatches: ['#0F1115', '#FFFFFF', '#8A8B91'] },
];

const TOUR_SLIDES = [
  {
    background: 'linear-gradient(165deg, #F3E8FF 0%, #E8D4FF 100%)',
    headline: ['Your wardrobe', 'smarter'],
    body: 'Real pieces, real outfits — recommendations first, then mix, plan, and discover looks tailored to you.',
    ctaLabel: 'Next',
    mockup: <HomePhoneMockup />,
  },
  {
    background: '#B8E4FF',
    headline: ['Picked for', 'you'],
    body: 'Home surfaces outfit ideas from your closet, cart, and wishlist — so you always know what to wear.',
    ctaLabel: 'Next',
    mockup: <HomePhoneMockup />,
  },
  {
    background: '#9ED4FF',
    headline: ['Curate your', 'looks'],
    body: 'Mix and match your favourite garments to create or edit outfits in your closet.',
    ctaLabel: 'Next',
    mockup: <OutfitsPhoneMockup />,
  },
  {
    background: '#FFE566',
    headline: ['Instant outfit', 'magic'],
    body: 'Swipe left to pass, right to save. The more you swipe, the smarter your recommendations get.',
    ctaLabel: 'Next',
    mockup: <DiscoverPhoneMockup />,
  },
  {
    background: '#C8F0D8',
    headline: ['Plan your', 'week'],
    body: 'Pin outfits to days and we align them with the live weather — no more last-minute scrambles.',
    ctaLabel: 'Next',
    mockup: <PlannerPhoneMockup />,
  },
] as const;

/** Steps: 0–4 tour, 5 import, 6 profile */
const TOTAL_STEPS = 7;

export function Onboarding() {
  const navigate = useNavigate();
  const save = useProfileStore((s) => s.save);
  const reset = useProfileStore((s) => s.reset);
  const existing = useProfileStore((s) => s.profile);
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    if (params.get('reset') === '1') {
      reset();
      const next = new URLSearchParams(params);
      next.delete('reset');
      setParams(next, { replace: true });
    }
  }, [params, reset, setParams]);

  const [step, setStep] = useState(0);
  const [vibes, setVibes] = useState<string[]>(existing?.vibes ?? []);
  const [occasions, setOccasions] = useState<string[]>(existing?.occasions ?? []);
  const [palette, setPalette] = useState<StyleProfile['palette']>(existing?.palette ?? 'neutral');

  const next = () => setStep((s) => s + 1);

  const finish = () => {
    save({ vibes, occasions, palette, completedAt: Date.now() });
    track('onboarding_completed', { vibes: vibes.length, occasions: occasions.length, palette });
    toast('Welcome to your wardrobe', 'success');
    navigate('/home', { replace: true });
  };

  const skip = () => {
    save({ vibes: [], occasions: [], palette: 'neutral', completedAt: Date.now() });
    navigate('/home', { replace: true });
  };

  const toggle = (arr: string[], v: string, setter: (a: string[]) => void) => {
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const tourSlide = step < TOUR_SLIDES.length ? TOUR_SLIDES[step] : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {tourSlide && (
        <OnboardingSlide
          background={tourSlide.background}
          headline={[...tourSlide.headline]}
          stepIndex={step}
          stepCount={TOTAL_STEPS}
          body={tourSlide.body}
          ctaLabel={tourSlide.ctaLabel}
          onNext={next}
          onSkip={skip}
          mockup={tourSlide.mockup}
        />
      )}

      {step === 5 && (
        <OnboardingSlide
          background="#FFD6E8"
          headline={['Start with', 'Myntra']}
          stepIndex={step}
          stepCount={TOTAL_STEPS}
          onNext={next}
          onSkip={skip}
          mockup={<ClosetPhoneMockup />}
          tallCard
          ctaLabel="Skip for now"
          cardChildren={
            <ImportCardContent onDone={next} onSkip={next} />
          }
        />
      )}

      {step === 6 && (
        <OnboardingSlide
          background="linear-gradient(180deg, #EDE9FE 0%, #F8F6FA 40%)"
          headline={['Tell us', 'about you']}
          stepIndex={step}
          stepCount={TOTAL_STEPS}
          onNext={finish}
          onSkip={skip}
          hideMockup
          compactCard
          ctaLabel="Let's go!"
          cardChildren={
            <ProfileStep
              vibes={vibes}
              occasions={occasions}
              palette={palette}
              onToggleVibe={(v) => toggle(vibes, v, setVibes)}
              onToggleOccasion={(v) => toggle(occasions, v, setOccasions)}
              onSelectPalette={setPalette}
              onFinish={finish}
            />
          }
        />
      )}
    </div>
  );
}

function SlideCta({
  label,
  onClick,
  icon = 'arrow',
  disabled,
  className,
}: {
  label: string;
  onClick: () => void;
  icon?: 'arrow' | 'check';
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'mx-auto flex h-12 w-full max-w-[240px] shrink-0 items-center justify-center gap-2.5 rounded-full bg-ink-strong',
        'text-[15px] font-bold text-white transition-transform active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
        'disabled:opacity-40 disabled:active:scale-100',
        className,
      )}
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15">
        {icon === 'check' ? (
          <CheckIcon size={18} className="text-white" strokeWidth={2.5} />
        ) : (
          <ChevronRightIcon size={18} className="text-white" strokeWidth={2.5} />
        )}
      </span>
      {label}
    </button>
  );
}

function ImportCardContent({ onDone, onSkip }: { onDone: () => void; onSkip: () => void }) {
  const hydrateCart = useCartStore((s) => s.hydrate);
  const hydrateWishlist = useWishlistStore((s) => s.hydrate);
  const cart = useCartStore((s) => s.lines);
  const wishlist = useWishlistStore((s) => s.lines);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    hydrateCart();
    hydrateWishlist();
  }, [hydrateCart, hydrateWishlist]);

  async function runImport(kind: 'all' | 'cart' | 'wishlist') {
    setBusy(true);
    try {
      const n =
        kind === 'all'
          ? await importAllFromCartAndWishlist(cart, wishlist)
          : kind === 'cart'
          ? await importFromCart(cart)
          : await importFromWishlist(wishlist);
      toast(
        n > 0 ? `Added ${n} item${n === 1 ? '' : 's'} to your closet` : 'Already in your closet',
        n > 0 ? 'success' : 'default',
      );
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <p className="text-center text-[14px] font-medium leading-[1.45] text-ink-strong">
        Import pieces from your bag or wishlist — we&apos;ll suggest outfits right away.
      </p>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          disabled={busy || cart.length === 0}
          onClick={() => void runImport('cart')}
          className="flex w-full items-center gap-3 rounded-2xl border border-border-subtle bg-bg-soft p-3 text-left disabled:opacity-50"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
            <BagIcon size={18} />
          </span>
          <span className="flex-1">
            <span className="block text-[14px] font-bold text-ink-strong">Import from cart</span>
            <span className="block text-[11px] text-ink-subtle">
              {cart.length} item{cart.length === 1 ? '' : 's'} ready
            </span>
          </span>
        </button>

        <button
          type="button"
          disabled={busy || wishlist.length === 0}
          onClick={() => void runImport('wishlist')}
          className="flex w-full items-center gap-3 rounded-2xl border border-border-subtle bg-bg-soft p-3 text-left disabled:opacity-50"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-aiSoft text-accent-ai">
            <HeartIcon size={18} />
          </span>
          <span className="flex-1">
            <span className="block text-[14px] font-bold text-ink-strong">Import from wishlist</span>
            <span className="block text-[11px] text-ink-subtle">
              {wishlist.length} saved piece{wishlist.length === 1 ? '' : 's'}
            </span>
          </span>
        </button>

        <button
          type="button"
          disabled={busy || (cart.length === 0 && wishlist.length === 0)}
          onClick={() => void runImport('all')}
          className="w-full rounded-2xl border border-ink-strong/15 py-2.5 text-[13px] font-bold text-ink-strong disabled:opacity-50"
        >
          Import everything
        </button>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="mx-auto mt-4 block text-[13px] font-semibold text-ink-faint"
      >
        Skip for now
      </button>
    </>
  );
}

function ProfileStep({
  vibes,
  occasions,
  palette,
  onToggleVibe,
  onToggleOccasion,
  onSelectPalette,
  onFinish,
}: {
  vibes: string[];
  occasions: string[];
  palette: StyleProfile['palette'];
  onToggleVibe: (v: string) => void;
  onToggleOccasion: (v: string) => void;
  onSelectPalette: (p: StyleProfile['palette']) => void;
  onFinish: () => void;
}) {
  return (
    <>
      <ProfileForm
        vibes={vibes}
        occasions={occasions}
        palette={palette}
        onToggleVibe={onToggleVibe}
        onToggleOccasion={onToggleOccasion}
        onSelectPalette={onSelectPalette}
      />
      <SlideCta label="Let's go!" onClick={onFinish} icon="check" className="mt-5" />
    </>
  );
}

function ProfileForm({
  vibes,
  occasions,
  palette,
  onToggleVibe,
  onToggleOccasion,
  onSelectPalette,
}: {
  vibes: string[];
  occasions: string[];
  palette: StyleProfile['palette'];
  onToggleVibe: (v: string) => void;
  onToggleOccasion: (v: string) => void;
  onSelectPalette: (p: StyleProfile['palette']) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-center text-[15px] font-medium leading-[1.45] text-ink-subtle">
        Quick picks help tune recommendations. All optional — change anytime in Settings.
      </p>

      <ProfileBlock title="What vibes feel like you?" hint="Pick a few that fit.">
        <div className="flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <Chip key={v} active={vibes.includes(v)} onClick={() => onToggleVibe(v)}>
              {v}
            </Chip>
          ))}
        </div>
      </ProfileBlock>

      <ProfileBlock title="Where do you dress for?" hint="We'll surface looks for these moments.">
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((v) => (
            <Chip key={v} active={occasions.includes(v)} onClick={() => onToggleOccasion(v)}>
              {v}
            </Chip>
          ))}
        </div>
      </ProfileBlock>

      <ProfileBlock title="Pick a colour mood" hint="We'll bias recommendations toward this palette.">
        <div className="grid grid-cols-2 gap-2">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPalette(p.id)}
              className={cn(
                'flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-colors',
                palette === p.id
                  ? 'border-2 border-ink-strong bg-bg'
                  : 'border border-border-subtle bg-bg-soft',
                p.id === 'monochrome' && 'col-span-2',
              )}
            >
              <span className="flex shrink-0">
                {p.swatches.map((s, i) => (
                  <span
                    key={i}
                    className="-ml-2 first:ml-0 inline-block h-6 w-6 rounded-full ring-1 ring-divider"
                    style={{ background: s }}
                  />
                ))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold tracking-tightish text-ink">
                  {p.label}
                </span>
              </span>
              {palette === p.id && (
                <CheckIcon size={14} className="shrink-0 text-primary" strokeWidth={2.5} />
              )}
            </button>
          ))}
        </div>
      </ProfileBlock>
    </div>
  );
}

function ProfileBlock({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-soft p-3.5">
      <h2 className="text-[15px] font-bold tracking-tightish text-ink-strong">{title}</h2>
      <p className="mt-0.5 text-[12px] leading-snug text-ink-faint">{hint}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

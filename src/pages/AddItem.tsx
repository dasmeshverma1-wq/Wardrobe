import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TopNav } from '@/components/ui/TopNav';
import { Button, AccentButton } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import {
  CameraIcon,
  ImageIcon,
  BagIcon,
  HeartIcon,
  CheckIcon,
  RotateIcon,
  StraightArrowLeftIcon,
} from '@/components/ui/Icon';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { importFromCart, importFromWishlist } from '@/lib/myntraImport';
import { cn } from '@/lib/cn';
import { BgRemovalProgress } from '@/components/wardrobe/BgRemovalProgress';
import { fileToDataUrl, downscale, makeThumbnail, dominantColor, loadImage } from '@/lib/image';
import { removeBackground, type BgProgress } from '@/lib/bgRemoval';
import { guessCategory, guessMaterial } from '@/lib/categorize';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { CATEGORY_LABELS, CATEGORY_ORDER, type Category, type ItemSource } from '@/types';
import { MYNTRA_SAMPLES, formatRupees } from '@/data/myntraSamples';
import { toast } from '@/components/ui/Toast';
import { track } from '@/lib/telemetry';

type SourceId = 'past' | 'cart' | 'wishlist';

type SourceTile = {
  id: SourceId;
  title: string;
  subtitle: string;
  icon: typeof BagIcon;
  tone: 'primary' | 'ai' | 'neutral' | 'gold';
};

const SOURCE_TILES: SourceTile[] = [
  {
    id: 'past',
    title: 'Past orders',
    subtitle: 'Pull from Myntra history',
    icon: BagIcon,
    tone: 'gold',
  },
  {
    id: 'cart',
    title: 'Cart',
    subtitle: 'Import what\'s in your bag',
    icon: BagIcon,
    tone: 'primary',
  },
  {
    id: 'wishlist',
    title: 'Wishlist',
    subtitle: 'Import saved items',
    icon: HeartIcon,
    tone: 'ai',
  },
];

type Draft = {
  originalSrc: string;
  cutoutSrc: string;
  thumbnail: string;
  category: Category;
  name?: string;
  brand?: string;
  dominantColor?: string;
  source: ItemSource;
  myntraProductId?: string;
  material?: ReturnType<typeof guessMaterial>;
};

export function AddItem() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // `?tab=` deep links straight into a source; default `null` shows the
  // 2x2 picker so first-run users see all four options at once.
  const initialSource = (params.get('tab') as SourceId | null) ?? null;
  const [source, setSource] = useState<SourceId | null>(initialSource);
  const [progress, setProgress] = useState<BgProgress | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const addItem = useWardrobeStore((s) => s.addItem);

  const activeTile = source ? SOURCE_TILES.find((t) => t.id === source) : null;

  const startFromImage = async (
    src: string,
    source: Draft['source'],
    hint: { name?: string; url?: string; myntraProductId?: string },
  ) => {
    setProgress({ stage: 'downloading-model', pct: 0 });
    try {
      const downscaled = await downscale(src, 1024);
      const cutout = await removeBackground(downscaled, setProgress);
      const thumb = await makeThumbnail(cutout, 256);
      const img = await loadImage(cutout);
      const ar = img.height === 0 ? 1 : img.width / img.height;
      const category = guessCategory({ ...hint, aspectRatio: ar });
      const material = guessMaterial(hint);
      const colour = await dominantColor(cutout);
      setDraft({
        originalSrc: src,
        cutoutSrc: cutout,
        thumbnail: thumb,
        category,
        name: hint.name,
        brand: undefined,
        dominantColor: colour,
        source,
        myntraProductId: hint.myntraProductId,
        material,
      });
      setProgress(null);
    } catch (err) {
      console.error(err);
      toast('Could not process this image. Try another.', 'warning');
      setProgress(null);
    }
  };

  const handleSave = async (andAnother: boolean) => {
    if (!draft) return;
    await addItem({
      category: draft.category,
      source: draft.source,
      dataUrl: draft.cutoutSrc,
      thumbnailDataUrl: draft.thumbnail,
      name: draft.name,
      brand: draft.brand,
      dominantColor: draft.dominantColor,
      myntraProductId: draft.myntraProductId,
      material: draft.material,
    });
    track('item_added', { source: draft.source, category: draft.category });
    toast('Added to wardrobe', 'success');
    if (andAnother) {
      setDraft(null);
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-bg">
      <TopNav
        title={activeTile ? activeTile.title : 'Add to wardrobe'}
        showBack={!activeTile}
        onBack={() => navigate(-1)}
        leading={
          activeTile ? (
            <button
              onClick={() => setSource(null)}
              aria-label="Choose a different source"
              className="-ml-1 inline-flex h-10 items-center gap-1 rounded-full px-2 text-[12px] font-semibold tracking-tightish text-ink-subtle transition-colors hover:bg-neutral-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <StraightArrowLeftIcon size={16} />
              Sources
            </button>
          ) : undefined
        }
        borderless
      />

      {!activeTile ? (
        <SourcePicker onPick={(id) => setSource(id)} />
      ) : (
        <div className="scroll-area">
          {source === 'past' && (
            <PastPurchasesTab
              onPicked={(s) =>
                startFromImage(s.image, 'myntra-past', {
                  name: s.name,
                  myntraProductId: s.productId,
                })
              }
            />
          )}
          {source === 'cart' && <CartImportTab onDone={() => navigate('/home')} />}
          {source === 'wishlist' && <WishlistImportTab onDone={() => navigate('/home')} />}
        </div>
      )}

      <Sheet open={!!progress} onClose={() => {}} title="Processing">
        <BgRemovalProgress progress={progress} />
      </Sheet>

      <Sheet open={!!draft && !progress} onClose={() => setDraft(null)} title="Review & save" maxHeight="92vh">
        {draft && (
          <ReviewForm
            draft={draft}
            onChange={(patch) => setDraft({ ...draft, ...patch })}
            onSave={() => handleSave(false)}
            onSaveAndAnother={() => handleSave(true)}
            onDiscard={() => setDraft(null)}
          />
        )}
      </Sheet>
    </div>
  );
}

// ---------------- Source picker (4-tile entry) ----------------

function SourcePicker({ onPick }: { onPick: (id: SourceId) => void }) {
  return (
    <div className="flex flex-1 flex-col px-5 pt-2">
      <p className="text-[13px] leading-[1.5] text-ink-subtle">
        Pick how you'd like to add an item to your closet.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SOURCE_TILES.map((tile) => (
          <SourceTileButton key={tile.id} tile={tile} onClick={() => onPick(tile.id)} />
        ))}
      </div>
      <p className="mt-6 text-[11px] leading-[1.5] text-ink-faint">
        We'll auto-cut the background and tag the category for you. You can
        always tweak the result before saving.
      </p>
    </div>
  );
}

function SourceTileButton({
  tile,
  onClick,
}: {
  tile: SourceTile;
  onClick: () => void;
}) {
  const Icon = tile.icon;
  const tonePalette = {
    primary: 'border border-primary/20 bg-primary-soft text-primary',
    ai: 'border border-accent-ai/20 bg-accent-aiSoft text-accent-ai',
    neutral: 'border border-border-subtle bg-bg text-ink',
    gold: 'border border-accent-gold/20 bg-[#FFF1DC] text-accent-gold',
  } as const;
  return (
    <button
      onClick={onClick}
      aria-label={`${tile.title}: ${tile.subtitle}`}
      className={cn(
        'group flex aspect-[4/5] flex-col items-start justify-between rounded-3xl border border-border-subtle bg-bg p-4 text-left transition-all',
        'active:scale-[0.97] hover:border-border',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
      )}
    >
      <span
        className={cn(
          'grid h-12 w-12 place-items-center rounded-2xl',
          tonePalette[tile.tone],
        )}
      >
        <Icon size={22} />
      </span>
      <div>
        <p className="text-[16px] font-bold tracking-tightish text-ink-strong">{tile.title}</p>
        <p className="mt-1 text-[12px] leading-[1.4] text-ink-faint">
          {tile.subtitle}
        </p>
      </div>
    </button>
  );
}

function deriveNameFromUrl(url: string): string | undefined {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1]?.replace(/[-_.]/g, ' ').replace(/\.[a-z0-9]+$/i, '');
  } catch {
    return undefined;
  }
}

// ---------------- Camera ----------------

function CameraTab({ onPicked }: { onPicked: (src: string, name?: string) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError('Camera not supported on this device — use Gallery instead.');
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreaming(true);
        }
      } catch {
        setError('Camera permission denied. Tap Gallery to upload from your phone.');
      }
    })();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = () => {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext('2d')?.drawImage(v, 0, 0);
    onPicked(canvas.toDataURL('image/png'));
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-ink/90">
        {error ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-[13px] text-white/80">
            {error}
          </div>
        ) : (
          <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        )}
      </div>
      <p className="text-center text-[12px] text-ink-faint">
        Lay items flat on a plain surface for the cleanest cutout.
      </p>
      <AccentButton leadingIcon={<CameraIcon size={18} />} disabled={!streaming} onClick={capture}>
        Capture
      </AccentButton>
    </div>
  );
}

// ---------------- Gallery ----------------

function GalleryTab({ onPicked }: { onPicked: (src: string, name?: string) => void }) {
  const ref = useRef<HTMLInputElement | null>(null);
  return (
    <div className="flex flex-col gap-4 p-4">
      <button
        onClick={() => ref.current?.click()}
        className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-bg text-ink-subtle"
      >
        <ImageIcon size={32} className="text-ink-faint" />
        <span className="text-[14px] font-semibold tracking-tightish text-ink">Tap to choose</span>
        <span className="text-[11px] text-ink-faint">PNG or JPG, up to ~10 MB</span>
      </button>
      <p className="text-center text-[11px] text-ink-faint">
        Single items work best. Bulk uploads come in v2.
      </p>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const src = await fileToDataUrl(file);
          onPicked(src, file.name.replace(/\.[a-z0-9]+$/i, ''));
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ---------------- URL ----------------

function UrlTab({ onPicked }: { onPicked: (src: string, url: string) => void }) {
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const tryLoad = async (raw: string) => {
    setErr(null);
    setPreview(null);
    try {
      const u = new URL(raw);
      if (!/\.(png|jpe?g|webp|gif)(\?|$)/i.test(u.pathname)) {
        setErr('Direct image links only — right-click the product image and "Copy image address".');
        return;
      }
      const ok = await new Promise<boolean>((res) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res(true);
        img.onerror = () => res(false);
        img.src = u.toString();
      });
      if (!ok) {
        setErr('Image could not be loaded. The site may block cross-origin access.');
        return;
      }
      setPreview(u.toString());
    } catch {
      setErr('That doesn\'t look like a valid URL.');
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <label className="section-label">Product image URL</label>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={(e) => e.target.value && tryLoad(e.target.value)}
        placeholder="https://example.com/image.jpg"
        className="input-field w-full"
      />
      <Button variant="secondary" onClick={() => tryLoad(url)}>
        Preview
      </Button>
      {err && <p className="text-[12px] text-primary">{err}</p>}
      {preview && (
        <div className="flex flex-col items-center gap-3 pt-2">
          <img src={preview} className="max-h-72 rounded-xl object-contain" alt="Preview" />
          <AccentButton onClick={() => onPicked(preview, url)} leadingIcon={<CheckIcon size={18} />}>
            Use this image
          </AccentButton>
        </div>
      )}
    </div>
  );
}

// ---------------- Myntra past purchases ----------------

function PastPurchasesTab({ onPicked }: { onPicked: (s: typeof MYNTRA_SAMPLES[number]) => void }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-[12px] leading-5 text-ink-faint">
        Showing six sample purchases. In production this syncs from your Myntra order history.
      </p>
      <ul className="flex flex-col gap-2">
        {MYNTRA_SAMPLES.map((s) => (
          <li key={s.productId} className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-bg p-2.5">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-bg-soft">
              <img src={s.image} alt={s.name} className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold tracking-tightish text-ink">{s.brand}</div>
              <div className="truncate text-[12px] text-ink-subtle">{s.name}</div>
              <div className="mt-0.5 text-[11px] text-ink-faint">
                {formatRupees(s.pricePaise)} ·{' '}
                {new Date(s.purchasedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => onPicked(s)}>
              Add
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------- Myntra cart / wishlist bulk import ----------------

function CartImportTab({ onDone }: { onDone: () => void }) {
  const hydrate = useCartStore((s) => s.hydrate);
  const lines = useCartStore((s) => s.lines);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  async function importAll() {
    setBusy(true);
    try {
      const n = await importFromCart(lines);
      toast(n > 0 ? `Imported ${n} from cart` : 'Already in closet', n > 0 ? 'success' : 'default');
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <MyntraBulkImportList
      title="Your cart"
      hint="We'll add these to your closet — no background cut needed for product shots."
      lines={lines}
      busy={busy}
      onImport={importAll}
    />
  );
}

function WishlistImportTab({ onDone }: { onDone: () => void }) {
  const hydrate = useWishlistStore((s) => s.hydrate);
  const lines = useWishlistStore((s) => s.lines);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  async function importAll() {
    setBusy(true);
    try {
      const n = await importFromWishlist(lines);
      toast(n > 0 ? `Imported ${n} from wishlist` : 'Already in closet', n > 0 ? 'success' : 'default');
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <MyntraBulkImportList
      title="Your wishlist"
      hint="Saved items become closet pieces you can mix, plan, and shop around."
      lines={lines}
      busy={busy}
      onImport={importAll}
    />
  );
}

function MyntraBulkImportList({
  title,
  hint,
  lines,
  busy,
  onImport,
}: {
  title: string;
  hint: string;
  lines: { productId: string; name: string; brand: string; image: string; pricePaise: number }[];
  busy: boolean;
  onImport: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-[13px] font-bold text-ink-strong">{title}</p>
      <p className="text-[12px] leading-5 text-ink-faint">{hint}</p>
      <ul className="flex flex-col gap-2">
        {lines.map((s) => (
          <li key={s.productId} className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-bg p-2.5">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-bg-soft p-1">
              <img src={s.image} alt={s.name} className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-ink">{s.brand}</div>
              <div className="truncate text-[12px] text-ink-subtle">{s.name}</div>
            </div>
          </li>
        ))}
      </ul>
      <AccentButton disabled={busy || lines.length === 0} onClick={onImport} leadingIcon={<CheckIcon size={18} />}>
        Import {lines.length} item{lines.length === 1 ? '' : 's'}
      </AccentButton>
    </div>
  );
}

// ---------------- Review form ----------------

function ReviewForm({
  draft,
  onChange,
  onSave,
  onSaveAndAnother,
  onDiscard,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  onSave: () => void;
  onSaveAndAnother: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="relative flex justify-center rounded-2xl border border-border-subtle bg-bg p-4">
        <img src={draft.cutoutSrc} alt="" className="max-h-56 object-contain" />
        {draft.dominantColor && (
          <div
            className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full ring-2 ring-bg shadow-card"
            style={{ backgroundColor: draft.dominantColor }}
            aria-label={`Dominant colour ${draft.dominantColor}`}
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="section-label">Category</label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_ORDER.map((c) => (
            <Chip key={c} active={draft.category === c} onClick={() => onChange({ category: c })}>
              {CATEGORY_LABELS[c]}
            </Chip>
          ))}
        </div>
      </div>

      <Field label="Name" value={draft.name ?? ''} onChange={(v) => onChange({ name: v })} placeholder="e.g. Green Zara Trousers" />
      <Field label="Brand" value={draft.brand ?? ''} onChange={(v) => onChange({ brand: v })} placeholder="e.g. Zara" />

      <div className="flex flex-col gap-2 pt-2">
        <AccentButton fullWidth onClick={onSave} leadingIcon={<CheckIcon size={18} />}>
          Save to wardrobe
        </AccentButton>
        <Button fullWidth variant="secondary" onClick={onSaveAndAnother} leadingIcon={<RotateIcon size={18} />}>
          Save & add another
        </Button>
        <Button fullWidth variant="ghost" onClick={onDiscard}>
          Discard
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="section-label">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field w-full"
      />
    </label>
  );
}

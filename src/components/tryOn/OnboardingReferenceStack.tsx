import { useEffect, useState } from 'react';
import { CameraIcon, CloseIcon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

const SHUTTER_BTN_SRC = '/assets/80db93f8-1fab-4d96-8dba-754e40bb7d35.svg';

export type ReferenceStackImage = {
  src: string;
  label: string;
  rotate: string;
  zIndex: number;
  offsetX?: number;
  offsetY?: number;
  /** Card width in px; height follows 9:16. */
  width?: number;
};

type OnboardingReferenceStackProps = {
  images: ReferenceStackImage[];
  className?: string;
  variant?: 'selfie' | 'body';
};

const STACK_CARD_WIDTH: Record<'selfie' | 'body', number> = {
  selfie: 130,
  body: 176,
};

/**
 * Instruction preview — spread 9:16 cards, centered; label on image bottom-right.
 */
export function OnboardingReferenceStack({
  images,
  className,
  variant = 'selfie',
}: OnboardingReferenceStackProps) {
  const defaultW = STACK_CARD_WIDTH[variant];

  return (
    <div
      className={cn(
        'relative mx-auto h-full w-full max-w-[360px]',
        variant === 'selfie' ? 'min-h-[180px]' : 'min-h-[260px]',
        className
      )}
      aria-hidden
    >
      {images.map((img) => {
        const cardW = img.width ?? defaultW;
        return (
          <div
            key={img.label}
            className="absolute left-1/2 top-1/2"
            style={{
              zIndex: img.zIndex,
              transform: `translate(calc(-50% + ${img.offsetX ?? 0}px), calc(-50% + ${img.offsetY ?? 0}px))`,
            }}
          >
            <div className="origin-center" style={{ transform: `rotate(${img.rotate})` }}>
              <div
                className="relative overflow-hidden rounded-2xl border border-[#e9e9eb] shadow-[0_10px_28px_rgba(38,42,57,0.1)]"
                style={{ width: cardW }}
              >
                <img
                  src={img.src}
                  alt=""
                  className={cn(
                    'block w-full object-cover',
                    variant === 'selfie' ? 'aspect-[3/4] object-center' : 'aspect-[9/16] object-top',
                  )}
                />
                <span className="absolute bottom-1.5 right-1.5 max-w-[85%] truncate rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-[2px]">
                  {img.label}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type IntroCaptureNote = { label: string; hint: string };

export const SELFIE_INTRO_NOTES: IntroCaptureNote[] = [
  {
    label: 'Front-facing',
    hint: 'Face the camera directly. Keep your head centered and evenly lit.',
  },
  {
    label: 'Side profile',
    hint: 'Turn your head to show your side profile — ear and jawline visible.',
  },
];

export const BODY_INTRO_NOTES: IntroCaptureNote[] = [
  {
    label: 'Front',
    hint: 'Stand straight — show your full body from head to toe in frame.',
  },
  {
    label: 'Side',
    hint: 'Turn to the side — keep your full silhouette visible, phone at chest height.',
  },
];

export function OnboardingIntroNotes({
  notes,
  className,
}: {
  notes: IntroCaptureNote[];
  className?: string;
}) {
  return (
    <ul className={cn('m-0 list-none space-y-1.5 p-0 text-left', className)}>
      {notes.map((note) => (
        <li key={note.label} className="text-[11.5px] leading-[1.4] text-[#686b77]">
          <span className="font-semibold text-[#262a39]">{note.label}</span>
          <span className="text-[#8d8e96]"> — {note.hint}</span>
        </li>
      ))}
    </ul>
  );
}

export type CaptureGuideKind = 'selfie-front' | 'selfie-side' | 'body-front' | 'body-side';

export const CAPTURE_GUIDE: Record<
  CaptureGuideKind,
  { step: number; total: number; title: string; instruction: string; src: string }
> = {
  'selfie-front': {
    step: 1,
    total: 2,
    title: 'Normal selfie',
    instruction: 'Face the camera directly. Keep your head centered.',
    src: '/seed-products/tryon-onboarding/selfie-front.jpg',
  },
  'selfie-side': {
    step: 2,
    total: 2,
    title: 'Side profile selfie',
    instruction: 'Turn your head to show your side profile.',
    src: '/seed-products/tryon-onboarding/selfie-side.jpg',
  },
  'body-front': {
    step: 1,
    total: 2,
    title: 'Front body shot',
    instruction: 'Stand straight — show your full body from head to toe.',
    src: '/seed-products/tryon-onboarding/body-front.jpg',
  },
  'body-side': {
    step: 2,
    total: 2,
    title: 'Side body shot',
    instruction: 'Turn to the side — keep your full silhouette in frame.',
    src: '/seed-products/tryon-onboarding/body-side.jpg',
  },
};

export const SELFIE_INTRO_STACK: ReferenceStackImage[] = [
  {
    src: '/seed-products/tryon-onboarding/selfie-front.jpg',
    label: 'Front-facing',
    rotate: '-4deg',
    zIndex: 1,
    offsetX: -48,
    offsetY: 4,
    width: 130,
  },
  {
    src: '/seed-products/tryon-onboarding/selfie-side.jpg',
    label: 'Side profile',
    rotate: '5deg',
    zIndex: 2,
    offsetX: 48,
    offsetY: -6,
    width: 130,
  },
];

export const BODY_INTRO_STACK: ReferenceStackImage[] = [
  {
    src: '/seed-products/tryon-onboarding/body-front.jpg',
    label: 'Front',
    rotate: '-3deg',
    zIndex: 1,
    offsetX: -62,
    offsetY: 4,
    width: 176,
  },
  {
    src: '/seed-products/tryon-onboarding/body-side.jpg',
    label: 'Side',
    rotate: '4deg',
    zIndex: 2,
    offsetX: 62,
    offsetY: -4,
    width: 176,
  },
];

export function captureKindFromStep(
  avatarStep: 'selfies-camera' | 'body-camera',
  captureTarget: 1 | 2,
): CaptureGuideKind {
  if (avatarStep === 'selfies-camera') {
    return captureTarget === 1 ? 'selfie-front' : 'selfie-side';
  }
  return captureTarget === 1 ? 'body-front' : 'body-side';
}

const CAPTURE_TIPS: Record<'selfie' | 'body', string[]> = {
  selfie: ['Even light', 'No hats or glasses', 'Face camera'],
  body: ['Full silhouette', 'Even light', 'Fitted clothing'],
};

type SimulatedCaptureViewProps = {
  src: string;
  stepIndex: number;
  stepTotal: number;
  captureLabel: string;
  instruction?: string;
  variant?: 'selfie' | 'body';
  embedded?: boolean;
  onClose?: () => void;
  onBack?: () => void;
  onUpload: () => void;
  uploadedPreview?: string | null;
  onContinue: (photoUrl: string) => void;
};

export function SimulatedCaptureView({
  src,
  stepIndex,
  stepTotal,
  captureLabel,
  instruction,
  variant = 'selfie',
  embedded = false,
  onClose,
  onUpload,
  uploadedPreview,
  onContinue,
}: SimulatedCaptureViewProps) {
  const [previewSrc, setPreviewSrc] = useState(src);
  const [captured, setCaptured] = useState(false);
  const [flash, setFlash] = useState(false);
  const [shutterBusy, setShutterBusy] = useState(false);

  useEffect(() => {
    setPreviewSrc(src);
    setCaptured(false);
    setFlash(false);
    setShutterBusy(false);
  }, [src]);

  useEffect(() => {
    if (!uploadedPreview) return;
    setPreviewSrc(uploadedPreview);
    setCaptured(true);
  }, [uploadedPreview]);

  const handleShutter = () => {
    if (shutterBusy || captured) return;
    setShutterBusy(true);
    setFlash(true);
    window.setTimeout(() => {
      setFlash(false);
      setPreviewSrc(src);
      setCaptured(true);
      setShutterBusy(false);
    }, 280);
  };

  const isBody = variant === 'body';
  const tips = CAPTURE_TIPS[variant];

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col animate-fade-in bg-bg',
        embedded && 'px-4',
      )}
    >
      {!embedded && (
        <div className="flex shrink-0 items-center justify-between border-b border-line bg-bg px-5 pb-2 pt-1">
          <h2 className="m-0 text-[16px] font-bold leading-[18px] text-[#262a39]">
            {isBody
              ? `Capture Body Shot ${stepIndex} of ${stepTotal}`
              : `Capture Selfie ${stepIndex} of ${stepTotal}`}
          </h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 hover:bg-black/5"
              aria-label="Close camera"
            >
              <CloseIcon size={20} className="text-gray-500" />
            </button>
          )}
        </div>
      )}

      <div
        className={cn(
          'relative min-h-0 flex-1 overflow-hidden bg-[#f4f4f5]',
          embedded
            ? 'rounded-2xl border border-[#e9e9eb] shadow-sm'
            : 'rounded-2xl',
        )}
      >
        <img
          src={previewSrc}
          alt=""
          className={cn(
            'absolute inset-0 h-full w-full',
            isBody ? 'object-cover object-top' : 'object-cover object-center',
          )}
        />
        {flash && (
          <div className="absolute inset-0 z-10 rounded-2xl bg-white" aria-hidden />
        )}
      </div>

      {embedded && instruction ? (
        <p className="m-0 shrink-0 px-0 pt-2.5 text-center text-[12px] leading-[1.45] text-[#686b77]">
          {instruction}
        </p>
      ) : null}

      <div
        className={cn(
          'shrink-0 border-t border-line bg-bg pt-2.5',
          embedded ? 'mt-2 border-t-0 px-0 pb-2' : 'px-4 pb-[calc(1rem+var(--safe-bottom))]',
        )}
      >
        <p className="m-0 text-center text-[12px] text-[#8d8e96]">For better results, ensure</p>
        <div className="mt-2 flex flex-nowrap items-center justify-center gap-1.5 overflow-x-auto no-scrollbar px-0.5">
          {tips.map((tip) => (
            <span
              key={tip}
              className="shrink-0 whitespace-nowrap rounded-lg border border-[#f4f4f5] bg-[#f9f9fa] px-2 py-1 text-[10px] leading-[12px] text-[#8d8e96]"
            >
              {tip}
            </span>
          ))}
        </div>

        {captured ? (
          <div className="mt-4 flex flex-col gap-2">
            <p className="m-0 text-center text-[12px] font-semibold text-[#262a39]">
              {captureLabel} · saved
            </p>
            <button
              type="button"
              onClick={() => onContinue(previewSrc)}
              className="flex h-12 w-full items-center justify-center rounded-[12px] bg-[#ff3f6c] text-[16px] font-bold text-white shadow-[0_4px_14px_rgba(255,63,108,0.2)] transition-transform active:scale-[0.99] hover:bg-[#e6355e]"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-between gap-6">
            <div className="flex min-w-[100px] flex-1 items-center justify-center">
              <button
                type="button"
                onClick={onUpload}
                className="flex items-center rounded-[26px] border border-[#f4f4f5] p-2.5 transition-opacity active:opacity-80"
                aria-label="Add photo from gallery"
              >
                <CameraIcon size={20} className="text-gray-500" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleShutter}
              disabled={shutterBusy}
              className="relative flex size-[48px] shrink-0 items-center justify-center rounded-[40px] border-[3px] border-[#ff3f6c] p-[5px] transition-transform active:scale-95 disabled:opacity-50"
              aria-label="Take photo"
            >
              <img alt="" className="block size-full max-w-none rounded-full" src={SHUTTER_BTN_SRC} />
            </button>

            <div className="min-w-[100px] flex-1" />
          </div>
        )}
      </div>
    </div>
  );
}

export function ReviewPhotoTile({
  src,
  label,
  tall = false,
  compact = false,
  fillCell = false,
  onRetake,
}: {
  src: string;
  label: string;
  tall?: boolean;
  compact?: boolean;
  /** Fit inside a flex/grid cell (review sheet — no scroll). */
  fillCell?: boolean;
  onRetake: () => void;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[#e9e9eb] bg-[#f4f4f5] shadow-sm',
        fillCell && 'h-full min-h-0 w-full',
        !fillCell && compact && 'aspect-[9/16]',
        !fillCell && !compact && tall && (compact ? 'aspect-[3/5] min-h-[150px]' : 'min-h-[220px]'),
        !fillCell && !compact && !tall && 'aspect-square',
      )}
    >
      <img
        src={src}
        alt={label}
        className={cn(
          'h-full w-full object-cover',
          tall || fillCell ? 'object-top' : 'object-center',
        )}
      />
      <div className="absolute inset-x-0 bottom-0 bg-black/45 py-1 text-center text-[10px] font-bold text-white">
        {label}
      </div>
      <button
        type="button"
        onClick={onRetake}
        className="absolute top-2 right-2 rounded-full border border-[#ff3f6c]/30 bg-white/95 px-2 py-1 text-[9px] font-extrabold text-[#ff3f6c] shadow-sm transition-transform active:scale-95 hover:bg-white"
      >
        Retake
      </button>
    </div>
  );
}

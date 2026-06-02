import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TopNav } from '@/components/ui/TopNav';
import { BackButton } from '@/components/ui/BackButton';
import { Button, AccentButton } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import {
  CheckIcon,
  ChevronRightIcon,
  ShareIcon,
  WandIcon,
  CloseIcon,
} from '@/components/ui/Icon';
import { ItemCard } from '@/components/wardrobe/ItemCard';
import { useTryOnStore } from '@/store/tryOnStore';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { useOutfitStore } from '@/store/outfitStore';
import { useTryOnPersona } from '@/lib/tryOnPersona';
import { zoneForGarment } from '@/lib/tryOnPlacement';
import {
  TRYON_ONBOARDING,
  tryOnBodyCapturePhoto,
  tryOnSelfieCapturePhoto,
} from '@/data/tryOnOnboardingPhotos';
import { sortWardrobeByRecent } from '@/lib/wardrobeRecent';
import { resolveTryOnGarments } from '@/lib/tryOnResolveGarments';
import type { TryOnGarment, TryOnLocationState } from '@/lib/tryOnTypes';
import { shareOrDownload } from '@/lib/share';
import { loadImage } from '@/lib/storage';
import { toast } from '@/components/ui/Toast';
import { track } from '@/lib/telemetry';
import { cn } from '@/lib/cn';
import type { WardrobeItem } from '@/types';
import { TRYON_CONSENT_MANNEQUINS } from '@/data/tryOnMannequins';
import {
  TryOnAvatarOnboardingSheet,
  type AvatarOnboardingStep,
} from '@/components/tryOn/TryOnAvatarOnboardingSheet';

type Phase = 'pick' | 'generating' | 'result';

const MANNEQUINS = TRYON_CONSENT_MANNEQUINS;

export function TryOnStudio() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as TryOnLocationState | null) ?? null;

  const hydrateTryOn = useTryOnStore((s) => s.hydrate);
  const storedBodyPreview = useTryOnStore((s) => s.fullBodyPreview);
  const setAvatar = useTryOnStore((s) => s.setAvatar);
  const clearAvatar = useTryOnStore((s) => s.clearAvatar);
  const setLastResult = useTryOnStore((s) => s.setLastResult);
  const runTryOnGeneration = useTryOnStore((s) => s.runTryOnGeneration);
  const generatingOutfitId = useTryOnStore((s) => s.generatingOutfitId);
  const genStage = useTryOnStore((s) => s.genStage);
  const genPercent = useTryOnStore((s) => s.genPercent);
  const { effectiveBodyPreview, usesLiveCamera } = useTryOnPersona();

  const items = useWardrobeStore((s) => s.items);
  const recentClosetItems = useMemo(() => sortWardrobeByRecent(items), [items]);
  const outfits = useOutfitStore((s) => s.outfits);

  const [phase, setPhase] = useState<Phase>('pick');
  const [avatarStep, setAvatarStep] = useState<AvatarOnboardingStep>('selfies-intro');
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false);
  const [garments, setGarments] = useState<TryOnGarment[]>([]);
  const [title, setTitle] = useState<string | undefined>();
  
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [closetOpen, setClosetOpen] = useState(false);
  
  // Interactive Onboarding states
  const [selfie1, setSelfie1] = useState<string | null>(null);
  const [selfie2, setSelfie2] = useState<string | null>(null);
  const [bodyShot1, setBodyShot1] = useState<string | null>(null);
  const [bodyShot2, setBodyShot2] = useState<string | null>(null);
  const [captureTarget, setCaptureTarget] = useState<1 | 2>(1);
  const [returnToReviewAfterCapture, setReturnToReviewAfterCapture] = useState(false);
  const [captureUploadPreview, setCaptureUploadPreview] = useState<string | null>(null);

  const [resultOutfitId, setResultOutfitId] = useState<string | null>(null);

  useEffect(() => {
    void hydrateTryOn();
  }, [hydrateTryOn]);

  useEffect(() => {
    if (generatingOutfitId) setPhase('generating');
  }, [generatingOutfitId]);

  useEffect(() => {
    (async () => {
      let outfitItemIds: string[] | undefined;
      if (navState?.outfitId) {
        const o = outfits.find((x) => x.id === navState.outfitId);
        outfitItemIds = o?.nodes.map((n) => n.itemId);
      }
      const resolved = await resolveTryOnGarments({
        state: navState,
        wardrobeItems: items,
        outfitItemIds,
      });
      setGarments(resolved.garments);
      setTitle(resolved.title ?? navState?.title);
      track('try_on_started', {
        source: navState?.discoverOutfitId ? 'discover' : navState?.outfitId ? 'outfit' : 'closet',
        garments: resolved.garments.length,
      });
    })();
  }, [navState, items, outfits]);

  useEffect(() => {
    if (!effectiveBodyPreview) {
      setAvatarStep('selfies-intro');
      setAvatarSheetOpen(true);
    } else {
      setAvatarSheetOpen(false);
    }
  }, [effectiveBodyPreview]);

  const canGenerate = garments.length > 0 && !!effectiveBodyPreview;

  const closeAvatarSheet = () => {
    setAvatarSheetOpen(false);
    if (!effectiveBodyPreview) navigate(-1);
  };

  const handleSlotUpload = () => {
    const slot =
      avatarStep === 'selfies-camera'
        ? captureTarget === 1
          ? 'selfie1'
          : 'selfie2'
        : captureTarget === 1
          ? 'bodyShot1'
          : 'bodyShot2';
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCaptureUploadPreview(result);
        if (slot === 'selfie1') setSelfie1(result);
        else if (slot === 'selfie2') setSelfie2(result);
        else if (slot === 'bodyShot1') setBodyShot1(result);
        else if (slot === 'bodyShot2') setBodyShot2(result);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const advanceSimulatedSelfieCapture = (photoUrl: string) => {
    const photo = photoUrl;

    if (captureTarget === 1) {
      setSelfie1(photo);
      if (returnToReviewAfterCapture) {
        setReturnToReviewAfterCapture(false);
        setAvatarStep('review');
        return;
      }
      setCaptureTarget(2);
      setCaptureUploadPreview(null);
      return;
    }

    setSelfie2(photo);
    if (returnToReviewAfterCapture) {
      setReturnToReviewAfterCapture(false);
      setAvatarStep('review');
      return;
    }
    setCaptureTarget(1);
    setCaptureUploadPreview(null);
    setAvatarStep('body-intro');
  };

  const advanceSimulatedBodyCapture = (photoUrl: string) => {
    const photo = photoUrl;

    if (captureTarget === 1) {
      setBodyShot1(photo);
      if (returnToReviewAfterCapture) {
        setReturnToReviewAfterCapture(false);
        setAvatarStep('review');
        return;
      }
      setCaptureTarget(2);
      setCaptureUploadPreview(null);
      return;
    }

    setBodyShot2(photo);
    setReturnToReviewAfterCapture(false);
    setCaptureUploadPreview(null);
    setAvatarStep('review');
  };

  const saveAvatarAndGenerate = async () => {
    const finalPhoto = usesLiveCamera
      ? bodyShot1
      : bodyShot1 || TRYON_ONBOARDING.bodyFront;
    if (!finalPhoto) {
      toast('Capture a front body photo before continuing.', 'warning');
      return;
    }
    await setAvatar(finalPhoto, selfie1 ?? undefined);
    
    setAvatarStep('selfies-intro');
    setAvatarSheetOpen(false);

    toast('Avatar saved successfully!', 'success');
    
    if (garments.length > 0) {
      void runGenerateDirectly(finalPhoto);
    } else {
      setPhase('pick');
    }
  };

  const completeGeneration = (url: string) => {
    setResultUrl(url);
    setLastResult(url);
    track('try_on_completed', { garments: garments.length });
    setPhase('result');
  };

  const failGeneration = () => {
    track('try_on_failed', { garments: garments.length });
    toast('Could not generate try-on', 'warning');
    setPhase('pick');
  };

  const startGeneration = async (avatarUrl: string) => {
    setPhase('generating');
    try {
      const { outfitId, resultUrl } = await runTryOnGeneration({
        avatarUrl,
        garments,
        wardrobeItems: items,
        title,
      });
      setResultOutfitId(outfitId);
      completeGeneration(resultUrl);
    } catch {
      failGeneration();
    }
  };

  const runGenerateDirectly = async (avatarUrl: string) => {
    await startGeneration(avatarUrl);
  };

  const runGenerate = async () => {
    if (!effectiveBodyPreview || garments.length === 0) return;
    await startGeneration(effectiveBodyPreview);
  };

  const exitGeneratingToHome = () => {
    navigate('/home');
    setPhase('pick');
    toast('Try-on will keep generating in Your outfits', 'success');
  };

  const onSaveOutfit = () => {
    const id = resultOutfitId;
    if (!id) return;
    track('outfit_saved', { mode: 'try-on', items: garments.length });
    navigate(`/outfit/${id}?celebrate=1`);
  };

  const onShare = async () => {
    if (!resultUrl) return;
    const action = await shareOrDownload(resultUrl, 'myntra-try-on.png', 'My try-on look');
    if (action !== 'cancelled') track('try_on_shared', {});
  };

  const addGarment = async (item: WardrobeItem) => {
    const url = (await loadImage(item.imageBlobKey)) ?? item.thumbnailDataUrl;
    setGarments((prev) => {
      if (prev.some((g) => g.id === item.id)) return prev;
      return [
        ...prev,
        {
          id: item.id,
          name: item.name ?? item.category,
          category: item.category,
          imageUrl: url,
          zone: zoneForGarment({ category: item.category, name: item.name }),
        },
      ];
    });
  };

  const removeGarment = (id: string) => {
    setGarments((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg relative">
      {/* Self-contained exact CSS stylesheet */}
      <style>{`
        @keyframes try-on-consent-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .try-on-consent-carousel-track {
          display: flex;
          width: max-content;
          animation: try-on-consent-scroll 24s linear infinite;
        }
        .try-on-consent-carousel-set {
          display: flex;
          gap: 8px;
          padding-right: 8px;
        }
        
        /* Interactive Height collapsed wrapper transition */
        .try-on-height-collapsed-wrap {
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        
        /* Body Selection layout */
        .try-on-body-cards-viewport {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .try-on-body-cards-viewport::-webkit-scrollbar {
          display: none;
        }
        
        /* Simulated AI generation style stages */
        .try-on-gen-loading-layer {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
        }
        .try-on-gen-loading-layer.stage-4-active {
          transform: translateY(-100%);
          opacity: 0;
        }
        .try-on-gen-loader-bar-anim {
          transition: width 0.1s linear;
        }
      `}</style>

      {/* Top Navbar — hidden on full-bleed result */}
      {phase !== 'result' && (
        <TopNav
          title={phase === 'generating' ? 'Try it on' : 'AI Fitting Room'}
          showBack
          onBack={() => {
            if (phase === 'generating') exitGeneratingToHome();
            else navigate(-1);
          }}
          borderless
          trailing={
            phase === 'pick' && effectiveBodyPreview ? (
              <button
                type="button"
                onClick={() => {
                  setAvatarStep('selfies-intro');
                  setAvatarSheetOpen(true);
                }}
                className="text-[13px] font-bold text-primary"
              >
                Retake Photo
              </button>
            ) : undefined
          }
        />
      )}

      <div
        className={cn(
          'scroll-area flex min-h-0 flex-1 flex-col justify-start px-5 pb-[calc(1rem+var(--safe-bottom))]',
          phase === 'result' && 'hidden',
        )}
      >
        {phase === 'pick' && (
          <>
            <div className="rounded-[24px] border border-border-subtle bg-white p-4 animate-fade-in shadow-sm">
              <div className="flex items-start gap-3.5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-[#f0eefc] text-[#8270db]">
                  <WandIcon size={20} />
                </span>
                <div>
                  <p className="text-[16px] font-bold text-[#262a39] leading-tight">Virtual fitting room</p>
                  <p className="mt-1.5 text-[12.5px] leading-[1.4] text-[#686b77]">
                    Try on clothes with your configured model avatar. Customize pieces to preview outfit fits before buying.
                  </p>
                </div>
              </div>
            </div>

            {effectiveBodyPreview && (
              <div className="mt-4 flex items-center gap-4 rounded-[24px] border border-border-subtle bg-white p-4 animate-fade-in shadow-sm">
                <img
                  src={effectiveBodyPreview}
                  alt=""
                  className="h-[68px] w-[52px] rounded-[12px] object-cover object-top border border-border-subtle animate-fade-in"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-bold text-[#262a39] leading-tight">Your avatar</p>
                  <p className="text-[12.5px] text-[#686b77] mt-0.5">Custom sizing profile configured</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarStep('selfies-intro');
                    setAvatarSheetOpen(true);
                  }}
                  className="text-[14px] font-bold text-[#ff3f6c] active:opacity-80 transition-opacity"
                >
                  Configure
                </button>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-2">
              <h2 className="text-[12.5px] font-extrabold uppercase tracking-wider text-[#8d8e96] font-sans">
                Items to try {title ? `· ${title}` : ''}
              </h2>
              <button
                type="button"
                onClick={() => setClosetOpen(true)}
                className="inline-flex items-center gap-1 text-[13px] font-bold text-[#ff3f6c] active:opacity-80 transition-opacity"
              >
                <span className="text-[16px] leading-[1] font-normal">+</span>
                <span>Add Items</span>
              </button>
            </div>

            {garments.length === 0 ? (
              <div className="mt-3 rounded-[24px] border border-dashed border-border-subtle px-4 py-8 text-center flex-1 flex flex-col justify-center bg-white shadow-sm">
                <p className="text-[14px] font-bold text-[#262a39]">No items selected</p>
                <p className="mt-1 text-[12.5px] text-[#686b77]">Select items to display in preview</p>
                <Button className="mt-4 mx-auto" variant="secondary" onClick={() => setClosetOpen(true)}>
                  Browse closet
                </Button>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-3 gap-3 py-2 mb-6">
                {garments.map((g) => (
                  <div key={g.id} className="relative animate-scale-in">
                    <button
                      type="button"
                      onClick={() => removeGarment(g.id)}
                      aria-label={`Remove ${g.name}`}
                      className="absolute -right-1.5 -top-1.5 z-10 grid h-6 w-6 place-items-center rounded-full bg-[#1b2234] text-white shadow-md active:scale-90 transition-transform cursor-pointer hover:bg-[#ff3f6c]"
                    >
                      <CloseIcon size={9} />
                    </button>
                    <div className="overflow-hidden rounded-[16px] border border-border-subtle bg-white p-2.5 flex flex-col items-center shadow-sm">
                      <div className="aspect-square w-full flex items-center justify-center overflow-hidden rounded-lg bg-white">
                        <img src={g.imageUrl} alt="" className="max-h-full max-w-full object-contain" />
                      </div>
                      <p className="mt-2 truncate w-full text-center text-[10px] font-bold text-[#262a39] px-0.5">{g.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              disabled={!canGenerate}
              onClick={() => void runGenerate()}
              className={cn(
                "mt-auto w-full flex gap-2 h-12 items-center justify-center rounded-[12px] font-bold text-[16px] text-white transition-all active:scale-[0.99]",
                canGenerate
                  ? "bg-[#ff3f6c] cursor-pointer hover:bg-[#e6355e] shadow-[0_4px_14px_rgba(255,63,108,0.25)]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              <WandIcon size={18} />
              <span>Generate try-on</span>
            </button>
          </>
        )}

        {phase === 'generating' && (
          <StagedGeneratingView
            stage={genStage}
            percent={genPercent}
            preview={effectiveBodyPreview}
            onExit={exitGeneratingToHome}
          />
        )}
      </div>

      {phase === 'result' && resultUrl && (
        <ResultView
          resultUrl={resultUrl}
          onBack={() => {
            setResultUrl(null);
            setPhase('pick');
          }}
          onShare={() => void onShare()}
          onSave={onSaveOutfit}
          onAgain={() => {
            setResultUrl(null);
            setPhase('pick');
          }}
        />
      )}

      <TryOnAvatarOnboardingSheet
        open={avatarSheetOpen}
        onClose={closeAvatarSheet}
        useLiveCamera={usesLiveCamera}
        step={avatarStep}
        captureTarget={captureTarget}
        captureUploadPreview={captureUploadPreview}
        selfie1={selfie1}
        selfie2={selfie2}
        bodyShot1={bodyShot1}
        bodyShot2={bodyShot2}
        onStartSelfies={() => {
          setReturnToReviewAfterCapture(false);
          setCaptureUploadPreview(null);
          setCaptureTarget(1);
          setAvatarStep('selfies-camera');
        }}
        onStartBody={() => {
          setReturnToReviewAfterCapture(false);
          setCaptureUploadPreview(null);
          setCaptureTarget(1);
          setAvatarStep('body-camera');
        }}
        onUpload={handleSlotUpload}
        onSelfieCaptureContinue={advanceSimulatedSelfieCapture}
        onBodyCaptureContinue={advanceSimulatedBodyCapture}
        onSelfieCameraBack={() => setAvatarStep('selfies-intro')}
        onBodyCameraBack={() => {
          setCaptureUploadPreview(null);
          if (captureTarget === 2) setCaptureTarget(1);
          setAvatarStep('body-intro');
        }}
        onReviewBack={() => setAvatarStep('body-intro')}
        onSave={() => void saveAvatarAndGenerate()}
        onRetakeSelfie={(target) => {
          setCaptureTarget(target);
          setReturnToReviewAfterCapture(true);
          setCaptureUploadPreview(null);
          setAvatarStep('selfies-camera');
        }}
        onRetakeBody={(target) => {
          setCaptureTarget(target);
          setReturnToReviewAfterCapture(true);
          setCaptureUploadPreview(null);
          setAvatarStep('body-camera');
        }}
      />

      <Sheet open={closetOpen} onClose={() => setClosetOpen(false)} title="Add from closet">
        <div className="grid grid-cols-3 gap-2 pb-4">
          {recentClosetItems.map((it) => {
            const isSelected = garments.some((g) => g.id === it.id);
            return (
              <ItemCard
                key={it.id}
                item={it}
                selectable
                selected={isSelected}
                onClick={() => {
                  if (isSelected) {
                    removeGarment(it.id);
                  } else {
                    void addGarment(it);
                  }
                }}
              />
            );
          })}
        </div>
      </Sheet>
    </div>
  );
}

function StagedGeneratingView({
  stage,
  percent,
  preview,
  onExit,
}: {
  stage: number;
  percent: number;
  preview: string | null;
  onExit?: () => void;
}) {
  const getStageLabel = () => {
    if (stage === 1) return 'Analyzing your photo…';
    if (stage === 2) return 'Mapping body shape…';
    if (stage === 3) return 'Draping garments…';
    return 'Adjusting fit & lighting…';
  };

  const progressWidth = stage >= 3 ? percent : stage === 2 ? 30 : 10;
  const progressLabel = stage >= 3 ? `${percent}%` : stage === 2 ? '30%' : '10%';

  const getBlurClass = () => {
    if (stage === 1) return 'scale-[1.01] blur-[6px] opacity-90';
    if (stage === 2) return 'scale-[1.02] blur-[10px] opacity-75';
    if (stage === 3) return 'scale-[1.03] blur-[14px] opacity-60';
    return 'scale-[1.04] blur-[18px] opacity-50';
  };

  return (
    <div
      className={cn(
        'absolute inset-x-0 bottom-0 top-14 z-30 flex flex-col items-center justify-center overflow-hidden bg-bg text-center transition-all duration-[600ms] ease-in-out',
        stage === 4 && 'pointer-events-none translate-y-[-12px] opacity-0',
      )}
    >
      {preview ? (
        <div className="pointer-events-none absolute inset-0 z-0 select-none">
          <img
            src={preview}
            alt=""
            className={cn(
              'h-full w-full object-cover object-top transition-all duration-[1000ms] ease-in-out',
              getBlurClass(),
            )}
          />
          <div className="absolute inset-0 bg-white/78" aria-hidden />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-[#f9f9fa]" aria-hidden />
      )}

      {onExit && (
        <button
          type="button"
          onClick={onExit}
          className="absolute right-4 top-3 z-20 rounded-full border border-[#eaebec] bg-white/95 px-3 py-1.5 text-[12px] font-bold text-[#262a39] shadow-sm active:scale-95"
        >
          Exit
        </button>
      )}

      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6">
        <div className="relative mb-7 flex h-[72px] w-[72px] items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border-2 border-[#ff3f6c]/15"
            aria-hidden
          />
          <div
            className="absolute inset-[6px] rounded-full border border-[#eaebec] animate-pulse"
            aria-hidden
          />
          <span className="relative grid h-12 w-12 place-items-center rounded-full bg-[#fff5f7] text-[#ff3f6c]">
            <WandIcon size={22} />
          </span>
        </div>

        <h2 className="m-0 text-[18px] font-bold leading-tight text-[#262a39] transition-all duration-300">
          {getStageLabel()}
        </h2>
        <p className="m-0 mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8d8e96]">
          Preparing your try-on
        </p>
        {onExit && (
          <p className="m-0 mt-2 max-w-[240px] text-[11px] leading-snug text-[#8d8e96]">
            You can leave — we&apos;ll keep working and show the result under Your outfits.
          </p>
        )}

        <div className="relative mt-8 h-1.5 w-[200px] overflow-hidden rounded-full bg-[#eaebec]">
          <div
            className="try-on-gen-loader-bar-anim h-full rounded-full bg-[#ff3f6c] transition-all duration-150"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-[11px] font-semibold tabular-nums text-[#8d8e96]">
          {progressLabel}
        </p>
      </div>
    </div>
  );
}

// Full-bleed portrait result with overlay actions
function ResultView({
  resultUrl,
  onBack,
  onShare,
  onSave,
  onAgain,
}: {
  resultUrl: string;
  onBack: () => void;
  onShare: () => void;
  onSave: () => void;
  onAgain: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-black animate-fade-in">
      <img
        src={resultUrl}
        alt="Try-on result"
        className="absolute inset-0 h-full w-full object-cover object-top"
        draggable={false}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/55 via-black/20 to-transparent pt-[max(0.75rem,env(safe-area-inset-top))] px-4 pb-10">
        <BackButton
          onClick={onBack}
          aria-label="Back to fitting room"
          className="pointer-events-auto text-white"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-5 pb-[calc(1rem+var(--safe-bottom))] pt-20">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            className="border-white/20 bg-white/95 text-ink-strong backdrop-blur-sm hover:bg-white"
            leadingIcon={<ShareIcon size={16} />}
            onClick={onShare}
          >
            Share Look
          </Button>
          <AccentButton leadingIcon={<CheckIcon size={16} />} onClick={onSave}>
            View in outfits
          </AccentButton>
        </div>
        <button
          type="button"
          onClick={onAgain}
          className="mt-3 w-full py-2 text-[13px] font-semibold text-white/80 transition-colors hover:text-white"
        >
          Try another combination
        </button>
      </div>
    </div>
  );
}

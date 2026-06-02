import {
  BODY_INTRO_NOTES,
  BODY_INTRO_STACK,
  OnboardingIntroNotes,
  OnboardingReferenceStack,
  ReviewPhotoTile,
  SELFIE_INTRO_NOTES,
  SELFIE_INTRO_STACK,
  SimulatedCaptureView,
  captureKindFromStep,
  CAPTURE_GUIDE,
} from '@/components/tryOn/OnboardingReferenceStack';
import { LiveCaptureView } from '@/components/tryOn/LiveCaptureView';
import {
  Sheet,
  TRYON_ONBOARDING_BODY_INTRO_HEIGHT,
  TRYON_ONBOARDING_CAMERA_HEIGHT,
  TRYON_ONBOARDING_INTRO_HEIGHT,
  TRYON_ONBOARDING_REVIEW_HEIGHT,
} from '@/components/ui/Sheet';
import { TRYON_ONBOARDING } from '@/data/tryOnOnboardingPhotos';
import { cn } from '@/lib/cn';

export type AvatarOnboardingStep =
  | 'selfies-intro'
  | 'selfies-camera'
  | 'body-intro'
  | 'body-camera'
  | 'review';

function onboardingSheetHeight(step: AvatarOnboardingStep): string {
  switch (step) {
    case 'review':
      return TRYON_ONBOARDING_REVIEW_HEIGHT;
    case 'body-intro':
      return TRYON_ONBOARDING_BODY_INTRO_HEIGHT;
    case 'selfies-intro':
      return TRYON_ONBOARDING_INTRO_HEIGHT;
    case 'selfies-camera':
    case 'body-camera':
      return TRYON_ONBOARDING_CAMERA_HEIGHT;
  }
}

function sheetTitle(step: AvatarOnboardingStep, captureTarget: 1 | 2): string {
  switch (step) {
    case 'selfies-intro':
      return 'Take Selfies';
    case 'selfies-camera': {
      const g = CAPTURE_GUIDE[captureKindFromStep('selfies-camera', captureTarget)];
      return `Capture Selfie ${g.step} of ${g.total}`;
    }
    case 'body-intro':
      return 'Take Body Shots';
    case 'body-camera': {
      const g = CAPTURE_GUIDE[captureKindFromStep('body-camera', captureTarget)];
      return `Capture Body Shot ${g.step} of ${g.total}`;
    }
    case 'review':
      return 'Review your photos';
  }
}

export type TryOnAvatarOnboardingSheetProps = {
  open: boolean;
  onClose: () => void;
  step: AvatarOnboardingStep;
  captureTarget: 1 | 2;
  captureUploadPreview: string | null;
  selfie1: string | null;
  selfie2: string | null;
  bodyShot1: string | null;
  bodyShot2: string | null;
  onStartSelfies: () => void;
  onStartBody: () => void;
  onUpload: () => void;
  onSelfieCaptureContinue: (photoUrl: string) => void;
  onBodyCaptureContinue: (photoUrl: string) => void;
  onSelfieCameraBack: () => void;
  onBodyCameraBack: () => void;
  onReviewBack: () => void;
  onSave: () => void;
  onRetakeSelfie: (target: 1 | 2) => void;
  onRetakeBody: (target: 1 | 2) => void;
  /** Real-time scenario: device camera instead of simulated shutter. */
  useLiveCamera?: boolean;
};

export function TryOnAvatarOnboardingSheet({
  open,
  onClose,
  step,
  captureTarget,
  captureUploadPreview,
  selfie1,
  selfie2,
  bodyShot1,
  bodyShot2,
  onStartSelfies,
  onStartBody,
  onUpload,
  onSelfieCaptureContinue,
  onBodyCaptureContinue,
  onSelfieCameraBack,
  onBodyCameraBack,
  onReviewBack,
  onSave,
  onRetakeSelfie,
  onRetakeBody,
  useLiveCamera = false,
}: TryOnAvatarOnboardingSheetProps) {
  const isCamera = step === 'selfies-camera' || step === 'body-camera';
  const sheetHeight = onboardingSheetHeight(step);
  const allCapturesReady = Boolean(selfie1 && selfie2 && bodyShot1 && bodyShot2);
  const reviewSrc = (photo: string | null, fallback: string) =>
    photo ?? (useLiveCamera ? '' : fallback);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={sheetTitle(step, captureTarget)}
      showCloseButton
      maxHeight={sheetHeight}
      height={sheetHeight}
      hideHandle={false}
      contentClassName={cn(
        'overflow-hidden',
        isCamera && 'px-0 pb-0',
      )}
    >
      {step === 'selfies-intro' && (
        <div className="flex min-h-0 flex-1 flex-col gap-3 pb-2">
          <p className="m-0 shrink-0 text-[13px] leading-[1.45] text-[#686b77]">
            Capture two face selfies — front and side — to align your features.
          </p>
          <div className="flex min-h-[220px] flex-1 items-center justify-center">
            <OnboardingReferenceStack
              variant="selfie"
              images={SELFIE_INTRO_STACK}
              className="h-[248px] min-h-0 w-full"
            />
          </div>
          <OnboardingIntroNotes notes={SELFIE_INTRO_NOTES} />
          <button
            type="button"
            onClick={onStartSelfies}
            className="h-12 w-full shrink-0 rounded-[12px] bg-[#ff3f6c] text-[16px] font-bold text-white shadow-[0_4px_14px_rgba(255,63,108,0.2)] active:scale-[0.99] hover:bg-[#e6355e]"
          >
            Continue
          </button>
        </div>
      )}

      {step === 'selfies-camera' && (() => {
        const kind = captureKindFromStep('selfies-camera', captureTarget);
        const guide = CAPTURE_GUIDE[kind];
        if (useLiveCamera) {
          return (
            <LiveCaptureView
              embedded
              stepIndex={guide.step}
              stepTotal={guide.total}
              captureLabel={guide.title}
              instruction={guide.instruction}
              variant="selfie"
              uploadedPreview={captureUploadPreview}
              onClose={onSelfieCameraBack}
              onUpload={onUpload}
              onContinue={onSelfieCaptureContinue}
            />
          );
        }
        return (
          <SimulatedCaptureView
            embedded
            src={guide.src}
            stepIndex={guide.step}
            stepTotal={guide.total}
            captureLabel={guide.title}
            instruction={guide.instruction}
            variant="selfie"
            uploadedPreview={captureUploadPreview}
            onBack={onSelfieCameraBack}
            onUpload={onUpload}
            onContinue={onSelfieCaptureContinue}
          />
        );
      })()}

      {step === 'body-intro' && (
        <div className="flex min-h-0 flex-1 flex-col gap-3 pb-2">
          <p className="m-0 shrink-0 text-[13px] leading-[1.45] text-[#686b77]">
            Two full-body shots — front and side — so we can dress your avatar accurately.
          </p>
          <div className="flex min-h-[300px] flex-1 items-center justify-center">
            <OnboardingReferenceStack
              variant="body"
              images={BODY_INTRO_STACK}
              className="h-[320px] min-h-0 w-full"
            />
          </div>
          <OnboardingIntroNotes notes={BODY_INTRO_NOTES} />
          <button
            type="button"
            onClick={onStartBody}
            className="h-12 w-full shrink-0 rounded-[12px] bg-[#ff3f6c] text-[16px] font-bold text-white shadow-[0_4px_14px_rgba(255,63,108,0.2)] active:scale-[0.99] hover:bg-[#e6355e]"
          >
            Continue
          </button>
        </div>
      )}

      {step === 'body-camera' && (() => {
        const kind = captureKindFromStep('body-camera', captureTarget);
        const guide = CAPTURE_GUIDE[kind];
        if (useLiveCamera) {
          return (
            <LiveCaptureView
              embedded
              stepIndex={guide.step}
              stepTotal={guide.total}
              captureLabel={guide.title}
              instruction={guide.instruction}
              variant="body"
              uploadedPreview={captureUploadPreview}
              onClose={onBodyCameraBack}
              onUpload={onUpload}
              onContinue={onBodyCaptureContinue}
            />
          );
        }
        return (
          <SimulatedCaptureView
            embedded
            src={guide.src}
            stepIndex={guide.step}
            stepTotal={guide.total}
            captureLabel={guide.title}
            instruction={guide.instruction}
            variant="body"
            uploadedPreview={captureUploadPreview}
            onBack={onBodyCameraBack}
            onUpload={onUpload}
            onContinue={onBodyCaptureContinue}
          />
        );
      })()}

      {step === 'review' && (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden pb-2">
          <p className="m-0 shrink-0 text-center text-[12px] leading-snug text-[#686b77]">
            Verify all four photos before continuing.
          </p>
          <div className="flex min-h-0 flex-1 flex-col gap-2.5">
            <section className="flex min-h-0 flex-[2] flex-col gap-1">
              <p className="m-0 shrink-0 text-left text-[11px] font-bold uppercase tracking-wider text-[#8d8e96]">
                Selfies
              </p>
              <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
                <ReviewPhotoTile
                  fillCell
                  src={reviewSrc(selfie1, TRYON_ONBOARDING.selfieFront)}
                  label="Normal selfie"
                  onRetake={() => onRetakeSelfie(1)}
                />
                <ReviewPhotoTile
                  fillCell
                  src={reviewSrc(selfie2, TRYON_ONBOARDING.selfieSide)}
                  label="Side selfie"
                  onRetake={() => onRetakeSelfie(2)}
                />
              </div>
            </section>
            <section className="flex min-h-0 flex-[3] flex-col gap-1">
              <p className="m-0 shrink-0 text-left text-[11px] font-bold uppercase tracking-wider text-[#8d8e96]">
                Body shots
              </p>
              <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
                <ReviewPhotoTile
                  fillCell
                  tall
                  src={reviewSrc(bodyShot1, TRYON_ONBOARDING.bodyFront)}
                  label="Front body"
                  onRetake={() => onRetakeBody(1)}
                />
                <ReviewPhotoTile
                  fillCell
                  tall
                  src={reviewSrc(bodyShot2, TRYON_ONBOARDING.bodySide)}
                  label="Side body"
                  onRetake={() => onRetakeBody(2)}
                />
              </div>
            </section>
          </div>
          <div className="flex shrink-0 gap-3 pt-1">
            <button
              type="button"
              onClick={onReviewBack}
              className="h-11 shrink-0 rounded-[12px] border border-border px-5 text-[14px] font-bold text-[#262a39] hover:bg-[#f9f9fa] active:scale-95"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={useLiveCamera && !allCapturesReady}
              className="h-11 min-w-0 flex-1 rounded-[12px] bg-[#ff3f6c] text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(255,63,108,0.2)] active:scale-[0.99] hover:bg-[#e6355e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirm & Try On
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

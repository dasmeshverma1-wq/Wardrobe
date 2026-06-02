import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraIcon, CloseIcon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

const SHUTTER_BTN_SRC = '/assets/80db93f8-1fab-4d96-8dba-754e40bb7d35.svg';

type LiveCaptureViewProps = {
  stepIndex: number;
  stepTotal: number;
  captureLabel: string;
  instruction?: string;
  variant?: 'selfie' | 'body';
  embedded?: boolean;
  onClose?: () => void;
  onUpload: () => void;
  uploadedPreview?: string | null;
  onContinue: (photoUrl: string) => void;
};

export function LiveCaptureView({
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
}: LiveCaptureViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [captured, setCaptured] = useState(false);
  const [flash, setFlash] = useState(false);
  const [shutterBusy, setShutterBusy] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: variant === 'body' ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
        setCameraReady(true);
      }
    } catch {
      setCameraError('Camera access was denied or unavailable. Use gallery upload instead.');
    }
  }, [stopCamera, variant]);

  useEffect(() => {
    if (uploadedPreview) {
      stopCamera();
      setPreviewSrc(uploadedPreview);
      setCaptured(true);
      return;
    }
    setPreviewSrc(null);
    setCaptured(false);
    void startCamera();
    return () => stopCamera();
  }, [uploadedPreview, startCamera, stopCamera, variant, stepIndex]);

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video || !cameraReady) return null;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return null;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    if (variant === 'selfie') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleShutter = () => {
    if (shutterBusy || captured || !cameraReady) return;
    setShutterBusy(true);
    setFlash(true);
    window.setTimeout(() => {
      setFlash(false);
      const frame = captureFrame();
      stopCamera();
      if (frame) {
        setPreviewSrc(frame);
        setCaptured(true);
      } else {
        setCameraError('Could not capture a frame. Try again or upload from gallery.');
      }
      setShutterBusy(false);
    }, 200);
  };

  const isBody = variant === 'body';
  const tips =
    variant === 'body'
      ? ['Full silhouette', 'Even light', 'Hold phone steady']
      : ['Even light', 'Face camera', 'No hats or glasses'];

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col animate-fade-in bg-bg', embedded && 'px-4')}>
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
          'relative min-h-0 flex-1 overflow-hidden bg-[#0f1115]',
          embedded ? 'rounded-2xl border border-[#e9e9eb] shadow-sm' : 'rounded-2xl',
        )}
      >
        {captured && previewSrc ? (
          <img
            src={previewSrc}
            alt=""
            className={cn(
              'absolute inset-0 h-full w-full',
              isBody ? 'object-cover object-top' : 'object-cover object-center',
            )}
          />
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={cn(
              'absolute inset-0 h-full w-full object-cover',
              variant === 'selfie' && 'scale-x-[-1]',
              isBody && 'object-top',
            )}
          />
        )}
        {flash && <div className="absolute inset-0 z-10 rounded-2xl bg-white" aria-hidden />}
        {!captured && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white">
            Live camera
          </span>
        )}
        {cameraError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-6 text-center">
            <p className="m-0 text-[13px] leading-snug text-white">{cameraError}</p>
          </div>
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

        {captured && previewSrc ? (
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
              disabled={shutterBusy || !cameraReady}
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

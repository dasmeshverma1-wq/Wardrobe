import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Default 85vh; half-card uses ~60vh */
  maxHeight?: string;
  /** Fixed height (e.g. half-card) — pairs with maxHeight */
  height?: string;
  showCloseButton?: boolean;
  contentClassName?: string;
  hideHandle?: boolean;
};

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  maxHeight = '85vh',
  height,
  showCloseButton = false,
  contentClassName,
  hideHandle = false,
}: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startYRef.current = touch.clientY;
    isDraggingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!sheetRef.current) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - startYRef.current;

    if (deltaY <= 0) {
      if (isDragging) {
        setDragOffset(0);
        setIsDragging(false);
      }
      return;
    }

    // Check if we are touching a scrollable element that is currently scrolled down
    let target = e.target as HTMLElement | null;
    let isScrolled = false;
    while (target && target !== sheetRef.current) {
      if (target.scrollHeight > target.clientHeight) {
        const style = window.getComputedStyle(target);
        if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && target.scrollTop > 0) {
          isScrolled = true;
          break;
        }
      }
      target = target.parentElement;
    }

    if (isScrolled) {
      return;
    }

    if (e.cancelable) {
      e.preventDefault();
    }

    setIsDragging(true);
    isDraggingRef.current = true;
    setDragOffset(deltaY);
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;

    const sheetHeight = sheetRef.current?.clientHeight || 300;
    const dismissThreshold = Math.min(120, sheetHeight * 0.25);

    if (dragOffset > dismissThreshold) {
      onClose();
    }

    setIsDragging(false);
    isDraggingRef.current = false;
    setDragOffset(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal>
      <div
        className="absolute inset-0 bg-ink/30 transition-opacity duration-150"
        style={{
          opacity: isDragging && sheetRef.current
            ? Math.max(0, 1 - dragOffset / sheetRef.current.clientHeight)
            : undefined,
          animation: isDragging ? 'none' : 'fade-in 0.2s ease-out',
        }}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={cn(
          'relative flex w-full max-w-[440px] flex-col rounded-t-4xl bg-bg shadow-sheet',
          isDragging ? '' : 'animate-sheet-in',
        )}
        style={{
          maxHeight,
          height,
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
          transition: isDragging
            ? 'none'
            : 'transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), height 0.28s cubic-bezier(0.22, 1, 0.36, 1), max-height 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {!hideHandle && (
          <div className="flex w-full shrink-0 justify-center py-2.5 cursor-grab active:cursor-grabbing">
            <div className="h-[4px] w-10 rounded-full bg-ink-ghost/70" />
          </div>
        )}
        {(title || showCloseButton) && (
          <header className="flex shrink-0 items-start justify-between gap-3 px-5 pb-2 pt-2">
            {title ? (
              <h2 className="min-w-0 flex-1 text-[15px] font-bold tracking-tightish text-ink-strong">
                {title}
              </h2>
            ) : (
              <span className="flex-1" />
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="-mr-1 shrink-0 rounded-full p-1.5 text-ink-subtle hover:bg-bg-soft active:scale-95"
                aria-label="Close"
              >
                <CloseIcon size={20} />
              </button>
            )}
          </header>
        )}
        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain px-5 pb-2',
            contentClassName,
          )}
        >
          {children}
        </div>
        {footer && (
          <div className="shrink-0 border-t border-divider bg-bg px-5 pb-[calc(0.5rem+var(--safe-bottom))] pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Standard half-card height for bottom sheets */
export const HALF_SHEET_HEIGHT = '60vh';

/** Try-on onboarding — height per step (shorter when less content is needed). */
export const TRYON_ONBOARDING_INTRO_HEIGHT = '64vh';
export const TRYON_ONBOARDING_BODY_INTRO_HEIGHT = '72vh';
export const TRYON_ONBOARDING_CAMERA_HEIGHT = '68vh';
export const TRYON_ONBOARDING_REVIEW_HEIGHT = '82vh';

/** @deprecated Use step-specific TRYON_ONBOARDING_*_HEIGHT constants */
export const TRYON_ONBOARDING_SHEET_HEIGHT = TRYON_ONBOARDING_REVIEW_HEIGHT;

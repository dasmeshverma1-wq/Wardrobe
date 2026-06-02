import type { ButtonHTMLAttributes } from 'react';
import { StraightArrowLeftIcon } from './Icon';
import { cn } from '@/lib/cn';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  iconSize?: number;
};

/** MDL back control — straight-arrow-left icon only (no circular chrome). */
export function BackButton({
  className,
  iconSize = 24,
  type = 'button',
  'aria-label': ariaLabel = 'Back',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      className={cn(
        '-ml-1 inline-flex shrink-0 items-center justify-center p-1 text-ink-strong',
        'transition-opacity active:opacity-70',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        className,
      )}
      {...rest}
    >
      <StraightArrowLeftIcon size={iconSize} />
    </button>
  );
}

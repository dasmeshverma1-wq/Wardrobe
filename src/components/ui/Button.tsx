import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Fabric Primary Button spec (from pixel-perfect-rules §5):
 *   active:   bg #ff3f6c, text #fff
 *   disabled: bg #f4f4f5, text #bebfc5
 *   both:     h:40, br:12, padX:12, padY:8
 *
 * Sizes follow that as the canonical `md`.  `sm` and `lg` use Fabric's
 * conventional 8/12/16 step on height + padding.
 */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ink';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  // Primary = Fabric Watermelon — disabled bg/text colours are explicit Fabric tokens, NOT opacity.
  primary:
    'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark ' +
    'disabled:bg-bg-disabled disabled:text-ink-ghost disabled:hover:bg-bg-disabled',
  // Secondary = white surface + Grey/300 hairline + Grey/600 text.
  secondary:
    'bg-bg text-ink border border-border hover:bg-neutral-150 ' +
    'disabled:bg-bg-disabled disabled:text-ink-ghost disabled:border-border',
  ghost:
    'bg-transparent text-ink hover:bg-neutral-150 ' +
    'disabled:text-ink-ghost',
  danger:
    'bg-white text-primary border border-primary/30 hover:bg-primary-soft ' +
    'disabled:text-ink-ghost disabled:border-border',
  // Explicit ink-on-white variant for when we deliberately want monochrome (planner header etc.)
  ink:
    'bg-ink text-white hover:bg-ink/90 ' +
    'disabled:bg-bg-disabled disabled:text-ink-ghost',
};

const sizeStyles: Record<Size, string> = {
  // h:40, padX:12, padY:8 from Fabric spec.
  md: 'h-10 px-3 py-2 text-[14px]',
  sm: 'h-8 px-2.5 py-1.5 text-[13px]',
  lg: 'h-12 px-4 py-2.5 text-[15px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold tracking-tightish',
        'rounded-xl transition-colors',
        'disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}

/**
 * @deprecated Kept for source compatibility — `<Button>` is already Fabric primary.
 * Use `<Button variant="primary">` directly.
 */
export const AccentButton = Button;

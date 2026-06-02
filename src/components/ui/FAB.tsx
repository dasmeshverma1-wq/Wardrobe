import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * FAB defaults to the Fabric primary (Watermelon/600).
 * Use `variant="ink"` if the screen already has a Watermelon element competing
 * for attention.
 */
export function FAB({
  icon,
  label,
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label?: string;
  variant?: 'primary' | 'ink';
}) {
  const palette =
    variant === 'ink'
      ? 'bg-ink text-white shadow-pop hover:bg-ink/90'
      : 'bg-primary text-white shadow-fab hover:bg-primary-dark';
  return (
    <button
      {...props}
      aria-label={label}
      className={cn(
        'inline-flex h-12 items-center gap-2 rounded-2xl px-4 text-[14px] font-semibold tracking-tightish transition-transform active:scale-95',
        palette,
        !label && 'w-12 justify-center px-0',
        className,
      )}
    >
      {icon}
      {label}
    </button>
  );
}

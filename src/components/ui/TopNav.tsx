import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from './BackButton';
import { cn } from '@/lib/cn';

type Props = {
  title?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  showBack?: boolean;
  variant?: 'default' | 'transparent';
  borderless?: boolean;
  onBack?: () => void;
  className?: string;
};

export function TopNav({
  title,
  leading,
  trailing,
  showBack,
  variant = 'default',
  borderless,
  onBack,
  className,
}: Props) {
  const navigate = useNavigate();
  return (
    <header
      className={cn(
        'relative flex h-14 shrink-0 items-center gap-2 px-page',
        variant === 'transparent'
          ? 'absolute inset-x-0 top-0 z-20 text-white'
          : 'bg-bg text-ink',
        className,
      )}
    >
      {showBack ? (
        <BackButton
          onClick={() => (onBack ? onBack() : navigate(-1))}
          className={variant === 'transparent' ? 'text-white' : undefined}
        />
      ) : (
        leading
      )}
      <h1 className="flex-1 truncate text-[15px] font-bold tracking-tightish text-ink-strong">{title}</h1>
      <div className="flex items-center gap-1">{trailing}</div>
      {variant === 'default' && !borderless && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-divider" />
      )}
    </header>
  );
}

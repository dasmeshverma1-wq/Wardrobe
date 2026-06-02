import { UserIcon } from './Icon';
import { cn } from '@/lib/cn';

export function ProfileNavButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Settings and preferences"
      className={cn(
        'grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-strong',
        'transition-colors hover:bg-bg-soft active:bg-bg-soft',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        className,
      )}
    >
      <UserIcon size={20} />
    </button>
  );
}

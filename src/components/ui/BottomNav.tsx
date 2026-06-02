import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import {
  CalendarIcon,
  CardsIcon,
  HangerIcon,
  HomeIcon,
  PlusIcon,
} from './Icon';

type NavItem = {
  to: string;
  label: string;
  icon: (p: { size?: number; className?: string }) => ReactNode;
  match: (path: string) => boolean;
};

const items: NavItem[] = [
  {
    to: '/home',
    label: 'Home',
    icon: HomeIcon,
    match: (p) => p === '/home' || p === '/',
  },
  {
    to: '/wardrobe',
    label: 'Closet',
    icon: HangerIcon,
    match: (p) =>
      p.startsWith('/wardrobe') ||
      p.startsWith('/outfit') ||
      p.startsWith('/studio'),
  },
  {
    to: '/planner',
    label: 'Planner',
    icon: CalendarIcon,
    match: (p) => p.startsWith('/planner'),
  },
  {
    to: '/discover',
    label: 'Discover',
    icon: CardsIcon,
    match: (p) => p.startsWith('/discover'),
  },
];

export function BottomNav({
  active,
  onNavigate,
  onCreateOutfit,
}: {
  active: string;
  onNavigate: (to: string) => void;
  onCreateOutfit: () => void;
}) {
  const [home, closet, planner, discover] = items;

  return (
    <div className="shrink-0 bg-bg px-4 pb-[calc(0.75rem+var(--safe-bottom))] pt-2">
      <nav
        role="navigation"
        aria-label="Primary"
        className="mx-auto flex max-w-[400px] items-end rounded-[26px] border border-border-subtle bg-bg px-0.5 py-2"
      >
        <NavTab item={home} active={active} onNavigate={onNavigate} />
        <NavTab item={closet} active={active} onNavigate={onNavigate} />
        <CreateTab onClick={onCreateOutfit} />
        <NavTab item={planner} active={active} onNavigate={onNavigate} />
        <NavTab item={discover} active={active} onNavigate={onNavigate} />
      </nav>
    </div>
  );
}

function NavTab({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: string;
  onNavigate: (to: string) => void;
}) {
  const isActive = item.match(active);
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onNavigate(item.to)}
      aria-label={`${item.label} tab`}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center gap-1 px-0.5 py-1',
        'transition-colors active:opacity-80',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink-strong/15',
      )}
    >
      <span className="flex h-10 items-center justify-center">
        <Icon
          size={22}
          className={cn('shrink-0', isActive ? 'text-ink-strong' : 'text-ink-faint')}
        />
      </span>
      <span
        className={cn(
          'truncate text-center text-[10px] leading-none tracking-widish',
          isActive ? 'font-bold text-ink-strong' : 'font-medium text-ink-faint',
        )}
      >
        {item.label.toUpperCase()}
      </span>
    </button>
  );
}

function CreateTab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Create outfit"
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center gap-1 px-0.5 py-1',
        'transition-transform active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink-strong/15',
      )}
    >
      <span className="flex h-10 items-center justify-center">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-ink-strong text-white shadow-[0_2px_8px_rgba(38,42,57,0.12)]">
          <PlusIcon size={22} strokeWidth={2.25} />
        </span>
      </span>
      <span className="truncate text-center text-[10px] font-medium leading-none tracking-widish text-ink-faint">
        CREATE
      </span>
    </button>
  );
}

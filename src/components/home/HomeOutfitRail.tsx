import { useNavigate } from 'react-router-dom';
import { OutfitCard } from '@/components/wardrobe/OutfitCard';
import { LayersIcon, WandIcon } from '@/components/ui/Icon';
import type { Outfit } from '@/types';
import { cn } from '@/lib/cn';

type Props = {
  title: string;
  subtitle?: string;
  outfits: Outfit[];
  badge?: 'flat-lay' | 'try-on';
  className?: string;
};

/** Width of compact square tiles in home horizontal rails. */
export const HOME_RAIL_CARD_WIDTH = 'w-[8.25rem]';

/**
 * Horizontal outfit rail — same pattern as “Your outfits” on Home.
 */
export function HomeOutfitRail({ title, subtitle, outfits, badge, className }: Props) {
  const navigate = useNavigate();

  if (outfits.length === 0) return null;

  return (
    <section className={cn(className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-bold uppercase tracking-widish text-ink-faint">{title}</h2>
            {badge === 'flat-lay' && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-border-subtle bg-bg-soft px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink-subtle">
                <LayersIcon size={10} />
                Mix
              </span>
            )}
            {badge === 'try-on' && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-accent-aiSoft px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-ai">
                <WandIcon size={10} />
                AI
              </span>
            )}
          </div>
          {subtitle ? (
            <p className="mt-1 text-[12px] leading-snug text-ink-subtle">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="touch-scroll-x -mx-5 mt-2 flex items-start gap-1.5 px-5 py-0.5 no-scrollbar">
        {outfits.map((o) => (
          <div key={o.id} className={cn(HOME_RAIL_CARD_WIDTH, 'shrink-0')}>
            <OutfitCard
              outfit={o}
              size="compact"
              imageAspect="square"
              imageFit="fill"
              imageFocus={badge === 'try-on' ? 'top' : 'center'}
              onClick={() => navigate(`/look/${o.id}`)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

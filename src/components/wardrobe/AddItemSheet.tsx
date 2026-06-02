import { useNavigate } from 'react-router-dom';
import { Sheet } from '@/components/ui/Sheet';
import { BagIcon, HeartIcon, ChevronRightIcon } from '@/components/ui/Icon';

type Method = 'past' | 'wishlist' | 'cart';

const METHODS: { id: Method; label: string; sub: string; icon: typeof BagIcon }[] = [
  { id: 'past', label: 'Past Myntra purchases', sub: '6 items ready to sync', icon: BagIcon },
  { id: 'wishlist', label: 'Wishlist', sub: 'Import saved items', icon: HeartIcon },
  { id: 'cart', label: 'Cart', sub: 'Import items in your bag', icon: BagIcon },
];

export function AddItemSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <Sheet open={open} onClose={onClose} title="Add to wardrobe">
      <ul className="flex flex-col gap-1">
        {METHODS.map((m) => {
          const Icon = m.icon;
          return (
            <li key={m.id}>
              <button
                onClick={() => {
                  onClose();
                  navigate(`/wardrobe/add?tab=${m.id}`);
                }}
                className="flex w-full items-center gap-3 rounded-2xl py-3 px-2 text-left hover:bg-bg-soft"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-border-subtle bg-bg text-ink">
                  <Icon size={20} />
                </span>
                <span className="flex-1">
                  <span className="block text-[14px] font-semibold tracking-tightish text-ink">{m.label}</span>
                  <span className="block text-[12px] text-ink-faint">{m.sub}</span>
                </span>
                <ChevronRightIcon size={18} className="text-ink-faint" />
              </button>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}

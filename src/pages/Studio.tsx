import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button, AccentButton } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { CheckIcon, WandIcon } from '@/components/ui/Icon';
import { DressingRoom, type DressingRoomHandle } from '@/pages/DressingRoom';
import {
  bucketItemsByZone,
  defaultZoneIndex,
  seedZoneIndex,
  activeItemsFromMix,
  type ZoneIndexMap,
} from '@/lib/studioSync';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { useChrome } from '@/store/chromeStore';

type DiscoverMixState = { seedIds: string[] };
type StudioLocationState = { discoverMix?: DiscoverMixState; seedIds?: string[] } | null;

export function Studio() {
  const navigate = useNavigate();
  const isV2 = useChrome((s) => s.wireframeVersion === 'v2');
  const location = useLocation();
  const locationState = location.state as StudioLocationState;

  const items = useWardrobeStore((s) => s.items);
  const selectedIds = useWardrobeStore((s) => s.selectedIds);
  const discoverMix = locationState?.discoverMix;
  const seedIdsFromNav = locationState?.seedIds;

  const zoneItems = useMemo(() => bucketItemsByZone(items), [items]);

  const [zoneIndex, setZoneIndex] = useState<ZoneIndexMap>(defaultZoneIndex);
  const [outfitName, setOutfitName] = useState('');
  const [saving, setSaving] = useState(false);
  const seededRef = useRef(false);

  const mixRef = useRef<DressingRoomHandle>(null);

  useEffect(() => {
    if (seededRef.current || items.length === 0) return;
    const seeds = discoverMix?.seedIds.length
      ? new Set(discoverMix.seedIds)
      : seedIdsFromNav?.length
      ? new Set(seedIdsFromNav)
      : selectedIds.size > 0
      ? selectedIds
      : null;
    if (!seeds?.size) return;
    setZoneIndex(seedZoneIndex(seeds, zoneItems));
    seededRef.current = true;
  }, [discoverMix, seedIdsFromNav, selectedIds, zoneItems, items.length]);

  const onSave = async () => {
    setSaving(true);
    try {
      await mixRef.current?.save();
    } finally {
      setSaving(false);
    }
  };

  const onBack = () => {
    if (isV2) {
      navigate('/home');
      return;
    }
    if (window.history.length > 1) navigate(-1);
    else navigate('/wardrobe');
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-bg">
      <header className="shrink-0 border-b border-divider bg-bg px-page pb-3 pt-3">
        <div className="flex items-center gap-2">
          <BackButton aria-label="Back from studio" onClick={onBack} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widish text-primary">Mix & Match</p>
            <input
              value={outfitName}
              onChange={(e) => setOutfitName(e.target.value)}
              placeholder={`Look · ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`}
              className="mt-0.5 w-full truncate bg-transparent text-[17px] font-bold tracking-tightish text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              size="sm"
              variant="secondary"
              leadingIcon={<WandIcon size={14} />}
              onClick={() => {
                navigate('/studio/try-on', {
                  state: {
                    itemIds: activeItemsFromMix(zoneIndex, zoneItems).map((it) => it.id),
                    title: outfitName.trim() || undefined,
                  },
                });
              }}
            >
              Try on
            </Button>
            <AccentButton
              size="sm"
              onClick={() => void onSave()}
              disabled={saving}
              leadingIcon={<CheckIcon size={15} />}
            >
              {saving ? '…' : 'Save'}
            </AccentButton>
          </div>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-visible bg-bg">
        <div className="absolute inset-0 flex flex-col overflow-visible">
          <DressingRoom
            ref={mixRef}
            embedded
            useFullCloset
            zoneIndex={zoneIndex}
            onZoneIndexChange={setZoneIndex}
            outfitName={outfitName}
            locationState={location.state}
          />
        </div>
      </div>
    </div>
  );
}

export function RedirectToStudio() {
  const location = useLocation();
  return <Navigate to="/studio" replace state={location.state} />;
}

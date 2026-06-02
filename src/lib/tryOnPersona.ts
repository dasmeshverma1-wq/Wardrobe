import { useMemo } from 'react';
import {
  getHomeRailOutfit,
  homeRailToOutfit,
  isHomeRailOutfit,
} from '@/data/homeCreatorRails';
import { WIREFRAME_DEMO_OUTFITS, isWireframeDemoOutfit } from '@/data/wireframeDemoOutfits';
import { TRYON_RETURNING_USER_BODY } from '@/data/tryOnSampleAvatar';
import { useChrome } from '@/store/chromeStore';
import { useOutfitStore } from '@/store/outfitStore';
import { useTryOnStore } from '@/store/tryOnStore';
import type { Outfit } from '@/types';

export type TryOnWireframePersona = 'first-time' | 'has-photos' | 'real-time';

export function isFirstTimeTryOnPersona(persona: TryOnWireframePersona): boolean {
  return persona === 'first-time';
}

export function usesLiveTryOnCamera(persona: TryOnWireframePersona): boolean {
  return persona === 'real-time';
}

export function hasTryOnProfileForPersona(
  persona: TryOnWireframePersona,
  hasStoredAvatar: boolean,
): boolean {
  if (persona === 'first-time') return false;
  if (persona === 'real-time') return hasStoredAvatar;
  return true;
}

export function resolveEffectiveBodyPreview(
  persona: TryOnWireframePersona,
  storedBodyPreview: string | null | undefined,
): string | null {
  if (persona === 'first-time') return null;
  if (persona === 'real-time') return storedBodyPreview ?? null;
  return storedBodyPreview ?? TRYON_RETURNING_USER_BODY;
}

/** Outfits visible in the UI for the current wireframe persona. */
export function getVisibleOutfits(storedOutfits: Outfit[], persona: TryOnWireframePersona): Outfit[] {
  if (persona === 'first-time') return [];
  const sorted = [...storedOutfits].sort((a, b) => {
    const aGen = a.generationStatus === 'generating' ? 1 : 0;
    const bGen = b.generationStatus === 'generating' ? 1 : 0;
    if (aGen !== bGen) return bGen - aGen;
    return b.createdAt - a.createdAt;
  });
  if (persona === 'real-time') return sorted;
  if (sorted.length > 0) return sorted;
  return WIREFRAME_DEMO_OUTFITS;
}

export function resolveOutfitById(
  id: string,
  storedOutfits: Outfit[],
  persona: TryOnWireframePersona,
): Outfit | undefined {
  const stored = storedOutfits.find((o) => o.id === id);
  if (stored) {
    if (persona === 'first-time') return undefined;
    return stored;
  }
  if (persona === 'has-photos') {
    return WIREFRAME_DEMO_OUTFITS.find((o) => o.id === id);
  }
  const rail = getHomeRailOutfit(id);
  if (rail) return homeRailToOutfit(rail);
  return undefined;
}

export { isWireframeDemoOutfit, isHomeRailOutfit };

export function useTryOnPersona() {
  const persona = useChrome((s) => s.tryOnWireframePersona);
  const setPersona = useChrome((s) => s.setTryOnWireframePersona);
  const storedBodyPreview = useTryOnStore((s) => s.fullBodyPreview);
  const hasStoredAvatar = useTryOnStore((s) => Boolean(s.avatar));

  const hasTryOnProfile = hasTryOnProfileForPersona(persona, hasStoredAvatar);
  const effectiveBodyPreview = useMemo(
    () => resolveEffectiveBodyPreview(persona, storedBodyPreview),
    [persona, storedBodyPreview],
  );

  return {
    persona,
    setPersona,
    isFirstTimeUser: isFirstTimeTryOnPersona(persona),
    usesLiveCamera: usesLiveTryOnCamera(persona),
    hasTryOnProfile,
    effectiveBodyPreview,
  };
}

export function useVisibleOutfits(): Outfit[] {
  const storedOutfits = useOutfitStore((s) => s.outfits);
  const persona = useChrome((s) => s.tryOnWireframePersona);
  return useMemo(() => getVisibleOutfits(storedOutfits, persona), [storedOutfits, persona]);
}

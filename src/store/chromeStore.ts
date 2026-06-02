import { create } from 'zustand';

type State = {
  immersive: boolean;
  selecting: boolean;
  wireframeVersion: 'v1' | 'v2';
  /** Wireframe demo: Try-On user scenario (see Settings → Active layout). */
  tryOnWireframePersona: 'first-time' | 'has-photos' | 'real-time';
  setImmersive: (v: boolean) => void;
  setSelecting: (v: boolean) => void;
  setWireframeVersion: (v: 'v1' | 'v2') => void;
  setTryOnWireframePersona: (v: 'first-time' | 'has-photos' | 'real-time') => void;
};

export const useChrome = create<State>((set) => ({
  immersive: false,
  selecting: false,
  wireframeVersion: (localStorage.getItem('myntra-wardrobe/wireframe-version') as 'v1' | 'v2') || 'v2',
  tryOnWireframePersona: (() => {
    const raw = localStorage.getItem('myntra-wardrobe/tryon-wireframe-persona');
    if (raw === 'first-time' || raw === 'has-photos' || raw === 'real-time') return raw;
    return 'has-photos';
  })(),
  setImmersive: (v) => set({ immersive: v }),
  setSelecting: (v) => set({ selecting: v }),
  setWireframeVersion: (v) => {
    localStorage.setItem('myntra-wardrobe/wireframe-version', v);
    set({ wireframeVersion: v });
  },
  setTryOnWireframePersona: (v) => {
    localStorage.setItem('myntra-wardrobe/tryon-wireframe-persona', v);
    set({ tryOnWireframePersona: v });
  },
}));

export function selectHideBottomNav(s: State) {
  return s.immersive || s.selecting;
}

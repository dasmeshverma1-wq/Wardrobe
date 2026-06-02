import { create } from 'zustand';
import { executeTryOnGeneration } from '@/lib/tryOnGeneration';
import { tryOnOutfitName, tryOnOutfitNodesPayload } from '@/lib/tryOnOutfit';
import type { TryOnGarment, TryOnProgress } from '@/lib/tryOnTypes';
import { lsLoad, lsSave, saveImage, loadImage, deleteImage } from '@/lib/storage';
import { uid } from '@/lib/id';
import { useOutfitStore } from '@/store/outfitStore';
import type { WardrobeItem } from '@/types';

const SLICE = 'tryon';

export type TryOnAvatar = {
  fullBodyKey: string;
  selfieKey?: string;
  createdAt: number;
};

type State = {
  avatar: TryOnAvatar | null;
  fullBodyPreview: string | null;
  selfiePreview: string | null;
  lastResultDataUrl: string | null;
  generatingOutfitId: string | null;
  genStage: number;
  genPercent: number;
  generationProgress: TryOnProgress | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setAvatar: (fullBodyDataUrl: string, selfieDataUrl?: string) => Promise<void>;
  clearAvatar: () => Promise<void>;
  setLastResult: (dataUrl: string | null) => void;
  runTryOnGeneration: (input: {
    avatarUrl: string;
    garments: TryOnGarment[];
    wardrobeItems: WardrobeItem[];
    title?: string;
    outfitId?: string;
  }) => Promise<{ outfitId: string; resultUrl: string }>;
};

let generationInFlight: Promise<{ outfitId: string; resultUrl: string }> | null = null;

export const useTryOnStore = create<State>((set, get) => ({
  avatar: null,
  fullBodyPreview: null,
  selfiePreview: null,
  lastResultDataUrl: null,
  generatingOutfitId: null,
  genStage: 1,
  genPercent: 0,
  generationProgress: null,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const avatar = lsLoad<TryOnAvatar | null>(SLICE, null);
    let fullBodyPreview: string | null = null;
    let selfiePreview: string | null = null;
    if (avatar?.fullBodyKey) {
      fullBodyPreview = (await loadImage(avatar.fullBodyKey)) ?? null;
    }
    if (avatar?.selfieKey) {
      selfiePreview = (await loadImage(avatar.selfieKey)) ?? null;
    }
    set({ avatar, fullBodyPreview, selfiePreview, hydrated: true });
  },

  setAvatar: async (fullBodyDataUrl, selfieDataUrl) => {
    const existing = get().avatar;
    if (existing?.fullBodyKey) await deleteImage(existing.fullBodyKey).catch(() => {});
    if (existing?.selfieKey) await deleteImage(existing.selfieKey).catch(() => {});

    const fullBodyKey = await saveImage(uid('tryon_body_'), fullBodyDataUrl);
    const selfieKey = selfieDataUrl ? await saveImage(uid('tryon_face_'), selfieDataUrl) : undefined;
    const avatar: TryOnAvatar = {
      fullBodyKey,
      selfieKey,
      createdAt: Date.now(),
    };
    lsSave(SLICE, avatar);
    set({
      avatar,
      fullBodyPreview: fullBodyDataUrl,
      selfiePreview: selfieDataUrl ?? null,
    });
  },

  clearAvatar: async () => {
    const existing = get().avatar;
    if (existing?.fullBodyKey) await deleteImage(existing.fullBodyKey).catch(() => {});
    if (existing?.selfieKey) await deleteImage(existing.selfieKey).catch(() => {});
    lsSave(SLICE, null);
    set({ avatar: null, fullBodyPreview: null, selfiePreview: null });
  },

  setLastResult: (dataUrl) => set({ lastResultDataUrl: dataUrl }),

  runTryOnGeneration: async (input) => {
    if (generationInFlight) return generationInFlight;

    const outfitId = input.outfitId ?? uid('out_');
    const name = tryOnOutfitName(input.title);
    const nodes = tryOnOutfitNodesPayload(input.garments, input.wardrobeItems);

    const job = (async () => {
      useOutfitStore.getState().saveOutfit({
        id: outfitId,
        name,
        mode: 'try-on',
        nodes,
        thumbnailDataUrl: input.avatarUrl,
        generationStatus: 'generating',
      });

      set({
        generatingOutfitId: outfitId,
        genStage: 1,
        genPercent: 0,
        generationProgress: { step: 0, total: 5, label: 'Starting…' },
      });

      try {
        const resultUrl = await executeTryOnGeneration(
          input.avatarUrl,
          input.garments,
          (ui) => {
            set({
              genStage: ui.stage,
              genPercent: ui.percent,
              generationProgress: ui.progress,
            });
          },
        );

        useOutfitStore.getState().saveOutfit({
          id: outfitId,
          name,
          mode: 'try-on',
          nodes,
          thumbnailDataUrl: resultUrl,
          generationStatus: undefined,
        });

        set({
          generatingOutfitId: null,
          lastResultDataUrl: resultUrl,
          generationProgress: null,
        });

        return { outfitId, resultUrl };
      } catch (err) {
        console.error(err);
        useOutfitStore.getState().saveOutfit({
          id: outfitId,
          name,
          mode: 'try-on',
          nodes,
          thumbnailDataUrl: input.avatarUrl,
          generationStatus: 'failed',
        });
        set({ generatingOutfitId: null, generationProgress: null });
        throw err;
      }
    })();

    generationInFlight = job;
    try {
      return await job;
    } finally {
      generationInFlight = null;
    }
  },
}));

import { generateTryOn } from '@/lib/tryOnCompositor';
import type { TryOnGarment, TryOnProgress } from '@/lib/tryOnTypes';

export type TryOnGenerationUi = {
  stage: number;
  percent: number;
  progress: TryOnProgress;
};

const MIN_GENERATING_MS = 5500;
const STAGE_2_MS = 1600;
const STAGE_3_MS = 4800;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function mapProgressToPercent(p: TryOnProgress, current: number): number {
  const fromStep = Math.round(((p.step + 1) / Math.max(p.total, 1)) * 92);
  return Math.min(92, Math.max(current, fromStep));
}

/**
 * Runs try-on generation; animation stays until the API finishes (min ~5.5s for polish).
 */
export async function executeTryOnGeneration(
  avatarUrl: string,
  garments: TryOnGarment[],
  onUiUpdate: (ui: TryOnGenerationUi) => void,
): Promise<string> {
  const started = Date.now();
  let stage = 1;
  let percent = 8;

  onUiUpdate({
    stage,
    percent,
    progress: { step: 0, total: 5, label: 'Starting…' },
  });

  const stage2 = window.setTimeout(() => {
    stage = Math.max(stage, 2);
    percent = Math.max(percent, 22);
    onUiUpdate({
      stage,
      percent,
      progress: { step: 1, total: 5, label: 'Analyzing your photo…' },
    });
  }, STAGE_2_MS);

  const stage3 = window.setTimeout(() => {
    stage = Math.max(stage, 3);
    percent = Math.max(percent, 38);
    onUiUpdate({
      stage,
      percent,
      progress: { step: 2, total: 5, label: 'Mapping body shape…' },
    });
  }, STAGE_3_MS);

  const crawl = window.setInterval(() => {
    if (percent < 88) {
      percent = Math.min(88, percent + 1);
      onUiUpdate({
        stage,
        percent,
        progress: { step: 3, total: 5, label: 'Draping garments…' },
      });
    }
  }, 420);

  try {
    const url = await generateTryOn(avatarUrl, garments, (p) => {
      percent = mapProgressToPercent(p, percent);
      if (p.step >= 2) stage = Math.max(stage, 3);
      if (p.step >= 3) stage = Math.max(stage, 3);
      onUiUpdate({ stage, percent, progress: p });
    });

    const wait = Math.max(0, MIN_GENERATING_MS - (Date.now() - started));
    if (wait > 0) await delay(wait);

    onUiUpdate({
      stage: 4,
      percent: 100,
      progress: { step: 4, total: 5, label: 'Final render…' },
    });
    await delay(400);
    return url;
  } finally {
    clearTimeout(stage2);
    clearTimeout(stage3);
    clearInterval(crawl);
  }
}

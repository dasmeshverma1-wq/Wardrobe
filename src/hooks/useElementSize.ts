import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Tracks the content-box size of a container via ResizeObserver.
 * Returns `{ width, height }` in CSS pixels (floored).
 */
export function useElementSize(ref: RefObject<HTMLElement | null>): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      if (w > 0 && h > 0) setSize({ width: w, height: h });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return size;
}

function layoutCollageNodes(itemIds: string[], w: number, h: number) {
  const cols = Math.min(3, Math.max(1, Math.ceil(Math.sqrt(itemIds.length))));
  const tile = Math.min(120, w * 0.28, h * 0.22);
  const startX = (w - cols * tile) / 2;
  const startY = h * 0.08;

  return itemIds.map((itemId, i) => ({
    itemId,
    x: startX + (i % cols) * tile + (i % 2 ? 8 : -8),
    y: startY + Math.floor(i / cols) * (tile + 12) + (i % 2 ? -4 : 4),
    w: tile,
    h: tile,
    rotation: 0,
    z: i + 1,
  }));
}

export { layoutCollageNodes };

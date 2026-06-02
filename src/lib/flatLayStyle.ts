import type { CSSProperties } from 'react';

/** Slot geometry for Discover flat-lay cards — x/y are centre anchors (% of card). */
export type FlatLaySlot = {
  x: number;
  y: number;
  size: number;
  rotate?: number;
  z?: number;
};

export function flatLayItemStyle(slot: FlatLaySlot): CSSProperties {
  const rotate = slot.rotate ? ` rotate(${slot.rotate}deg)` : '';
  return {
    position: 'absolute',
    left: `${slot.x}%`,
    top: `${slot.y}%`,
    width: `${slot.size}%`,
    transform: `translate(-50%, -50%)${rotate}`,
    zIndex: slot.z ?? 1,
    objectFit: 'contain',
    pointerEvents: 'none',
    filter: 'drop-shadow(0 14px 20px rgba(38,42,57,0.16))',
  };
}

export function flatLayItemStylePlain(slot: FlatLaySlot): Record<string, string> {
  const rotate = slot.rotate ? ` rotate(${slot.rotate}deg)` : '';
  return {
    position: 'absolute',
    left: `${slot.x}%`,
    top: `${slot.y}%`,
    width: `${slot.size}%`,
    transform: `translate(-50%, -50%)${rotate}`,
    objectFit: 'contain',
    zIndex: String(slot.z ?? 1),
    filter: 'drop-shadow(0 10px 14px rgba(38,42,57,0.12))',
  };
}

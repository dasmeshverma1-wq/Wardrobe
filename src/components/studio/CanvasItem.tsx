import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, TouchEvent as ReactTouchEvent } from 'react';
import { Rnd } from 'react-rnd';
import type { CanvasNode, WardrobeItem } from '@/types';

const MIN_SIZE = 56;
const MAX_SIZE = 420;

type Props = {
  node: CanvasNode;
  item: WardrobeItem;
  selected: boolean;
  onChange: (patch: Partial<CanvasNode>) => void;
  onSelect: () => void;
  onDelete: () => void;
  onRaise: () => void;
  onDragStart?: () => void;
  onDragStop?: () => void;
};

function touchDistance(touches: ReactTouchEvent['touches']) {
  const a = touches[0];
  const b = touches[1];
  if (!a || !b) return 0;
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

export function CanvasItem({
  node,
  item,
  onChange,
  onSelect,
  onDragStart,
  onDragStop,
}: Props) {
  const [pinching, setPinching] = useState(false);
  const [liveSize, setLiveSize] = useState<{ w: number; h: number; x: number; y: number } | null>(null);
  const touchRef = useRef<HTMLDivElement | null>(null);
  const pinchRef = useRef<{
    dist: number;
    w: number;
    h: number;
    x: number;
    y: number;
  } | null>(null);
  const liveRef = useRef<{ w: number; h: number; x: number; y: number } | null>(null);

  const size = liveSize ?? { w: node.w, h: node.h, x: node.x, y: node.y };

  const style = useMemo(
    () => ({
      transform: `rotate(${node.rotation}deg)`,
      zIndex: node.z,
    }),
    [node.rotation, node.z],
  );

  const onTouchStart = (e: ReactTouchEvent) => {
    if (e.touches.length === 2) {
      e.stopPropagation();
      onSelect();
      setPinching(true);
      onDragStart?.();
      pinchRef.current = {
        dist: touchDistance(e.touches),
        w: node.w,
        h: node.h,
        x: node.x,
        y: node.y,
      };
      liveRef.current = { w: node.w, h: node.h, x: node.x, y: node.y };
      setLiveSize(liveRef.current);
    } else if (e.touches.length === 1) {
      onSelect();
    }
  };

  const endPinch = () => {
    if (!pinchRef.current) return;
    const final = liveRef.current;
    if (final) onChange({ w: final.w, h: final.h, x: final.x, y: final.y });
    pinchRef.current = null;
    liveRef.current = null;
    setLiveSize(null);
    setPinching(false);
    onDragStop?.();
  };

  const onTouchEnd = (e: ReactTouchEvent) => {
    if (e.touches.length >= 2) return;
    if (pinchRef.current) endPinch();
  };

  useEffect(() => {
    const el = touchRef.current;
    if (!el) return;
    const onMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinchRef.current) return;
      e.preventDefault();
      const a = e.touches[0];
      const b = e.touches[1];
      if (!a || !b) return;
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const base = pinchRef.current;
      const ratio = base.h / base.w;
      const scale = dist / base.dist;
      const nextW = Math.min(MAX_SIZE, Math.max(MIN_SIZE, base.w * scale));
      const nextH = nextW * ratio;
      const cx = base.x + base.w / 2;
      const cy = base.y + base.h / 2;
      const next = { w: nextW, h: nextH, x: cx - nextW / 2, y: cy - nextH / 2 };
      liveRef.current = next;
      setLiveSize(next);
    };
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => el.removeEventListener('touchmove', onMove);
  }, []);

  return (
    <Rnd
      bounds="parent"
      size={{ width: size.w, height: size.h }}
      position={{ x: size.x, y: size.y }}
      disableDragging={pinching}
      enableResizing={false}
      lockAspectRatio
      onDragStart={() => onDragStart?.()}
      onDragStop={(_, d) => {
        onChange({ x: d.x, y: d.y });
        onDragStop?.();
      }}
      style={style}
      onPointerDown={(e: ReactPointerEvent) => {
        if (pinching) return;
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        ref={touchRef}
        className="relative h-full w-full touch-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <img
          src={item.thumbnailDataUrl}
          alt={item.name ?? item.category}
          className="pointer-events-none h-full w-full object-contain select-none"
          draggable={false}
        />
      </div>
    </Rnd>
  );
}

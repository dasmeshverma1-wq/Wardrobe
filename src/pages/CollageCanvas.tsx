import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CanvasNode } from '@/types';
import { TopNav } from '@/components/ui/TopNav';
import { Button, AccentButton } from '@/components/ui/Button';
import { CheckIcon, CloseIcon, UndoIcon } from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/ui/Modal';
import { CanvasItem } from '@/components/studio/CanvasItem';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { useOutfitStore } from '@/store/outfitStore';
import { captureElement } from '@/lib/share';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { track } from '@/lib/telemetry';
import { useElementSize, layoutCollageNodes } from '@/hooks/useElementSize';
import { STUDIO_BACKGROUNDS, type StudioBackground } from '@/data/studioBackgrounds';

const UNDO_LIMIT = 25;

export type CollageCanvasHandle = {
  save: () => Promise<void>;
  undo: () => void;
};

type CollageCanvasProps = {
  embedded?: boolean;
  nodes?: CanvasNode[];
  onNodesChange?: Dispatch<SetStateAction<CanvasNode[]>>;
  background?: StudioBackground;
  onBackgroundChange?: (bg: StudioBackground) => void;
  outfitName?: string;
  onUndoStateChange?: (canUndo: boolean) => void;
};

export const CollageCanvas = forwardRef<CollageCanvasHandle, CollageCanvasProps>(function CollageCanvas(
  {
    embedded = false,
    nodes: controlledNodes,
    onNodesChange,
    background: controlledBg,
    onBackgroundChange,
    outfitName,
    onUndoStateChange,
  },
  ref,
) {
  const navigate = useNavigate();
  const items = useWardrobeStore((s) => s.items);
  const selectedIds = useWardrobeStore((s) => s.selectedIds);
  const clearSelection = useWardrobeStore((s) => s.clearSelection);
  const saveOutfit = useOutfitStore((s) => s.saveOutfit);

  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const { width: canvasW, height: canvasH } = useElementSize(canvasWrapRef);

  const isControlled = controlledNodes !== undefined && onNodesChange !== undefined;
  const useStudioFrame = embedded && isControlled;

  const selectedKey = useMemo(() => Array.from(selectedIds).sort().join(','), [selectedIds]);

  const initialNodes = useMemo<CanvasNode[]>(() => {
    if (isControlled) return controlledNodes ?? [];
    if (canvasW < 1 || canvasH < 1) return [];
    const idArr = Array.from(selectedIds).slice(0, 12);
    return layoutCollageNodes(idArr, canvasW, canvasH);
  }, [isControlled, controlledNodes, selectedKey, selectedIds, canvasW, canvasH]);

  const [internalNodes, setInternalNodes] = useState<CanvasNode[]>(initialNodes);
  const nodes = isControlled ? controlledNodes! : internalNodes;

  const setNodes = useCallback(
    (recipe: CanvasNode[] | ((prev: CanvasNode[]) => CanvasNode[])) => {
      if (isControlled) {
        onNodesChange!(recipe);
      } else {
        setInternalNodes(recipe);
      }
    },
    [isControlled, onNodesChange],
  );

  const [internalBg, setInternalBg] = useState<StudioBackground>(STUDIO_BACKGROUNDS[0]);
  const bg = controlledBg ?? internalBg;
  const setBg = onBackgroundChange ?? setInternalBg;

  const [internalName, setInternalName] = useState('');
  const name = outfitName ?? internalName;
  const setName = setInternalName;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [askDiscard, setAskDiscard] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  const undoStack = useRef<CanvasNode[][]>([]);

  const pushHistory = useCallback(
    (prev: CanvasNode[]) => {
      undoStack.current.push(prev);
      if (undoStack.current.length > UNDO_LIMIT) undoStack.current.shift();
      setCanUndo(true);
      onUndoStateChange?.(true);
    },
    [onUndoStateChange],
  );

  useEffect(() => {
    if (isControlled) return;
    setNodes(initialNodes);
    undoStack.current = [];
    setCanUndo(false);
    onUndoStateChange?.(false);
    setActiveId(null);
  }, [initialNodes, isControlled, onUndoStateChange, setNodes]);

  const commit = useCallback(
    (recipe: (prev: CanvasNode[]) => CanvasNode[]) => {
      setNodes((prev) => {
        const next = recipe(prev);
        pushHistory(prev);
        return next;
      });
    },
    [pushHistory, setNodes],
  );

  const undo = useCallback(() => {
    const last = undoStack.current.pop();
    if (last) {
      setNodes(last);
      const nextCanUndo = undoStack.current.length > 0;
      setCanUndo(nextCanUndo);
      onUndoStateChange?.(nextCanUndo);
    }
  }, [onUndoStateChange, setNodes]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === 'z') {
        e.preventDefault();
        undo();
      }
      if (k === 'delete' || k === 'backspace') {
        if (activeId) {
          e.preventDefault();
          commit((prev) => prev.filter((n) => n.itemId !== activeId));
          setActiveId(null);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeId, commit, undo]);

  const isEmpty = !embedded && selectedIds.size === 0;
  const lookup = new Map(items.map((it) => [it.id, it]));

  const updateNode = (itemId: string, patch: Partial<CanvasNode>) => {
    commit((prev) => prev.map((n) => (n.itemId === itemId ? { ...n, ...patch } : n)));
  };
  const raiseNode = (itemId: string) => {
    commit((prev) => {
      const maxZ = Math.max(0, ...prev.map((n) => n.z));
      return prev.map((n) => (n.itemId === itemId ? { ...n, z: maxZ + 1 } : n));
    });
  };
  const removeNode = (itemId: string) => {
    commit((prev) => prev.filter((n) => n.itemId !== itemId));
    if (activeId === itemId) setActiveId(null);
  };

  const onSave = async () => {
    if (nodes.length === 0) {
      toast('Add at least one item to save', 'warning');
      return;
    }
    setSaving(true);
    try {
      setActiveId(null);
      await new Promise((r) => setTimeout(r, 50));
      const el = canvasRef.current;
      const thumb = el ? await captureElement(el, 2) : '';
      const outfit = saveOutfit({
        name: name.trim() || undefined,
        mode: 'collage',
        nodes,
        thumbnailDataUrl: thumb,
        background: bg.value,
      });
      track('outfit_saved', { mode: 'collage', items: nodes.length });
      clearSelection();
      navigate(`/outfit/${outfit.id}?celebrate=1`, { replace: true });
    } catch (err) {
      console.error(err);
      toast('Could not save outfit', 'warning');
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({ save: onSave, undo }), [onSave, undo]);

  const isDark = bg.value === '#0F1115';
  const inkColor = isDark ? '#FFFFFF' : '#0F1115';
  const activeItem = activeId ? lookup.get(activeId) : undefined;

  const frameReady = useStudioFrame || (canvasW > 0 && canvasH > 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {!embedded && (
        <TopNav
          title={
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Look · ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`}
              className="h-9 w-full rounded-lg bg-transparent px-1 text-[14px] font-semibold tracking-tightish text-ink placeholder:text-ink-faint focus:outline-none"
            />
          }
          showBack
          onBack={() => setAskDiscard(true)}
          borderless
          trailing={
            <>
              <button
                onClick={undo}
                disabled={!canUndo}
                aria-label="Undo"
                className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-bg-soft disabled:opacity-40"
              >
                <UndoIcon size={18} />
              </button>
              <AccentButton size="sm" onClick={onSave} disabled={saving} leadingIcon={<CheckIcon size={16} />}>
                {saving ? 'Saving…' : 'Save'}
              </AccentButton>
            </>
          }
        />
      )}

      {isEmpty ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm text-ink-subtle">No items selected. Pick a few from your closet first.</p>
          <Button onClick={() => navigate('/wardrobe')}>Back to wardrobe</Button>
        </div>
      ) : (
        <>
          <div className={cn('flex min-h-0 flex-1 flex-col', !embedded && 'page-x pb-2 pt-1')}>
            <div className={cn('flex min-h-0 flex-1', !embedded && 'items-center justify-center')}>
              <div
                ref={canvasWrapRef}
                className={cn(
                  'relative overflow-hidden',
                  useStudioFrame ? 'h-full w-full' : 'min-h-0 h-full max-h-full w-full flex-1',
                )}
                onPointerDown={(e) => {
                  if (e.target === e.currentTarget || e.target === canvasRef.current) {
                    setActiveId(null);
                  }
                }}
              >
                {frameReady && (
                  <div
                    ref={canvasRef}
                    className={cn(
                      'overflow-hidden',
                      useStudioFrame ? 'absolute inset-0' : 'absolute inset-0 studio-frame',
                    )}
                    style={{ backgroundColor: bg.value }}
                    onPointerDown={() => setActiveId(null)}
                  >
                    {nodes.map((n) => {
                      const it = lookup.get(n.itemId);
                      if (!it) return null;
                      return (
                        <CanvasItem
                          key={n.itemId}
                          node={n}
                          item={it}
                          selected={activeId === n.itemId}
                          onChange={(patch) => updateNode(n.itemId, patch)}
                          onSelect={() => setActiveId(n.itemId)}
                          onDelete={() => removeNode(n.itemId)}
                          onRaise={() => raiseNode(n.itemId)}
                          onDragStart={() => setDraggingId(n.itemId)}
                          onDragStop={() => setDraggingId(null)}
                        />
                      );
                    })}
                    {nodes.length === 0 && embedded && (
                      <div className="pointer-events-none absolute inset-0 grid place-items-center p-8 text-center opacity-40">
                        <p className="text-[12px] text-ink-faint">Tap + to add pieces</p>
                      </div>
                    )}
                    {embedded && draggingId && activeItem && (
                      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30">
                        <div className="mx-auto max-w-[240px] truncate rounded-full bg-ink/75 px-3 py-1.5 text-center text-[11px] font-semibold text-white backdrop-blur-sm">
                          {activeItem.brand ?? activeItem.name ?? 'Selected'}
                        </div>
                      </div>
                    )}
                    <div
                      className="pointer-events-none absolute bottom-3 left-4 text-[9px] font-semibold uppercase tracking-widish"
                      style={{ color: inkColor, opacity: 0.45 }}
                    >
                      Made on Myntra Wardrobe
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!embedded && (
              <div className="mt-2 shrink-0 space-y-2">
                {activeItem && (
                  <div className="flex items-center justify-between gap-2 rounded-2xl border border-border-subtle bg-bg px-3 py-2">
                    <span className="min-w-0 truncate text-[12px] font-semibold text-ink">
                      {activeItem.brand ?? activeItem.name ?? 'Selected'}
                    </span>
                    <button
                      onClick={() => setActiveId(null)}
                      aria-label="Deselect layer"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-neutral-150"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </div>
                )}

                <div>
                  <p className="section-label mb-1.5 px-1">Background</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                    {STUDIO_BACKGROUNDS.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setBg(b)}
                        aria-label={`${b.label} background`}
                        aria-pressed={bg.id === b.id}
                        className="flex shrink-0 flex-col items-center gap-1 rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      >
                        <span
                          className={cn(
                            'h-8 w-8 rounded-full ring-1 transition-all',
                            bg.id === b.id ? 'scale-105 ring-2 ring-ink-strong' : 'ring-1 ring-border',
                          )}
                          style={{ backgroundColor: b.value }}
                        />
                        <span
                          className={cn(
                            'text-[9px] tracking-tightish',
                            bg.id === b.id ? 'font-bold text-primary' : 'text-ink-faint',
                          )}
                        >
                          {b.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <p className="px-1 text-center text-[10px] leading-snug text-ink-faint">
                  Hold and drag to move · pinch to resize
                </p>
              </div>
            )}
          </div>

          {!embedded && (
            <ConfirmDialog
              open={askDiscard}
              title="Discard this collage?"
              body="Your changes won't be saved."
              confirmLabel="Discard"
              destructive
              onCancel={() => setAskDiscard(false)}
              onConfirm={() => {
                setAskDiscard(false);
                clearSelection();
                navigate('/wardrobe', { replace: true });
              }}
            />
          )}
        </>
      )}
    </div>
  );
});

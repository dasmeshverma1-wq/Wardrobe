# Mix and Match (`/studio/dressing-room`)

> Override file. Inherits from `MASTER.md`.

## Purpose
Interactive try-on canvas. User selects items from the closet, then swipes
across body zones to cycle through items in each category and saves the
resulting composition.

## Style
**Tactile Digital + Micro-interactions.** Every gesture should have visible
feedback (translate + rotate during drag, position dots, springback).

## Layout
- TopNav: `Mix and Match` title + Save trailing
- Canvas: 300×520, mannequin silhouette + 5 zones
- Helper copy: "Swipe left or right on a zone to cycle…"
- ConfirmDialog: discard guard

## Tier-A polish targets
- [ ] Add subtle haptic vibration on commit (Vibration API, fallback no-op)
- [ ] Position dots: ensure adequate contrast on cream/ink-tinted zones
- [ ] Empty zones: `aria-label` describing the missing category
- [ ] Chevrons on each zone: `aria-label="Previous {category}"` / `Next {category}"`
- [ ] During drag: announce position to screen readers (`aria-live="polite"` on status pill)
- [ ] Add a tiny "1 of 3" pill that appears on swipe and fades

## Anti-patterns
- ❌ Don't bring back the tray + drag-and-drop pattern
- ❌ Don't auto-rotate to the next item (no auto-play)
- ❌ Don't snap items in/out with abrupt 0ms transitions — always 220ms cubic

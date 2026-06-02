# Collage Canvas (`/studio/collage`)

> Override file. Inherits from `MASTER.md`. **Tier B — needs a refresh.**

## Purpose
Power-user freeform moodboard. Drag, rotate, layer items into a styled
composition. Save → goes to Outfits.

## Target style
**Bento + Brutalist tool palette.** The canvas is the focus; tools live in a
strong, geometric tool palette.

## Layout
- TopNav: `Save` trailing
- Tool palette: top-row row of utility chips (Background, Layer, Rotate, Delete, Undo)
- Canvas: full remaining height, `bg-bg-canvas`, hairline border
- Items: `react-rnd` instances with corner handles
- Sticky bottom: tray of unplaced items (similar to old Mix-and-Match tray, but here it's correct because Collage is freeform)

## Tier-B refresh targets
- [ ] Tool palette redesign: ink-bordered chunky pills, group by function
- [ ] Active layer indicator
- [ ] Undo stack visible (small history pill with count)
- [ ] Snap-to-grid feedback (subtle dotted overlay during drag)
- [ ] Selected item: clearer outline + corner handles
- [ ] Save dialogue: name input + thumbnail preview

## Anti-patterns
- ❌ Don't drop the tray (Collage's freeform model needs it)
- ❌ Don't auto-arrange items (Mix-and-Match is for that)
- ❌ Don't allow infinite undo without bounding (risk of memory bloat — keep at 30)

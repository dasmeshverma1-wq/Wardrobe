# Wardrobe Home (`/wardrobe`)

> Override file. Inherits from `MASTER.md` except where noted.

## Purpose
Daily entry point. Shows item count, today's outfit, the closet, saved outfits,
and curated sets. Most-visited screen — has to feel calm and quick.

## Style
**Soft UI Evolution + Bento** — quiet hairlines, no hard shadows, generous
whitespace. The closet grid is the hero; everything else stays out of its way.

## Layout
1. TopNav: `Wardrobe` title + UserIcon (Settings) trailing
2. Hero summary row: `28px font-bold` count + outfit count
3. QuotaBanner (only when storage is constrained)
4. TodayCard — pulsing primary if empty, image-card if planned
5. Sticky chrome (top:0): segmented Tabs (Closet / Outfits / Sets) + search + filter cog + Select toggle
6. Category pill row (closet only)
7. Content grid (2-col closet, 2-col outfits, 2-col collections)
8. FAB (`bottom-20 right-4`) — context-aware label
9. SelectionBar — replaces FAB when items selected

## Tier-A polish targets
- [ ] Tabs: ensure underline variant has visible focus ring
- [ ] Search input: visible focus ring (currently `focus:ring-1 ring-ink/15` — add `focus:ring-2 ring-primary/30`)
- [ ] Filter button: `aria-pressed` to communicate active state to AT
- [ ] ItemCard: `aria-label` describing item name + category for screen readers
- [ ] OutfitCard: same a11y pass
- [ ] CollectionCard: same a11y pass
- [ ] All grid containers respect `pb-28` so last row clears the bottom nav
- [ ] Tap-state on Today card: `active:scale-[0.99]`
- [ ] Empty states for Outfits and Sets: pulsing-halo `EmptyState`, primary CTA

## Anti-patterns
- Don't add hover effects that move/grow the card on touch devices
- Don't show a search input on the Outfits/Sets tabs (closet-only)
- Don't let the sticky chrome scroll with content (it must stay pinned)

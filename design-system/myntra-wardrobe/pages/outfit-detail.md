# Outfit Detail (`/outfit/:id`)

> Override file. Inherits from `MASTER.md`. **Tier B — needs a real refresh.**

## Purpose
View a saved outfit. Edit name, share, plan, or delete. Eventually shop the
items.

## Target style
**Soft UI Evolution + Editorial title.** Big serif outfit name (using `font-display` is OK on this single screen — but only the title), big hero image, item carousel beneath, action row pinned at the bottom.

## Layout (target)
- TopNav with `Back` / outfit name (editable) / Share trailing
- Hero: full-bleed outfit image, `aspect-[4/5]` or `flex-1`
- Below image: editorial title row (name + occasion tag + Plan-this-day chip)
- Item carousel: horizontal strip of constituent items (each tappable to deep-link to closet)
- Sticky action row: `Edit` · `Plan` · `Bag` · `Delete`

## Tier-B refresh targets
- [ ] Make the outfit name editable inline (already supported) — polish the input typography
- [ ] Add an item carousel under the hero showing the items used
- [ ] Add a "Plan this day" quick action that opens the planner sheet
- [ ] Polish share flow (Web Share API + fallback)
- [ ] Empty/error states (deleted item references)
- [ ] Confirm-delete dialog already exists — match new spec

## Anti-patterns
- ❌ Don't lock editing behind a separate screen
- ❌ Don't show the Discover gradient — this is a Fabric Soft UI surface

# Planner — Week & Month (`/planner`, `/planner/month`)

> Override file. Inherits from `MASTER.md`.

## Purpose
Glance-able outfit planning surfaces. **No-scroll** is a hard requirement for
both views — the user should see the entire week (or month) at once.

## Style
**Editorial Minimal + Bento.** The week page leans into a big outfit hero;
the month page leans editorial with a giant `MMMM` headline.

## Vertical budget (visible viewport ≈ 720dvh)
**Week view:**
- TopNav 56 / Weather row 36 / WeekNav 40 / DayStrip 70 / Outfit panel `flex-1` / BottomNav 70

**Month view:**
- TopNav 56 / Editorial header 80 / Weather strip 32 / Day-of-week row 16 / Calendar grid `flex-1` / Look-of-month 64 / BottomNav 70

## Tier-A polish targets
**Week:**
- [ ] WeekNav chevrons: `focus-visible:ring-2 ring-primary/30`
- [ ] DayStrip cells: focus rings + `aria-current="date"` on selected
- [ ] Outfit panel image: `loading="lazy"` (it's not above the fold once the user navigates between days)
- [ ] Empty-day card CTAs: primary + secondary stack with `gap-2`
- [ ] Action row icons each have `aria-label`

**Month:**
- [ ] Calendar cells: focus rings + `aria-pressed` for selected
- [ ] Editorial header: BIG month name has `tracking-tightish leading-[0.9]`
- [ ] Look-of-the-month card: ≥44px touch target on the entire row
- [ ] Empty look-of-month state: handle "no entries this month" gracefully

## Anti-patterns
- ❌ No vertical scroll on either view — `flex-1 overflow-hidden` everywhere
- ❌ No `aspect-[3/4]` on calendar cells (use `grid-auto-rows: 1fr`)
- ❌ Don't show the redundant stats card (days planned · unique looks · avg max · coverage) — already removed

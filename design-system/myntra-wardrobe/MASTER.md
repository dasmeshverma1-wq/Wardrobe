# Myntra Wardrobe — Design System (MASTER)

> **LOGIC:** When building a specific page, first read `pages/[page-name].md`.
> If that file exists, its rules **override** this Master. Otherwise follow this file.
>
> This Master fuses the **Myntra Fabric** brand identity with recommendations from
> the `ui-ux-pro-max` skill (v2.0). Where the skill suggests generic colors or
> styles that conflict with the Fabric brand, the Fabric tokens win.

---

**Project:** Myntra Wardrobe
**Category:** Fashion · Lifestyle · Mobile-first
**Stack:** React 18 + Vite + TypeScript + Tailwind CSS + Zustand
**Generated:** 2026-05-29

---

## 1. Brand Identity (Myntra Fabric)

The app uses Myntra's **Fabric** design system as its primary identity. This is
non-negotiable for consistency with the parent product. Anywhere in the app
Fabric tokens diverge from the skill's defaults, **Fabric wins**.

| Role | Hex | Tailwind | Where to use |
|---|---|---|---|
| **Primary** (Watermelon/600) | `#FF3F6C` | `bg-primary text-primary` | All primary CTAs, brand badges, key callouts |
| **Primary dark** (Watermelon/700) | `#E5345F` | `bg-primary-dark` | Hover/pressed primary states |
| **Primary soft** (Watermelon/100) | `#FFEBF0` | `bg-primary-soft` | Tinted backgrounds, selected day cells |
| **Ink strong** (Grey/900) | `#0B021C` | `text-ink-strong bg-ink-strong` | Headlines, active tab labels, underline indicators |
| **Ink** (Grey/800) | `#262A39` | `text-ink bg-ink` | Body text, dark fills, category tile wells |
| **Ink subtle** (Grey/600) | `#686B77` | `text-ink-subtle` | Secondary text |
| **Ink faint** (Grey/500) | `#93959E` | `text-ink-faint` | Tertiary text, captions |
| **Ink ghost** (Grey/400) | `#BEBFC5` | `text-ink-ghost` | Placeholders, disabled text |
| **Border** (Grey/300) | `#D4D5D8` | `border-border` | Hairlines, input outlines |
| **Border subtle** | `rgba(11,2,28,0.2)` | `border-border-subtle` | Product cards, tiles |
| **Divider** (Grey/200) | `#E9E9EB` | `bg-divider border-divider` | Section separators |
| **Bg canvas** (Neutral/150) | `#F9F9FA` | `bg-bg-canvas` | Image wells / empty placeholders only — not page chrome |
| **Lilac AI accent** | `#6E5DC6` | `text-accent-ai bg-accent-ai` | AI affordances, secondary brand accent |
| **Mint** | `#04A77B` | `text-accent-mint` | Success / "live" indicators |
| **Gold** | `#C77A1A` | `text-accent-gold` | Warning / "sample" indicators |

### Discover-only accent system (intentional brand break)

`Discover` is a "magazine break" surface that intentionally departs from Fabric
clean-utility into editorial energy. It uses the **Watermelon → Lilac**
gradient as its signature accent.

| Token | Hex | Class | Usage |
|---|---|---|---|
| Cream surface | `#FCF6EE` | `surface-cream` | Page background |
| Paper surface | `#F0E8D2` | `surface-paper` | Card interiors |
| Discover gradient | `#FF3F6C → #B25BD6 → #6E5DC6` | `bg-discover-gradient` | Hero CTAs, stamps |

---

## 2. Typography

| Family | Stack | Tailwind | Usage |
|---|---|---|---|
| **Figtree** | `font-sans` | `font-sans` | All body, UI labels, headings (default) |
| **Fraunces** | `font-display` | `font-display` / `editorial-display` | Discover surface only — magazine headlines, drag stamps |

### Type scale (mobile)

| Token | Size | Weight | Usage |
|---|---|---|---|
| Display XL | `44px` | `900` | Editorial month name (e.g., "May") |
| Display L | `34px` | `900` | Discover hero "That's a wrap" |
| Display M | `26px` | `900` | Discover card titles, hero card titles |
| Title L | `28px` | `700` | Onboarding hero, hero counts |
| Title M | `20px` | `700` | Section headers, sheet titles |
| Title S | `15-17px` | `700` | Card titles |
| Body | `13-14px` | `500-600` | Content text |
| Caption | `11-12px` | `500-600` | Secondary text, dates |
| Eyebrow | `10-11px` | `700-800` | UPPERCASE TRACKED-OUT labels |

**Tracking:** `tracking-tightish` (-0.01em) for headlines, `tracking-widish`
(+0.04em) for ALL CAPS eyebrows.

---

## 3. Spacing (4-px base)

Use Tailwind defaults; semantically:

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Tight icon gaps |
| `space-2` | 8px | Inline spacing |
| `space-3` | 12px | Compact card padding |
| `space-4` | 16px | Standard padding |
| `space-5` | 20px | Page edge padding |
| `space-6` | 24px | Section padding |
| `space-8` | 32px | Section margin |
| `space-12` | 48px | Hero / scene padding |

---

## 4. Border radius

| Token | Value | Usage |
|---|---|---|
| `rounded-md` | 8px | Small chips |
| `rounded-xl` | 12px | Buttons (Fabric) |
| `rounded-2xl` | 16px | Pills, cards (Fabric) |
| `rounded-3xl` | 20px | Hero cards |
| `rounded-4xl` | 24px | Sheets, modals (Fabric) |

---

## 5. Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-card` | `0 0 0 1px rgba(11,2,28,0.06)` | Quiet bordered cards (prefer `border-border-subtle` first) |
| `shadow-search` | `0 2px 24px rgba(36,38,172,0.08)` | Search pill elevation |
| `shadow-pop` | `0 8px 24px rgba(38,42,57,.08)` | Modals, sheets, floating action bars |
| `shadow-fab` | `0 4px 12px rgba(255,63,108,.22)` | FABs, hero CTAs |
| `shadow-sheet` | `0 -1px 0, 0 -8px 32px` | Bottom sheet drop shadow |

For Discover stickers, use **hard-offset ink shadow**: `shadow-[2px_3px_0_rgba(38,42,57,.22)]`.

---

## 6. Motion

- **All transitions:** 150–300ms, `cubic-bezier(0.22, 1, 0.36, 1)`
- **Page changes:** No global page transitions; mobile-shell stays static
- **Sheets:** `animate-sheet-in` (220ms slide-up + fade)
- **Toasts:** `animate-rise-in` (240ms)
- **Drag/swipe:** `transition-transform 220ms` on release; `none` while dragging
- **Pulses:** 2.8s / 3.4s `ease-in-out infinite` on empty-state halos
- **Reduced motion:** All decorative animations must respect `prefers-reduced-motion`

---

## 7. Per-screen style assignments

Distinct visual identities, anchored on Fabric:

| Screen | Style | Notes |
|---|---|---|
| WardrobeHome | **Soft UI Evolution + Bento** | Quiet cards, soft hairlines, tabbed segments |
| PlannerWeek | **Editorial Minimal + Bento** | Big day strip, hero outfit panel |
| PlannerMonth | **Editorial Minimal** | Big "May" / "2026" + calendar grid |
| **Discover** | **Editorial Magazine + Y2K stickers** | INTENTIONAL BREAK — Fraunces serif, paper texture, ink hairlines, Watermelon→Lilac gradient |
| Mix and Match | **Tactile Digital / Micro-interactions** | Swipe-to-cycle on body zones, position dots, gentle springback |
| Collage Canvas | **Bento + Brutalist tool palette** | Large drop targets, clear layer hierarchy |
| OutfitDetail | **Soft UI Evolution + Editorial title** | Big serif name, item carousel, action row |
| Onboarding | **Hero-Centric Storytelling** | Tall illustration on top, copy below, single primary CTA |
| AddItem | **Flat Utility** | Source picker → preview → categorize, fast paths |
| Sheets/Modals | **Soft UI Evolution** | rounded-3xl/4xl, drag handle, sticky footer CTAs |

---

## 8. Pre-delivery checklist

Run through this for **every** screen before merging:

- [ ] No emojis as icons — use the existing `Icon.tsx` SVG set
- [ ] All clickable elements have hover transition (150–300ms)
- [ ] Visible focus rings (`focus-visible:ring-2 ring-primary/30` on buttons; `ring-2 ring-primary` on tappable cards)
- [ ] Touch targets ≥ 44×44 (icon-only buttons use `h-10 w-10` minimum)
- [ ] Text contrast ≥ 4.5:1 in light mode
- [ ] No layout-shifting hover (avoid `scale-110` etc.; prefer `active:scale-[0.98]`)
- [ ] `prefers-reduced-motion` respected (decorative-only animations conditional)
- [ ] No horizontal scroll at 375px
- [ ] No content hidden behind the fixed bottom nav (use `pb-28` on scroll containers)
- [ ] All icon-only buttons have `aria-label`
- [ ] Empty states are intentional (not blank space)
- [ ] Loading and disabled states are styled
- [ ] Tap-states (`active:scale-[0.96..0.98]`) on every primary action

---

## 9. Anti-patterns (do NOT use)

- ❌ Generic AI purple/pink gradient backdrops (the skill's warning) — our gradient is Watermelon→Lilac as a **deliberate brand accent**, used sparingly on Discover only, never as a default page background elsewhere
- ❌ Drop shadows on text
- ❌ Glassmorphism on Closet/Planner (reserved for surfaces explicitly using `surface-cream`)
- ❌ Dark mode (out of scope; the brand is light-only for now)
- ❌ Heavy parallax / scroll-driven animations
- ❌ Locking the user inside a modal with no clear exit
- ❌ Custom fonts loaded blockingly (we already preconnect Google Fonts)
- ❌ Unbounded heights — every page root uses `flex-1 min-h-0` so content fits the visible viewport (`100dvh`)

---

## 10. Component contracts

These are the canonical shapes. Refer to `src/components/ui/*` for the
implementations.

- **Button** — Fabric primary/secondary/ghost/ink variants, `rounded-xl`, `h-10 px-3 py-2`
- **Chip** — `rounded-2xl`, active = `border-2 border-ink-strong text-ink-strong` on white
- **Card** — `rounded-2xl bg-bg border border-border-subtle` for items; `rounded-3xl` for hero
- **BottomNav / Tabs (underline)** — bold active label + `h-[3px] bg-ink-strong` bottom bar; no pink pills
- **Sheet** — `rounded-t-3xl bg-bg shadow-sheet`, drag handle, sticky CTA footer when relevant
- **Modal/ConfirmDialog** — `rounded-3xl max-w-[340px]`, `bg-ink/30` backdrop
- **TopNav** — `h-14 px-3`, optional `borderless` for surfaces with their own chrome
- **BottomNav** — Visible-viewport anchored, hidden on immersive routes

---

## 11. Skills CLI quick-reference

```bash
# Per-screen design lookup
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py \
  "<query>" --domain style|typography|ux|chart -n 5

# Full design system regeneration (rare — only if the brand pivots)
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py \
  "fashion wardrobe lifestyle mobile" \
  --design-system --persist -p "Myntra Wardrobe" --stack react

# Page-specific override (overwrites pages/<name>.md)
python3 .cursor/skills/ui-ux-pro-max/scripts/search.py \
  "<query>" --design-system --persist -p "Myntra Wardrobe" --page "<name>"
```

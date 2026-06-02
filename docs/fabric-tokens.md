# Fabric tokens — repo reference

The Wardrobe codebase mirrors the **Myntra Fabric** design system. The canonical
table of variable keys lives in the vault doc (see
[`figma-skills/figma-import/fabric-tokens.md`](../figma-skills/figma-import/fabric-tokens.md)
for the pointer). This file is a fast lookup for the slice we actually use.

## Decision order

1. Figma node has a bound variable → resolve via `get_variable_defs`, use the
   matching Tailwind token.
2. Figma uses a raw hex that matches a Fabric token → use the token name.
3. No match → write the raw hex with a comment, log it under `Unresolved` in
   the build summary.

Never bind "close enough". `#FF3F6C` is `Watermelon/600`. `#FF3F6D` is unresolved.

## Primitive scales (defined in `tailwind.config.ts`)

### Watermelon — brand pink

| Step | Hex | Tailwind |
|------|---------|---------|
| 100 | `#FFEBF0` | `bg-watermelon-100` |
| 600 | `#FF3F6C` | `bg-watermelon-600` (brand) |
| 700 | `#E5345F` | `bg-watermelon-700` (hover/dark) |

### Grey

| Step | Hex | Tailwind |
|------|---------|---------|
| 100 | `#EAEAEC` | `border-grey-100` (hairline) |
| 300 | `#BEBFC5` | `text-grey-300` (disabled text) |
| 500 | `#93959E` | `text-grey-500` |
| 600 | `#686B77` | `text-grey-600` |
| 800 | `#262A39` | `text-grey-800` (canonical ink) |

### Neutral

| Step | Hex | Tailwind |
|------|---------|---------|
| 100 | `#F4F4F5` | `bg-neutral-100` (disabled surface) |
| 150 | `#F9F9FA` | `bg-neutral-150` (canvas) |

### Lilac — AI / accent

| Step | Hex | Tailwind |
|------|---------|---------|
| 100 | `#F0EAFA` | `bg-lilac-100` |
| 700 | `#6E5DC6` | `text-lilac-700` (AI tag) |

## Semantic layer (preferred for new code)

| Token | Resolves to | Used for |
|-------|-------------|----------|
| `primary` | `watermelon-600` | Primary CTAs, selected states, FAB |
| `primary-soft` | `watermelon-100` | Tinted backgrounds on selected pills |
| `primary-dark` | `watermelon-700` | Hover/active on Watermelon |
| `ink` | `grey-800` | Body copy, navigation chrome |
| `ink-subtle` | `grey-600` | Secondary text |
| `ink-faint` | `grey-500` | Captions, hints |
| `ink-ghost` | `grey-300` | Disabled text |
| `divider` | `grey-100` | 1px hairlines |
| `line` | `neutral-100` | Soft dividers, disabled bg |
| `bg` | `#FFFFFF` | Default surface |
| `bg-canvas` | `neutral-150` | Scroll container |
| `bg-disabled` | `neutral-100` | Disabled buttons |
| `accent-ai` | `lilac-700` | AI Try-On & "coming soon" |

## Component contracts (from `pixel-perfect-rules`)

### Primary button (`<Button variant="primary">`)

- `h: 40 (h-10)`, `radius: 12 (rounded-xl)`, `padX: 12 (px-3)`, `padY: 8 (py-2)`
- active: `bg primary text-white`
- hover: `bg primary-dark`
- disabled: `bg bg-disabled text-ink-ghost` (explicit colors, not opacity)

### Pill / filter chip (`<Chip>`)

- `radius: 16 (rounded-2xl)` — NOT `rounded-full`
- default: `border-grey-100 bg-white text-ink-subtle`
- selected: `border-2 border-primary bg-primary-soft text-primary`

### Sheet / modal

- `radius: 24 (rounded-4xl)` on the sheet, `radius: 12` on internal cards
- Scrim: `bg-ink/30`
- Home-indicator handle inside sheet: `94 × 3.5 #93959E rounded-2xl`

### Calendar cell

- selected: `bg primary text-white`
- today: `bg primary-soft text-primary`
- default: `bg-white hairline`

### Selection ring (tile-style — wardrobe item, canvas item)

- `ring-2 ring-primary ring-offset-1 ring-offset-bg`

## Where Fabric ships things we don't use yet

Tracked here so future PRs can pull from Fabric instead of inventing:

- **Snackbar / toast** — Fabric has a snackbar component. We currently roll our
  own in `Toast.tsx`; on Code Connect day, map to Fabric's.
- **Text styles** — Fabric publishes `Heading/L/M/S`, `Body/L/M/S`, `Label/M/S`.
  We use raw `text-[14px]`, `text-[13px]` etc.  When we do a typography pass,
  map them onto Fabric text styles.
- **Spacing variables** — Fabric exposes semantic spacing (`layout-spacing-tight`,
  `layout-spacing-loose`). We use Tailwind primitives; that's fine for now.

## How to keep this honest

- Any new hex going into a component needs a row in this table or a comment
  marking it Unresolved.
- When the vault doc updates, copy the relevant hexes here. **Don't fork** —
  this file is a fast lookup, not the source of truth.

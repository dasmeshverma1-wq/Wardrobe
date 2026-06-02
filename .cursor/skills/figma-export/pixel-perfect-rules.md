# Pixel-Perfect Code → Figma Rules

Companion to [`template.md`](template.md). The template tells you the *order* of operations; this file tells you the *fidelity rules* that apply during Step 4 (build sections). Distilled from a real Figma↔Code translation session on the Myntra PDP / Fit Visualiser surface — every rule below has a real failure case behind it.

These rules are **bidirectional** — most of them were originally written for Figma→Code, but the inverse trap applies when going Code→Figma. Where the direction matters, it's called out.

---

## 1. Auto-Layout ↔ Flexbox is the contract

| Code (source) | Figma (target) |
|--------------|----------------|
| `display: flex; flex-direction: row` | Auto-layout `HORIZONTAL` |
| `display: flex; flex-direction: column` | Auto-layout `VERTICAL` |
| `gap: 12px` | `itemSpacing: 12` (or bound spacing variable) |
| `justify-content: space-between` | `primaryAxisAlignItems: "SPACE_BETWEEN"` |
| `justify-content: center` | `primaryAxisAlignItems: "CENTER"` |
| `align-items: center` | `counterAxisAlignItems: "CENTER"` |
| `padding: 8px 12px` | `paddingTop/Bottom: 8`, `paddingLeft/Right: 12` |
| `width: 100%` (flex child) | `layoutSizingHorizontal: "FILL"` |
| `width: fit-content` / `auto` | `layoutSizingHorizontal: "HUG"` |
| explicit `width: 360px` | `layoutSizingHorizontal: "FIXED"` |
| `position: absolute` (inside relative parent) | child with `layoutPositioning: "ABSOLUTE"` on an auto-layout parent |
| `position: fixed` overlay | separate top-level frame, not a child of the wrapper |

**Hard rule:** Never reach for `layoutPositioning: "ABSOLUTE"` to "fix" a layout that should have been auto-layout. The only legitimate uses are deliberately overlapping elements: badges on cards, floating CTAs, sticky headers/footers, modal scrims. If the source uses absolute positioning to construct what is conceptually a row or column (negative margins, hardcoded `top:`/`left:` on siblings), translate it into auto-layout in Figma even though the source got it wrong.

---

## 2. Sticky / floating / fixed elements

When the source uses `position: fixed bottom-4 z-50` (bottom nav, FAB, snackbar):
- These are **not** children of the page wrapper auto-layout.
- Build them as separate sibling frames at the wrapper's level.
- Position them via `x`/`y` against the wrapper, not as auto-layout children.
- Document them in the build summary as "floating elements" so the Figma reviewer knows they're intentionally outside the flow.

The inverse Figma→Code trap: hardcoded `top: 800px` on what should be `fixed bottom: 16px`. Going Code→Figma, trust the CSS positioning intent, not the rendered Y coordinate from a screenshot.

---

## 3. Typography — exact, not approximate

- **Line-height is explicit.** Figma `1.24 × 15 = 18.6 → 19`. Don't leave `lineHeight` as `auto` and don't use a vague `leading-snug` mapping. When you set `node.lineHeight`, use the integer pixel value the source computes, in `{unit: "PIXELS", value: 19}` form.
- **`textTransform: 'capitalize'` matters.** If the source string is `"buy now"` with `textTransform: capitalize`, set `node.textCase = "TITLE"` in Figma, do **not** rewrite the string to `"Buy Now"` and leave textCase as `"ORIGINAL"`. The source-of-truth string stays lowercase.
- **Font-family sanitation.** Strings like `"Figtree:Bold"` are not real Figma font names. Split into family + style: `{ family: "Figtree", style: "Bold" }`. Map common mismatches: `"SemiBold"`↔`"Semi Bold"`, `"ExtraBold"`↔`"Extra Bold"`, `"DemiBold"`↔`"Demi Bold"`.
- **Always `await figma.loadFontAsync(node.fontName)`** before mutating any text property. See [`failure-recovery.md`](failure-recovery.md) §4 for fallback ladder when the font is missing.
- **Prefer `textStyleId` over manual font props.** If `search_design_system` finds a matching text style (Heading/L, Body/M, Label/S, etc.), bind it via `setTextStyleIdAsync(styleId)` instead of setting `fontName` + `fontSize` + `lineHeight` by hand.

---

## 4. Icons & SVGs — never rebuild from primitives

- **Don't construct icons from rectangles + paths in Figma.** If the source uses an `<img>` or `<svg>` for a chevron, sparkle, logo, handbag, MNOW logo, close-X — find the existing component in the design system (`search_design_system` for "icon", "chevron", "close", "logo") and instance it.
- **One base, many rotations.** Figma typically ships one chevron rotated `-90° / 90° / 180°` for right/up/down/left. Don't go looking for four separate icons — find the base and apply `instance.rotation = -90` (radians: `-Math.PI/2`).
- **Icon container size ≠ glyph size.** Source code often renders an icon at its outer container size (e.g. `12×12`) with the glyph painting only the inner `~5×8`. When recreating in Figma, instance the icon component at the **outer** size — Figma's icon components own their internal padding the same way the SVG viewBox does. Don't shrink the instance to the glyph's visible bounding box, and don't inflate it beyond the source.
- **Asset frames from `generate_figma_design`.** When images are present (`NEEDS_CAPTURE`), the captured frame's image hashes are your source — copy `imageHash` into the target node's `fills`, don't rebuild the bitmap.

---

## 5. Component states — fetch every variant

When the source uses a button, chip, or pill in multiple states (default / selected / disabled / pressed / hover):
- **Resolve every variant up front** via `componentSet.children.find(c => c.name.includes("state=disabled"))`, etc.
- **Don't guess disabled colors.** Real Fabric example — Primary Watermelon button:
  - active: `bg #ff3f6c, text #fff`
  - disabled: `bg #f4f4f5, text #bebfc5`
  - both: `h:40, br:12, padX:12, padY:8`
- If the source renders only the active state but the design system component exposes a disabled variant, still pick the right variant via `setProperties({ "state": "default" })` — don't leave it on whatever the default variant is.

---

## 6. Pills, chips, asymmetric radius

- **Pills are rounded squares, not circles.** Size pills, filter chips, attribute chips → `cornerRadius: 16` (or design-system-bound radius var), **not** `999`. Selected state usually means `strokeWeight: 2` + tinted background + brand text colour, not a fully rounded shape.
- **Asymmetric radius for edge-anchored chips.** Chips that hug the left edge of a canvas often have `topLeftRadius + bottomLeftRadius: 8`, **right side flat (`0`)**. Don't round all four corners "for consistency" — it breaks the anchor illusion. Set per-corner radii explicitly:
  ```js
  node.topLeftRadius = 8;
  node.bottomLeftRadius = 8;
  node.topRightRadius = 0;
  node.bottomRightRadius = 0;
  ```

---

## 7. Translucent / glass styles — copy verbatim

These are brittle and not interchangeable:
- `rgba(0,0,0,0.14)` for inactive chip vs `rgba(0,0,0,0.18)` for active is a deliberate focus hierarchy. Don't normalize.
- Hairline border `borderWidth: 1, borderColor: rgba(255,255,255,0.1)` is what gives a translucent black pill its frosted edge. Skipping flattens the look.
- Secondary text on glass is often `rgba(255,255,255,0.9)` — a real step down from `#fff`.
- Backdrop blur: Figma supports it via effects (`{ type: "BACKGROUND_BLUR", radius: 10, visible: true }`). Apply it. The source's `backdropFilter: blur(10px)` is not decorative.

In Figma plugin code, opacity lives at the paint level, not inside the colour:
```js
const fill = { type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.14 };
```

---

## 8. Sub-pixel coordinates & nested rebasing

- **Don't round `20.971` to `21`.** When the source uses non-integer coordinates (`height: 20.971`, `width: 94.369`, `aspectRatio: 374/498.667`), they came from a Figma export and represent real geometry. Preserve them.
- **Rebase nested coordinates.** A child positioned absolutely inside an auto-layout parent is positioned relative to the parent's content box (after padding). When the source uses absolute coords inside a container with `paddingTop: 4, alignItems: 'center'`, the corresponding Figma child needs its `x`/`y` expressed against the *positioned ancestor*, not Figma's wrapper. Walk up the layout tree and add up the offsets explicitly before placing the node.
- **Convert percentage insets to absolute pixels.** Source like `inset-[29.49%_68.87%_20.55%_-0.01%]` on a `37×13` parent → `w: 11.52, h: 6.5, left: ~0, top: 3.83`. Figma plugin needs absolute numbers; do the math, don't try to pass percentages.

---

## 9. Sheet / overlay anatomy

When importing a bottom sheet, modal, or sticky footer:
- **The iOS home-indicator handle belongs to the sheet.** A `~21h` nav bar with a `94.369 × 3.495` handle (`#93959e`, `borderRadius: 12`) is part of the component; include it as a child of the sheet wrapper, not as platform chrome you skip.
- **Close-button sizing.** A close X inside a sheet header is typically `24×24` tappable with a `16×16` icon — **not** a `40×40` circle. When the source uses a smaller hit-area extension (`hitSlop`), the visible Figma button stays the design size.
- **Canvas padding inside sheets.** A `374`-wide canvas frame inside a `360`-wide sheet exists because Figma drew the artboard without the sheet's outer gutter. In Figma rebuild, respect the sheet's `paddingHorizontal: 16` — don't hardcode the `374` width on the canvas frame, let it `FILL`.

---

## 10. Multi-state Figma components ← multi-state source

When the source is a state machine (`useState<'default' | 'top' | 'mid' | 'bottom'>`, `useState<'closed' | 'open'>`), that's a strong signal the Figma side is a **variant set**. Map states 1:1 to variants:
- Find the component set: `figma.importComponentSetByKeyAsync(KEY)`.
- Iterate `set.children`, match each variant to a source state by name (`state=default`, `state=top`, etc.).
- If the variant set is missing a state the source has, flag it as an unresolved component in the summary — don't silently approximate.
- Animation timings (`Animated.spring`, `transition: 200ms ease-out`) don't translate to static Figma — note them in the summary so the design reviewer knows interactions exist beyond the static frames.

---

## 11. Fabric design system — token → Figma variable mapping

The Myntra Fabric design system is the target library. Variables are published from a central library file; you must `importVariableByKeyAsync` them, never hardcode hexes when a token exists.

**Discovery:** prefer Step 2b's existing-screen inspection. Failing that, run `search_design_system` with `includeVariables: true` and these exact terms:

| Concept | Search terms | Common Fabric tokens |
|---------|--------------|----------------------|
| Brand pink | `watermelon`, `brand`, `primary` | `Watermelon/100 #ffebf0`, `Watermelon/600 #ff3f6c` |
| Greys | `grey`, `gray`, `neutral`, `text` | `Grey/500 #93959e`, `Grey/600 #686b77`, `Grey/800 #262a39` |
| AI/accent | `lilac`, `purple`, `accent` | `Lilac/700 #6e5dc6`, `Lilac/800` (darker AI tag) |
| Surfaces | `background`, `surface`, `bg` | `Neutral/150 #f9f9fa`, `Neutral/100 #f4f4f5` (disabled) |
| Spacing | `space`, `spacing`, `gap`, `padding` | `space/100`, `space/200`, … |
| Radius | `radius`, `corner`, `br` | `radius/sm`, `radius/md`, `radius/full` |

**Hex-as-fallback rule:** if the source uses a hex that **matches** a Fabric token (above), bind the variable instead — the source code just inlined the value. Only if the hex genuinely has no match do you write a SOLID paint and list it under **Unresolved tokens** in the summary with the intended token name:
```
Unresolved tokens:
- background-primary: used #FFFFFF (no Fabric match found)
- spacing-md: used 16 (no Fabric match found)
```

**Token decision order (per fill / spacing / radius):**
1. Source uses an explicit token name (CSS var, theme.colors.X) → look up Fabric var, bind it.
2. Source uses a raw value that matches a Fabric token's hex/px → bind the matching var.
3. Source uses a raw value with no Fabric match → SOLID paint or raw number, log in Unresolved.
4. Never bind a "close enough" var. `#ff3f6c` is Watermelon/600; `#ff3f6d` is unresolved.

---

## 12. Output validation — Figma-side equivalent

The source-doc validation rules (no stray backticks in JSX, balanced `<div>` tags) translate to Figma as:
- **No detached instances.** Every component you placed must report a non-null `mainComponent` in `get_metadata`. If `mainComponent` is null, you accidentally detached it — re-instance from the component key.
- **No orphan frames.** Every frame must be a descendant of the wrapper (or, for floating elements, an explicitly documented sibling).
- **No `placeholder = true` shimmers** left on any node — those are skeleton states from `generate_figma_design` captures.
- **No leftover capture frame.** Delete the `generate_figma_design` output after image transfer.
- **Every "magic number" has a comment.** Use `setSharedPluginData("figma-import", "source", "<sourcePath>:<lineRange>")` on non-obvious frames (asymmetric radius, sub-pixel sizes, hand-tuned offsets) so the next iteration is auditable.

Run these as the structural pass of [`quality-gates.md`](quality-gates.md) after each section.

---

## 13. Verification — inspect, don't eyeball

After every section:
1. `get_metadata` first — cheap, reveals hierarchy, sizing modes, variable bindings.
2. `get_screenshot` second — catches layout drift, not value drift.
3. If a value looks wrong (colour, radius, spacing), inspect the bound variable key on the node — don't compare screenshots pixel by pixel.

The Figma↔Code session that generated these rules learned the hard way: screenshots catch layout drift; computed/bound values catch token drift. Use both, in that order.

---

## TL;DR — the five rules that catch 80% of bugs

1. **Auto-layout, always.** No `layoutPositioning: ABSOLUTE` for things that should be flexbox.
2. **Bind Fabric variables, not hexes.** §11 token table is the source of truth.
3. **Instance icons, don't rebuild.** Use the design-system component, rotate it for direction.
4. **Real instances, not detached frames.** Every `mainComponent` must be non-null.
5. **Preserve sub-pixel coordinates.** `20.971` is not `21`.

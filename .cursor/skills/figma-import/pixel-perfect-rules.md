# Pixel-Perfect Figma → Code Rules

Companion to [`SKILL.md`](SKILL.md). The skill defines the *order* of operations; this file is the *fidelity rulebook* that applies during Step 4 (build) and Step 7 (verify). Distilled from real Figma↔Code translation sessions on the Myntra PDP / Fit Visualiser surface — every rule below has a real failure case behind it.

---

## 1. Auto-layout → Flexbox is the contract

| Figma (source) | Code (target) |
|----------------|---------------|
| Auto-layout `HORIZONTAL` | `display: flex; flex-direction: row` (Tailwind: `flex flex-row`) |
| Auto-layout `VERTICAL` | `display: flex; flex-direction: column` (Tailwind: `flex flex-col`) |
| `itemSpacing: 12` | `gap: 12px` (Tailwind: `gap-3`) |
| `primaryAxisAlignItems: "SPACE_BETWEEN"` | `justify-content: space-between` |
| `primaryAxisAlignItems: "CENTER"` | `justify-content: center` |
| `counterAxisAlignItems: "CENTER"` | `align-items: center` |
| `paddingTop/Bottom/Left/Right` | `padding: …` (or per-side Tailwind utilities) |
| `layoutSizingHorizontal: "FILL"` | `width: 100%` / `flex: 1` |
| `layoutSizingHorizontal: "HUG"` | `width: fit-content` / `width: auto` (default for `inline-flex`) |
| `layoutSizingHorizontal: "FIXED"` | explicit `width: 360px` |
| `layoutPositioning: "ABSOLUTE"` on auto-layout child | `position: absolute` inside `position: relative` parent |

**Hard rule:** never reach for `position: absolute` to construct a row or column. The only legitimate uses: badges on cards, floating CTAs, sticky headers/footers, modal scrims. Everything else is flex.

The inverse trap (which Figma sometimes generates and you must clean up): hardcoded `top: 800px` on what should be `position: fixed; bottom: 16px`. Trust the design intent (sticky bottom nav) over the rendered Y coordinate.

---

## 2. Sticky / floating / fixed elements

When the design has a bottom nav, FAB, snackbar, or sticky header:
- These are **not** children of the page wrapper's flex column.
- Render them as siblings (or, in HTML, as `position: fixed` elements at the body root).
- Z-index lives on the floating element, not on the wrapper.

```tsx
<>
  <main className="flex flex-col">{/* page content */}</main>
  <nav className="fixed bottom-0 inset-x-0 z-50">{/* bottom nav */}</nav>
</>
```

---

## 3. Typography — exact, not approximate

- **Line-height is explicit, in pixels.** Figma `1.24 × 15 = 18.6 → 19`. Don't leave it as `auto` and don't trust a vague `leading-snug`. For small tight text the integer matters.
- **`textTransform: 'capitalize'` matters.** Figma source string is often lowercase (`"buy now"`) with `capitalize`. Mirror in code; do not silently rewrite to title case. Tailwind: `capitalize`. RN: `textTransform: 'capitalize'`.
- **Font-family sanitation.** Strings like `"Figtree:Bold"` are not real font utilities. Split into family + weight: `font-['Figtree'] font-bold`. Map common mismatches: `SemiBold`↔`Semi Bold`, `ExtraBold`↔`Extra Bold`, `DemiBold`↔`Demi Bold`.
- **Letter-spacing** uses bare px in Figma (`letterSpacing: -0.3`). Tailwind: `tracking-[-0.3px]`. CSS: `letter-spacing: -0.3px`.

---

## 4. Icons & SVGs — never rebuild from primitives

This is the **single most common failure mode**. The fix is mechanical:

- **Always use the localhost MCP asset URLs.** `http://localhost:3845/assets/<hash>.svg|.png` from `get_design_context`. Wire them straight into `<img src={...}>` or RN `<Image source={{uri}} />`.
- **Never rebuild icons from divs / shapes / paths.** Sparkles, chevrons, logos (MNOW, M-logo), handbag, close-X, bell, share, more-dots — *always* use the SVG asset. You will drift from the design if you try to reconstruct them.
- **Dump asset URIs up front** as `const` declarations at the top of the component. Don't pick them up piecemeal — that's how you forget one and end up with a placeholder in the rendered output.
- **One base, many rotations.** Figma typically ships one chevron asset rotated for direction. `transform: rotate(-90deg)` for up; same SVG. Don't ask for four different chevrons.
- **Outer box, not glyph extents.** A chevron rendered with `size-[12px]` may have its glyph paint only `~5×8` inside a `12×12` container. Render at the **outer** container size; the SVG handles its own padding via the viewBox. Shrinking to the glyph's bounding box loses the visual whitespace that's part of the icon.
- **`object-contain` / `resizeMode="contain"`.** Default `<img>` and RN `<Image>` resize modes can stretch non-square glyphs. Set `object-contain` (HTML/CSS) or `resizeMode="contain"` (RN) on every icon image. This single line prevents the "stretched chevron" bug.
- **Simplify Figma's SVG wrapper anomalies.** Figma exports sometimes wrap icons in `-scale-y-100 rotate-180` chains. Drop those, use `relative shrink-0` with `object-contain`. Apply rotation as a single `transform` on the container.

### Icon placement checklist

```tsx
const ICON_CHEVRON = "http://localhost:3845/assets/<hash>.svg";

<div className="size-[12px] relative shrink-0">
  <img
    src={ICON_CHEVRON}
    className="size-full object-contain"
    alt=""
    aria-hidden
  />
</div>
```

For RN:
```tsx
<Image
  source={{ uri: ICON_CHEVRON }}
  style={{ width: 12, height: 12 }}
  resizeMode="contain"
/>
```

---

## 5. Coordinate & inset math

- **Convert Figma percentage insets to absolute pixels.** Source like `inset-[29.49%_68.87%_20.55%_-0.01%]` on a `37×13` parent →
  - `width = parentW − (leftPct + rightPct) × parentW = 37 − 0.6886×37 = 11.52`
  - `height = parentH − (topPct + bottomPct) × parentH = 13 − 0.5004×13 = 6.5`
  - `left = leftPct × parentW = -0.0001×37 ≈ 0`
  - `top = topPct × parentH = 0.2949×13 = 3.83`
- **Rebase nested coordinates.** When a graphic sits inside a padded/centered parent (e.g. `align-items: center; padding-top: 4px`), absolutely-positioned children are offset relative to the *positioned* ancestor, not relative to Figma's bounding box. Walk up: "what's my positioning parent in this code, and what's the offset between it and Figma's parent?" Add the offsets.
- **Sub-pixel coordinates are real.** `height: 20.971`, `width: 94.369`, `aspectRatio: 374/498.667` came from Figma's geometry. Preserve them. Comment with the Figma node ID and role.

---

## 6. Component states — fetch every variant up front

When you implement an interactive element (button, chip, toggle, pill):
- Pull Figma specs for **all** states: `default / selected / disabled / pressed / hover`.
- Do not guess disabled colours from `default × 0.5`. Real Fabric example — Primary Watermelon button:
  - active: `bg #ff3f6c, text #fff`
  - disabled: `bg #f4f4f5, text #bebfc5`
  - both: `h:40, br:12, padX:12, padY:8`
- Encode all states even if the current screen only shows one — the next screen probably uses another.

---

## 7. Pills, chips, asymmetric radius

- **Pills are rounded-squares, not circles.** Size pills, filter chips, attribute chips → `borderRadius: 16` (or token), **not** `999`. Selected state usually means `borderWidth: 2` + brand colour border + tinted background + brand text.
- **Asymmetric radius for edge-anchored chips.** Chips that hug the left edge of a canvas often have `borderTopLeftRadius + borderBottomLeftRadius: 8`, **right side flat (`0`)**. Don't normalize all four corners — it breaks the anchor illusion.

```css
border-top-left-radius: 8px;
border-bottom-left-radius: 8px;
border-top-right-radius: 0;
border-bottom-right-radius: 0;
```

---

## 8. Translucent / glass styles — copy verbatim

These are brittle and **not** interchangeable:
- `rgba(0,0,0,0.14)` for an inactive chip vs `rgba(0,0,0,0.18)` for active is a deliberate focus hierarchy. Don't normalize to one.
- Hairline border `border: 1px solid rgba(255,255,255,0.1)` around a translucent black pill is what gives it the frosted-glass edge. Skipping it flattens the look.
- Backdrop blur:
  - **Web/HTML:** `backdrop-filter: blur(10px)` (and `-webkit-backdrop-filter` for Safari).
  - **RN:** not natively supported. Pass `{ backdropFilter: 'blur(10px)' } as any` on RN-Web, accept solid translucent fallback on native, or add `@react-native-community/blur`.
- **Secondary text on glass is `rgba(255,255,255,0.9)`**, not `#fff`. Subtle but intentional step down from the title.

---

## 9. Sheet / overlay anatomy

- **iOS home-indicator handle belongs to the sheet.** A Figma bottom sheet or sticky footer with a `~21h` nav bar containing a `94.369 × 3.495` handle (`#93959e`, `borderRadius: 12`) — include it. It's part of the component, not platform chrome.
- **Close-X is small.** A close button inside a sheet header is typically `24×24` tappable with a `16×16` icon — **not** a `40×40` circle. When in doubt, inspect the icon-layer bounding box in Figma; don't assume tap-target size.
- **Visible target vs hit area.** Keep the visible button the Figma size; extend touchability with `hitSlop` (RN) or padding (web), not by inflating width/height.
- **Canvas inside a sheet.** A `374`-wide canvas frame inside a `360`-wide sheet exists because Figma drew the artboard without the sheet's outer gutter. In code, respect the sheet's `padding-horizontal: 16`. Use `width: 100%` + `aspect-ratio` on the canvas; don't hardcode `374` — it overflows the `360` sheet by 14px and feels edge-to-edge.

---

## 10. Multi-state Figma components → state machines

When a Figma node is a variant set (`Default / Top / Mid / Bottom`, `Closed / Open`), that's a strong signal you should build a **state machine**, not a series of static screens:

1. **Single component**, `useState<Zone>('default')`.
2. **Animated transitions** for shared transforms — RN: `Animated.Value` driven by `useEffect` on state change with `Animated.spring`. Web: CSS transitions or Framer Motion.
3. **Conditional UI per state** — hotspot dots only in default; zoom-out button only when zoomed; skin-tone selector only in default. Read each Figma variant to decide what's visible; don't leave everything on screen at once.
4. **PanResponder for swipe (RN)** — gate on vertical dominance (`Math.abs(g.dy) > Math.abs(g.dx)`) so sibling horizontal scrollers still work. Mirror state into a ref so the release handler reads fresh values.
5. **Tap-to-focus on child chips** — each interactive badge gets `onPress` that advances the state machine to its zone *and* expands its own variant. Sibling chips collapse automatically because their `expanded` prop is `state === myZone`.

---

## 11. Output validation

- **No stray symbols.** JSX trees can collect literal backticks `` ` `` or escaped `\n` characters from component-split paste artifacts. Search the file before saving.
- **Tag balancing.** Every `<div>` / `<View>` matches structurally. Unbalanced tags produce blank screens or React render crashes. Run a quick eyeball check by indentation, or rely on TS/lint.
- **Variable fidelity.** Figma tokens (e.g. `Colors/Primary/brand`) become CSS variables, Tailwind theme entries, or RN theme constants — never raw hexes scattered through JSX. See [`fabric-tokens.md`](fabric-tokens.md).
- **Comments justify magic numbers.** Every non-obvious value (`height: 20.971`, `aspectRatio: 374/498.667`) carries a comment linking back to the Figma node ID and the sub-element's role. Auditable design decisions, not magic.

---

## 12. RN-specific gotchas (skip if web-only)

- **Use `Pressable`, not `View`, on tappable regions.** RN-Web renders `View` as a non-interactive `div`; `Pressable` wires keyboard/focus/click. Banners, cards, CTAs, close buttons all must be `Pressable`.
- **Token → hex mapping.** RN can't consume CSS vars. Keep a single `theme.ts` with hexes (see [`fabric-tokens.md`](fabric-tokens.md)).
- **Browser click verification.** RN-Web renders `Pressable` as `div tabindex=0`. A raw `.click()` may not fire the responder system. Use `dispatchEvent(new MouseEvent('click', {bubbles:true}))` via `preview_eval` to simulate taps.
- **Force reload after edits.** Metro Web (especially in `--no-dev --minify`) can serve a stale bundle. After edits, `location.reload(true)` in the preview before inspecting — otherwise you'll "verify" a ghost.

---

## 13. Verification — `preview_inspect` first, screenshots second

After every section:
1. **`preview_inspect`** on each interactive element. Confirm computed `width`, `height`, `padding`, `border-radius`, `background-color`, `color`, `line-height` match Figma's `get_design_context` values **to the pixel**. This catches token drift, font-weight mismatches, wrong rgba opacities — things screenshots can't see.
2. **`preview_screenshot`** for layout drift — sections in wrong order, overlapping elements, clipped text, missing icons.
3. **Side-by-side check** against `get_screenshot` of the Figma node.

The order matters: screenshots catch layout drift; computed styles catch value drift. Use both, in that order, every time.

When the user says "this looks too big / wrong", **don't math your way to a smaller number**. Re-pull the Figma node's bounding rect or inspect the SVG's visible path extents. Reasoning your way through icon insets is a known dead end — the chevron stretch bug came from doing exactly that.

---

## TL;DR — the five rules that catch 80% of bugs

1. **Auto-layout → flexbox.** Never use `position: absolute` for what should be a row or column.
2. **Use real Figma asset URLs for icons.** Never rebuild from divs.
3. **`object-contain` / `resizeMode="contain"`** on every icon. Default resize modes stretch.
4. **Bind Fabric tokens, not raw hexes.** See [`fabric-tokens.md`](fabric-tokens.md).
5. **`preview_inspect` before declaring done.** Screenshots lie about computed values.

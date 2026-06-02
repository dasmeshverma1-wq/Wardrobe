---
name: figma-import
description: |
  Import a Figma design node into HTML/React (or React Native) code with pixel-perfect fidelity, preserving real Figma SVG/PNG assets so the rendered result is visually identical to the design. Direction: Figma → code. Use whenever the user provides a Figma URL, node ID, or pasted Figma frame and wants it translated into a working component/page — e.g. "import this Figma design into React", "build this frame in HTML", "translate this Figma node to a Tailwind component", "/figma-import <figma-url>", or messages that pair a `figma.com/design/...` URL with a code target (`src/components/...`, a Vault HTML prototype path, an `app.tsx`). Pulls design context via the Figma MCP localhost dev-mode server (`get_design_context`, `get_metadata`, `get_screenshot`, `get_variable_defs`, `get_code_connect_map`), wires real `http://localhost:3845/assets/<hash>.svg|.png` URLs into the code (never rebuilds icons/logos from primitives), maps Figma auto-layout 1:1 to flexbox, preserves sub-pixel coordinates, binds Fabric design-system tokens to CSS variables / theme files, and verifies fidelity with `preview_inspect` (computed styles) and `preview_screenshot`. Sister skill: `figma-export` runs the opposite direction (code → Figma).
compatibility: Read, Write, Edit, Bash, Grep, Glob, mcp__e4276a67-1c43-42ea-9732-c0f6c7474f31__get_design_context, mcp__e4276a67-1c43-42ea-9732-c0f6c7474f31__get_metadata, mcp__e4276a67-1c43-42ea-9732-c0f6c7474f31__get_screenshot, mcp__e4276a67-1c43-42ea-9732-c0f6c7474f31__get_variable_defs, mcp__e4276a67-1c43-42ea-9732-c0f6c7474f31__get_code_connect_map, mcp__e4276a67-1c43-42ea-9732-c0f6c7474f31__search_design_system, mcp__Claude_Preview__preview_start, mcp__Claude_Preview__preview_screenshot, mcp__Claude_Preview__preview_inspect, mcp__Claude_Preview__preview_eval, mcp__Claude_Preview__preview_console_logs
---

# /figma-import — Figma → React/HTML

## What this skill is for

The user has a Figma design — a screen, modal, sheet, card, or section — and wants it as **working code**: an HTML prototype, a React component, a React Native screen. The output must look **visually identical** to the design: same icons (real SVGs from Figma, never rebuilt with `<div>`s), same spacing, same colours, same line-heights, same translucent layers.

This skill drives the Figma MCP **dev-mode** tools (the localhost asset server, `get_design_context`, etc.) plus the preview tools (`preview_inspect`, `preview_screenshot`) to do that with verifiable fidelity.

For the opposite direction (code already exists, push it back to Figma) use the **`figma-export`** skill instead.

## When to invoke

Trigger when the user:
- pastes a Figma URL (`figma.com/design/...?node-id=...`) and asks for code, or
- says "import this Figma design", "build this in React/HTML", "translate this frame", "code this design", or
- types `/figma-import`, or
- continues a previous figma-import run ("now do the next section / variant").

**Skip** when:
- The source is already code and the target is Figma → use `figma-export`.
- The user wants design feedback or a critique → use `design:design-critique`.
- The user wants a dev-handoff spec without writing code → use `design:design-handoff`.

## Required inputs

1. **`FIGMA_URL`** — the Figma URL or node ID. Prefer URL with `?node-id=...` so the exact frame is unambiguous.
2. **`TARGET`** — where the code should land:
   - `react`: a path under `src/components/...` or `src/screens/...`
   - `html`: a Vault HTML prototype path under `Vault/Vault/Charter/<chapter>/.../features/<feature>/*.html`
   - `react-native`: an Expo/RN screen path
3. *(optional)* **`STACK_HINT`** — `tailwind`, `vanilla-css`, `styled-components`, `nativewind`. Default: read the project to infer.
4. *(optional)* **`COMPONENT_NAME`** — the export/file name. Default: derive from the Figma frame name in PascalCase.

If `FIGMA_URL` or `TARGET` is missing, ask once. Don't guess paths.

**Pre-flight check:** the user's Figma desktop app must have the target node in the **active tab** — `get_design_context` resolves "current selection / current tab" semantics. If a call returns "node not found", ask them to focus the right tab; don't try substitute IDs.

---

## Pipeline (must run in order)

### Step 0 — Pre-flight post-mortem (every /figma-import invocation)

Before pulling any Figma data, do a **30-second post-mortem on past mistakes** so this run doesn't repeat them. Read [`mistakes-learned.md`](mistakes-learned.md) — that's the running log of what has gone wrong before and how to avoid it. If a past mistake applies to this run (same component family, same asset type, same state-machine pattern), call it out in your first response: *"Last time I shipped X stretched / wrong orientation / wrong DOM order — checking for it this run."*

**When this run finishes (whether successfully or with corrections), append any new lessons to `mistakes-learned.md`.** Format: one line per lesson — `<symptom> → <root cause> → <how to catch next time>`. This is the only way the skill gets smarter.

**Example lessons that should be in the log:**
- `MNow logo rendered as two stacked images → I split IMG_MNOW_1 + IMG_MNOW_2 (separate viewBoxes 30×10 vs 14.5×8.2) → Always check viewBox dimensions before composing multi-asset logos; if one asset has a 3:1 wordmark viewBox, it IS the full logo`
- `Wishlist heart looked stretched → set explicit width/height without object-fit:contain on a non-square SVG → Add object-fit:contain to every <img class="icon"> by default`
- `Product card had border + border-radius the design didn't have → assumed a card primitive needed a "card" treatment → Match the Figma node's actual fills/strokes; absence of stroke means no border`

### Step 0.1 — Parse the URL & confirm context

- Extract `fileKey` and `nodeId` from `figma.com/design/:fileKey/...?node-id=:nodeId` (convert hyphens to colons: `123-456` → `123:456`).
- Run `get_metadata` first (cheap) to confirm the node exists, get its name + type + child count, and plan the build before spending on `get_design_context`.

**Gate:** node resolved, name + type known.

### Step 1 — Pull design context & dump assets up front

Run `get_design_context` for the node. It returns layout, typography, fills, effects, **and a list of asset URLs** of the form `http://localhost:3845/assets/<hash>.svg` (or `.png`).

**Hard rule — dump ALL asset URIs at the top of the component as `const` declarations** before writing any JSX. Don't pick them up piecemeal as you encounter each `<img>`:

```tsx
// Assets (Figma localhost MCP)
const ICON_CHEVRON = "http://localhost:3845/assets/abc123.svg";
const ICON_SPARKLE = "http://localhost:3845/assets/def456.svg";
const LOGO_MNOW    = "http://localhost:3845/assets/ghi789.svg";
const HERO_IMG     = "http://localhost:3845/assets/jkl012.png";
```

If `get_design_context` fails for the leaf node, fall back to the **parent frame** — the parent's context usually includes child specs sufficient to rebuild.

**Gate:** asset list captured; layout tree understood at frame + section level.

### Step 2 — Pull variables & resolve Fabric tokens

Call `get_variable_defs` for the node to get the bound design-system variables (colours, spacing, radii, text styles). Map them to your code's token system:

- **Tailwind / CSS vars:** add to `tailwind.config.js` or `:root` if not already there. Reference as `bg-watermelon-600`, `var(--color-watermelon-600)`.
- **React Native:** keep a single `theme.ts` file with hex values. RN can't consume CSS vars directly.
- **Plain HTML prototypes (Vault):** define CSS custom properties on `:root` so the prototype is self-contained.

The Fabric token reference table (Watermelon / Grey / Lilac / Neutral hex values + naming conventions) lives in [`fabric-tokens.md`](fabric-tokens.md). Use it whenever `get_variable_defs` returns a variable name without a hex, or to sanity-check.

**Token decision order:**
1. Figma node has a bound variable → resolve via `get_variable_defs`, use the matching code token.
2. Figma uses a raw hex that matches a known Fabric token → use the token name in code.
3. Genuinely custom value → write the raw hex with a comment explaining why.

**Gate:** every distinct colour / spacing / radius / text style in the design has a code-side resolution (token or documented raw value).

### Step 3 — Check Fabric DS + Code Connect before building anything

**Rule: never build a new component if Fabric already has one.**

Before writing any code for a repeatable UI element (chips, pills, rating badges, buttons, cards, inputs, etc.):

1. **Search Fabric DS first** — run `search_design_system` on the Fabric file key (`vpZ4JeTx6eEhGh7gjTTnHo`) with the component name:
   ```
   search_design_system({ query: "rating pill", fileKey: "vpZ4JeTx6eEhGh7gjTTnHo", includeComponents: true })
   ```
   If a match exists in an **active library** (Fabric, Buttons v0.1, Pills v0.1, etc. — not "MDL3.0 [WIP]" or "PLP 2.0"), use that component as the reference. Document its `componentKey` and `libraryName` in the output summary.

2. **If it exists in Fabric:** build the HTML/code to match the DS spec. Note: `Fabric` is the canonical active library; `MDL3.0 [WIP]` is deprecated — do not use it as a reference unless explicitly asked.

3. **If it does NOT exist in Fabric:** stop and ask the user:
   > "Fabric doesn't have a `<ComponentName>` yet. Do you want to (a) create a new component in `components/fabric-ds/`, or (b) build it inline and we'll add it to the DS later?"
   Never silently create a new component.

4. **If the user says to create a variant of an existing component:** ask whether to (a) update the existing component file or (b) add a variant section to it. Never silently overwrite.

Run `get_code_connect_map` for the file as well. If components have Code Connect mappings (e.g. Figma "Button" maps to `<Button variant="primary">`), use the mapped component. Read the file to learn its props.

**Gate:** every repeatable UI element is either sourced from Fabric DS (with componentKey documented) or the user has explicitly approved creating a new one.

### Step 4 — Build the component, section by section

Follow the rules in [`pixel-perfect-rules.md`](pixel-perfect-rules.md). Summary of the non-negotiable ones — read the doc for the full list:

**Layout:**
- Map Figma auto-layout 1:1 to flexbox (`flex flex-row gap-3 justify-between items-center` etc.). No absolute positioning to construct what should be a row/column.
- Absolute positioning is **only** for genuinely overlapping elements: badges, floating CTAs, modal scrims.
- Sticky/floating bars (`fixed bottom-4 z-50`) become **siblings** of the page wrapper, not children of the auto-layout.
- Convert Figma percentage insets (`inset-[29.49%_68.87%_20.55%_-0.01%]`) to absolute px values before placing.

**Typography:**
- Don't generate invalid font utilities like `font-['Figtree:Bold']`. Split: `font-['Figtree'] font-bold`.
- Tighten line-heights — Figma's raw line-height often produces text-box blowouts; use the integer pixel value (e.g. `1.24 × 15 = 18.6 → 19`), or `leading-tight`/`leading-snug` only after checking.
- `textTransform: capitalize` is preserved from the source string. Don't rewrite `"buy now"` to `"Buy Now"` and drop the transform.

**Icons & SVGs (the most common failure mode):**
- **Never rebuild icons from divs.** Sparkles, chevrons, logos, MNOW, handbag, close-X — use the localhost SVG URL.
- For `<img>`, render at the **outer container** size from Figma, not the inner glyph extent. A `12×12` chevron with `~5×8` glyph paint stays `12×12` in code; the SVG handles its own padding.
- React Native: `resizeMode="contain"` on every icon image. Web: `object-fit: contain` on every icon `<img>`. This single line prevents most "stretched chevron" bugs.
- One base + rotation for direction: `transform: rotate(-90deg)` for an up-chevron, not a separate asset.
- Simplify Figma SVG wrapper anomalies — drop `-scale-y-100 rotate-180` chains, use `relative shrink-0` + `object-contain`.

**Asset orientation checkpoint (run before the first preview screenshot):**

For every asset URI you've dumped, decode the SVG `viewBox` (or read PNG dimensions) and compare to the size you're rendering it at. If the aspect ratios don't match by ≤5%, you will get a stretched/squished render. Fix immediately — don't wait for the user to spot it.

| What you have | What to check | Red flag |
|---|---|---|
| Multi-asset logo (e.g. `LOGO_PART_1`, `LOGO_PART_2`) | Decode each viewBox. If one is the full wordmark dimensions (e.g. `30 × 10`, 3:1 ratio) and the other is a small square, the first IS the complete logo — don't stack them. | Stacking a wordmark on top of a smaller fragment doubles the height and looks wrong. |
| Icon SVG with non-square viewBox (e.g. heart `16.6 × 15.0`) | Container size must match the viewBox aspect, OR add `object-fit: contain`. | Setting `width:20; height:20` on a 16.6×15 SVG without `object-fit:contain` stretches it horizontally. |
| Logo rendered side-by-side with text in a pill | The pill content should be `flex-direction: row` not `column`. The logo is a horizontal wordmark, not a stacked badge. | Vertical stacking of a horizontal logo + label looks like a duplicated logo. |

**Colours & translucent layers:**
- Copy `rgba()` opacities **verbatim** from Figma. `rgba(0,0,0,0.14)` and `rgba(0,0,0,0.18)` are not interchangeable.
- Hairline `borderWidth: 1, borderColor: rgba(255,255,255,0.1)` on glass pills is what makes them look frosted.
- Asymmetric corner radii on edge-anchored chips: round only the free side. Don't normalize all four corners.
- Secondary text on glass is often `rgba(255,255,255,0.9)`, not `#fff`.

**Component states:**
- For interactive elements, fetch every variant up front (`default / selected / disabled / pressed / hover`). Don't guess the disabled colour.
- Pills are rounded-squares (`borderRadius: 16`), not circles (`999`). Selected state usually means brand-coloured 2px border + tint + brand text colour.

**Output hygiene:**
- No stray backticks or literal `\n` in the JSX. Watch component-split paste artifacts.
- Every `<div>` opens and closes. Run a balance check before saving.
- Every "magic number" gets a comment: `/* aspect ratio from Figma node 1234:5678 — canvas frame */`.

**Gate (per section):** rendered output matches Figma screenshot at section level.

### Step 5 — Sheet / overlay anatomy

If the design is a bottom sheet, modal, or sticky footer:
- Include the iOS home-indicator handle (`94.369 × 3.495`, `#93959e`, `borderRadius: 12`) inside the sheet — it's part of the component, not platform chrome.
- Close-X is typically a `24×24` tappable with a `16×16` icon. RN: extend touchability with `hitSlop`, don't inflate the visible button.
- Canvas inside a sheet: respect the sheet's `paddingHorizontal: 16`. A `374`-wide canvas inside a `360`-wide sheet means the canvas should be `width: 100%` + `aspectRatio`, not hardcoded `374`.

### Step 6 — Multi-state designs → state machines

If the Figma node is a variant set (`Default / Top / Mid / Bottom`, `Closed / Open`), translate to a state machine:
- One component, `useState<Zone>('default')`.
- `Animated.Value` (RN) or CSS transitions for shared transforms.
- Conditional UI per state — don't render every variant simultaneously side by side.
- For RN-Web, use `Pressable` (not `View`) on tappable regions so click/keyboard handlers wire up.

### Step 7 — Verify fidelity

This is non-skippable. Do **not** ship the component without running the full verification loop.

1. **Start preview** — `preview_start` if not already running.
2. **Force reload** after edits — Metro / Vite caches can serve stale bundles. `preview_eval`: `window.location.reload()`.
3. **`preview_inspect` first, screenshots second.**
   - `preview_inspect` on each interactive element: confirm computed `width`, `height`, `padding`, `borderRadius`, `backgroundColor`, `color`, `lineHeight` match Figma's `get_design_context` values to the pixel.
   - `preview_screenshot` for layout drift (sections in wrong order, overlapping elements, clipped text).
4. **Side-by-side check** against `get_screenshot` of the Figma node. List any visible diffs and fix them with targeted edits — don't rebuild from scratch.
5. **Click verification** for interactives — RN-Web renders `Pressable` as `div tabindex=0`, so a raw `.click()` may not fire the responder system. Use `preview_eval` with `dispatchEvent(new MouseEvent('click', {bubbles:true}))`.
6. **Check console logs** — `preview_console_logs` for runtime errors, missing assets (404 on a localhost SVG means the Figma desktop app dropped the connection — ask the user to refocus the file).

**Gate:** every section has been inspected (computed values match) AND screenshotted (layout matches). Document any remaining diffs in the summary.

---

## Vault-specific notes

When the target is a Vault HTML prototype (`Vault/Vault/Charter/.../features/.../*.html`):
- Honor the saved feedback: HTML prototypes must be **self-contained**. Don't reference absolute `/figma/orig/*` paths. Use `figma-assets-inline.js` so the SVGs load in any preview host.
- For the design variants gallery, build an inline gallery HTML next to the feature — never rely on hash params or prose to switch variants.
- The chapter Charter (`Vault/Vault/Charter/<chapter>/...`) often has the section taxonomy. Read it if section names in Figma are ambiguous.

When the target is React in `~/my-app` or similar:
- Check for `tailwind.config.js`, `tsconfig.json`, existing `theme.ts` before deciding which token system to use.
- Look for existing primitives (`Button`, `Card`, `Input`) before introducing new ones.

---

## Output

End with a structured summary:

```
## Figma Import Summary

**Source node:** <name> (<nodeId>) in <fileKey>
**Target file(s):** <list of paths created/modified>
**Component name:** <PascalCaseName>
**Assets wired:** <count> (SVG: <n>, PNG: <n>)
**Code Connect mappings used:** <list or "none">
**Tokens resolved:** <count Fabric, count raw>
**Variants/states implemented:** <list, e.g. "default, selected, disabled">
**Verification:**
  - preview_inspect computed-style check: PASS / FAIL diffs: <list>
  - preview_screenshot vs get_screenshot diff: <description>
**Unresolved:** <list of components/tokens that needed primitives or raw values, "none" if clean>
**Notes for design review:** <any intentional deviations from the Figma design with reason>
```

Anything unresolved is **listed explicitly** — never silently approximated.

---

## Failure recovery

| Symptom | Fix |
|---------|-----|
| `get_design_context` "node not found" | Ask user to focus the correct Figma desktop tab. Don't substitute IDs. |
| Localhost asset 404 (`localhost:3845/...`) | Figma desktop dropped the connection. Ask user to reopen the file. Don't rebuild the icon as a fallback. |
| Leaf node inaccessible | Fetch parent frame — child specs are usually included. |
| Font not available | List available fonts via the codebase's existing font setup. Map common mismatches: SemiBold↔Semi Bold. Fall back: Inter → Roboto → Arial. |
| Stale bundle in preview | `preview_eval`: `location.reload(true)`. Don't "verify" without reloading. |
| Chevron / icon looks stretched | RN: missing `resizeMode="contain"`. Web: missing `object-contain`. The single most common bug. |
| Text-box too tall | Line-height blowout. Tighten to integer px from Figma's `line_height_px`, not the unitless ratio. |
| Disabled state colour wrong | Didn't fetch the disabled variant from Figma. Re-run `get_design_context` on the disabled variant node. |

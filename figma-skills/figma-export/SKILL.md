---
name: figma-export
description: |
  Export a React component or HTML prototype out to Figma as a real, design-system-bound frame using the Figma MCP plugin tools (`use_figma`, `get_screenshot`, `get_metadata`, `search_design_system`, `generate_figma_design`). Direction: code → Figma. Use whenever the user wants to push a screen, modal, or section that was built/prototyped in code (e.g. Vault HTML prototypes under `Vault/Vault/Charter/.../features/.../*.html`, or a React file like `src/screens/PDPScreen/PDPScreen.tsx`) onto a Figma canvas with proper auto-layout and Fabric design-system bindings, so the result is dev-ready and shareable. Triggers on phrases like "export this to Figma", "push this prototype to Figma", "build this in Figma", "import this *into* Figma", "/figma-export", or any message that pairs a code source file/path with a `figma.com/design/...` URL. Runs a deterministic 7-step pipeline: parse URL → read source → discover design-system components/variables/styles (Code Connect first, then existing screens, then `search_design_system`) → create wrapper → build sections one `use_figma` call at a time → transfer images via `generate_figma_design` → validate against quality gates → return summary with unresolved tokens. Sister skill: `figma-import` runs the opposite direction (Figma → React/HTML).
compatibility: Read, Bash, Grep, Glob, mcp__e4276a67-1c43-42ea-9732-c0f6c7474f31__use_figma, mcp__e4276a67-1c43-42ea-9732-c0f6c7474f31__get_screenshot, mcp__e4276a67-1c43-42ea-9732-c0f6c7474f31__get_metadata, mcp__e4276a67-1c43-42ea-9732-c0f6c7474f31__search_design_system, mcp__e4276a67-1c43-42ea-9732-c0f6c7474f31__generate_diagram
---

# /figma-export — React/HTML → Figma

## What this skill is for

The user has a screen, modal, or section that already exists as code — a React component (`*.tsx`), a static HTML prototype (e.g. one of the Vault HTML mocks under `Vault/Vault/Charter/<chapter>/sections/<section>/features/<feature>/*.html`), or a working dev preview. They want it inside a real Figma file — not as a screenshot or auto-generated frame, but as a properly structured auto-layout wrapper made of **real design-system component instances**, with **bound variables** for colour/spacing/radius and **text styles** instead of raw font properties.

This skill drives the Figma MCP plugin tools to do that deterministically.

## When to invoke

Invoke this skill whenever the user message:
- references a source file (path to a `.tsx`, `.jsx`, `.html`) **and** a Figma URL (`figma.com/design/...`), or
- asks to "build / import / push / recreate this in Figma", or
- says `/figma-import`, or
- continues a previous figma-import run (e.g. "now add the next section to that wrapper").

Skip if the user just wants a Figma screenshot, an export of an existing Figma frame, or design feedback — those are not what this skill does.

## Required inputs

Before starting, you must have:

1. **`SOURCE`** — absolute or repo-relative path(s) to the source file(s). Point to the leaf component/HTML, not a barrel or `index.ts`. If the component imports sub-components, you'll read those too.
2. **`FIGMA_URL`** — target Figma file URL. Parse `fileKey` and optional `nodeId` from it (`123-456` → `123:456`).
3. *(optional)* **`PAGE_NAME`** — Figma page to work on. Default: current/first page.
4. *(optional)* **`WRAPPER_WIDTH`** — explicit width. Default: 390 for mobile screens, 640 for modals/sheets, 1440 for desktop.

If any of `SOURCE` or `FIGMA_URL` is missing, ask the user once before starting. Don't guess paths.

## Pipeline (must run in order)

The full deterministic template lives in [`template.md`](template.md). **Read it before you start any Figma MCP calls** — every step has a hard gate that must pass before the next.

Summary of the 7 steps:

| Step | What happens | Gate |
|------|--------------|------|
| 0 | Parse `fileKey` + `nodeId` from URL | fileKey non-empty |
| 1 | Read source, list sections + components, set `NEEDS_CAPTURE` flag if images present | section list + per-section component list exist |
| 2 | Discover design-system components (Code Connect → existing screens → `search_design_system`), variables, and styles | every component resolved or marked "manual build" |
| 3 | Create the wrapper auto-layout frame (kick off `generate_figma_design` in parallel if `NEEDS_CAPTURE`) | `wrapperId` returned |
| 4 | Build each section in its own `use_figma` call, screenshot + check quality gates after each | per-section gates pass |
| 5 | Transfer image hashes from the `generate_figma_design` capture into your frames | no blank image placeholders |
| 6 | Full-view screenshot + run final quality gates from [`quality-gates.md`](quality-gates.md) | all gates pass |
| 7 | Return the structured Figma Build Summary | summary printed |

## Hard rules (apply to every `use_figma` call)

These come from the template and are non-negotiable. Re-read them before writing any plugin script:

- Use `return` to send data back. **Never** `figma.closePlugin()`.
- Plain JS with top-level `await`. **Never** wrap in an async IIFE.
- **Never** call `figma.notify()` — it throws.
- **Never** use `console.log()` for output — use `return`.
- Colors are **0–1**, not 0–255. Paint `color` is `{r, g, b}` only (no `a`); opacity lives at paint level.
- `fills` / `strokes` are read-only arrays — clone, modify, reassign.
- `setBoundVariableForPaint` returns a **new** paint — capture the return value and reassign.
- `layoutSizingHorizontal/Vertical = "FILL"` MUST be set **after** `appendChild`.
- `await figma.loadFontAsync(...)` before any text mutation.
- `lineHeight` / `letterSpacing` use `{unit, value}`, not bare numbers.
- `resize()` BEFORE setting sizing modes (`resize` resets them to FIXED).
- Page switches require `await figma.setCurrentPageAsync(page)` — sync setter doesn't work.
- Every script returns all created/mutated node IDs.
- At most ~10 logical operations per `use_figma` call.
- Use `getSharedPluginData()` / `setSharedPluginData()` — the unshared variants are not supported.

## Discovery order — do not skip steps

Component / variable / style discovery (Step 2) has a strict ladder. **Do not** call `search_design_system` for component keys until you have:

1. Searched the codebase for Code Connect files (`*.figma.ts`, `*.figma.tsx`, `*.figma.js`) and resolved everything you can from them.
2. Walked an existing screen in the target Figma file via `use_figma` to harvest already-used component keys.

Only after both of those, fall back to `search_design_system` (with `includeComponents: true`, broad synonyms: `button|btn`, `card|tile`, `input|text field`, `nav|navigation|menu|tabs`, etc.). For each new component, create a temp instance, read its `componentProperties` to learn TEXT keys for overrides, then remove the temp instance.

For variables, never conclude "no variables exist" from `getLocalVariableCollectionsAsync()` returning empty — library variables are invisible there. Always also query `search_design_system` with `includeVariables: true`.

## Pixel-perfect fidelity rules

Before writing any section in Step 4, read [`pixel-perfect-rules.md`](pixel-perfect-rules.md). It encodes the bidirectional Figma↔Code rules learned from a real Myntra PDP/Fit-Visualiser build:
- Auto-layout ↔ Flexbox mapping table (when to FILL/HUG/FIXED, when absolute positioning is legitimate, where floating elements live).
- Typography exactness — `lineHeight` integers, `textCase: TITLE` for `capitalize`, prefer `textStyleId` over manual font props.
- Icon handling — instance from the design system, rotate one base for direction, use the outer container size, never rebuild from primitives.
- Component variant completeness — resolve every state up front, don't guess disabled colours.
- Asymmetric radii, translucent layered styles, sub-pixel coordinate preservation.
- Sheet anatomy (home indicator handle, close-X sizing, canvas-inside-sheet padding).
- Multi-state source → Figma variant set mapping.
- **Fabric design system token map** — Watermelon/Grey/Lilac/Neutral hex values and the `search_design_system` terms that find them. The canonical reference now lives in [`fabric-tokens.md`](fabric-tokens.md) (shared with the `figma-import` skill). Token decision order: explicit token > hex matches Fabric token > raw value (and log under Unresolved).
- Output validation — no detached instances, no orphan frames, no leftover capture frames, "magic numbers" tagged with `setSharedPluginData` source refs.

The TL;DR at the bottom of that file lists the five rules that catch ~80% of fidelity bugs.

## Quality gates

After **every section** in Step 4, take a `get_screenshot` of the section node and run the per-section checklist in [`quality-gates.md`](quality-gates.md): no clipped text, no overlapping elements, no placeholder strings, correct variants, proper FILL sizing, real component instances (not detached frames), token-bound fills, text styles applied. Fix issues with **targeted** `use_figma` calls — don't rebuild the section.

After all sections, run the full-view checklist (Step 6) and the image-transfer checklist if `NEEDS_CAPTURE` was true.

## Failure recovery

When something fails — MCP auth, missing component, missing variable, font not found, plugin script error, visual mismatch, HUG/FILL collapse, invalidated node ID — follow the playbook in [`failure-recovery.md`](failure-recovery.md). Key principle: **`use_figma` is atomic** — failed scripts make no changes, so STOP-READ-FIX-RETRY is always safe. Don't blindly re-run a failing script; read the error, find it in the recovery table, fix the cause.

## Vault-specific notes

When the source is a Vault HTML prototype (path under `Vault/Vault/Charter/.../features/.../*.html`):
- Honor the user's saved feedback: HTML prototypes must be self-contained — assets load via `figma-assets-inline.js`, not absolute `/figma/orig/*` paths. If you spot absolute asset paths in the source, flag it and treat those frames as image placeholders to be filled by `generate_figma_design`.
- The Vault chapter Charter (`Vault/Vault/Charter/<chapter>/...`) often documents the section layout — read it if section boundaries in the HTML are ambiguous.
- The target Figma file is usually the Myntra design system file. Prefer Code Connect mappings under the codebase before searching the design system.

## Output

End with the structured summary from Step 7:

```
## Figma Build Summary

**Wrapper node ID:** <id>
**Sections built:** <count>
**Component instances used:** <list>
**Token bindings applied:** <count>
**Unresolved components:** <list or "none">
**Unresolved tokens:** <list or "none">
**Issues fixed during build:** <list or "none">
**Remaining issues:** <list or "none">
```

Anything unresolved gets explicitly listed — never silently skipped.

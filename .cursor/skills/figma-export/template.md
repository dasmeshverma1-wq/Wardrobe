# Figma from React/HTML -- Execution Template

Follow every step in order. Do NOT skip steps. Each step ends with an explicit
gate that must pass before moving on.

---

## Inputs (provided by user)

- `SOURCE`: path to React/HTML component file(s)
- `FIGMA_URL`: target Figma file URL (parse `fileKey` and optional `nodeId`)
- `PAGE_NAME` (optional): Figma page to work on (default: first page)

---

## Step 0: Parse Figma URL

Extract `fileKey` and `nodeId` from the URL:
- `figma.com/design/:fileKey/:name?node-id=:nodeId` -- convert hyphens to
  colons in nodeId (`123-456` -> `123:456`)
- `figma.com/design/:fileKey/branch/:branchKey/:name` -- use branchKey as
  fileKey

Gate: fileKey is a non-empty string.

---

## Step 1: Understand the Source

1. Read the source file(s).
2. List major sections top-to-bottom (e.g. Header, Hero, Content, Footer, or
   Title Bar, Form, Action Bar for modals).
3. For each section list the UI components used (Button, Input, Card, etc.).
4. Check whether the view contains images (`<img>`, `<Image>`, background-image,
   product photos, avatars, icon URLs). If yes AND this is a web app, flag
   `NEEDS_CAPTURE = true`.

Gate: section list exists, component list per section exists.

---

## Step 2: Discover Design System Assets

### Hard gates (forbidden shortcuts)

- Do NOT call `search_design_system` for component keys until 2a-i is done
  and 2a-ii is attempted.
- Do NOT run any canvas-mutating `use_figma` call (Step 3+) until all Step 2
  rows are filled in.

### 2a: Components

**2a-i -- Check Code Connect files.**
For each component in your list, search the codebase for Code Connect files:
- TypeScript/JS: `*.figma.ts`, `*.figma.js`
- React: `*.figma.tsx`

From each matching file extract the Figma component URL, parse fileKey +
nodeId, then resolve the component key via `use_figma` against the library
file:

```js
const node = await figma.getNodeByIdAsync("NODE_ID");
const set = node?.parent?.type === "COMPONENT_SET" ? node.parent : node;
return { componentKey: set.key };
```

Mark resolved components. If all resolved, skip 2a-ii and 2a-iii.

**2a-ii -- Inspect existing screens in the target file.**
If unresolved components remain, run a single `use_figma` call that walks an
existing frame's instances:

```js
const frame = figma.currentPage.findOne(n => n.name === "EXISTING_SCREEN_NAME");
if (!frame) return { error: "no existing screen found" };
const uniqueSets = new Map();
frame.findAll(n => n.type === "INSTANCE").forEach(inst => {
  const mc = inst.mainComponent;
  const cs = mc?.parent?.type === "COMPONENT_SET" ? mc.parent : null;
  const key = cs ? cs.key : mc?.key;
  const name = cs ? cs.name : mc?.name;
  if (key && !uniqueSets.has(key)) {
    uniqueSets.set(key, { name, key, isSet: !!cs, sampleVariant: mc.name });
  }
});
return [...uniqueSets.values()];
```

**2a-iii -- Last resort: `search_design_system`.**
Only after both above. Search broadly with multiple terms and synonyms
(e.g. "button", "card", "input", "nav", "accordion", "header", "footer",
"tag", "avatar", "toggle"). Use `includeComponents: true`.

For each found component, create a temporary instance and read its
`componentProperties` (and those of nested instances) to learn TEXT property
keys for text overrides. Then remove the temp instance.

### 2b: Variables (colors, spacing, radii)

First try inspecting existing screens' bound variables. Then use
`search_design_system` with `includeVariables: true` and short parallel
queries: "gray", "red", "blue", "background", "foreground", "border",
"space", "radius", "gap", "padding".

Never conclude "no variables exist" based solely on
`getLocalVariableCollectionsAsync()` returning empty -- library variables
are invisible to that API. Always also search via `search_design_system`.

### 2c: Styles (text, effects)

Search with `includeStyles: true` and terms like "heading", "body",
"shadow", "elevation". Or inspect an existing screen's textStyleId /
effectStyleId bindings.

Gate: component map, variable map, and style map are documented. Every
component from Step 1 is either resolved or marked "manual build".

---

## Step 3: Create the Wrapper Frame

If `NEEDS_CAPTURE` is true, start `generate_figma_design` NOW in parallel
with this step. The capture runs while you build.

Create the wrapper in its own `use_figma` call:

```js
let maxX = 0;
for (const child of figma.currentPage.children) {
  maxX = Math.max(maxX, child.x + child.width);
}
const wrapper = figma.createAutoLayout("VERTICAL");
wrapper.name = "VIEW_NAME";
wrapper.primaryAxisAlignItems = "CENTER";
wrapper.counterAxisAlignItems = "CENTER";
wrapper.resize(WIDTH, 100);          // adapt width to source
wrapper.layoutSizingHorizontal = "FIXED";
wrapper.x = maxX + 200;
wrapper.y = 0;
return { success: true, wrapperId: wrapper.id };
```

Gate: wrapperId returned and non-null.

---

## Step 4: Build Each Section

Build one section per `use_figma` call. At the start of each script, fetch
the wrapper by ID and append new content to it.

### Per-section script pattern

```js
const createdNodeIds = [];
const wrapper = await figma.getNodeByIdAsync("WRAPPER_ID");

// Import design system components
const buttonSet = await figma.importComponentSetByKeyAsync("BUTTON_KEY");
const primaryBtn = buttonSet.children.find(c =>
  c.type === "COMPONENT" && c.name.includes("variant=primary")
) || buttonSet.defaultVariant;

// Import variables
const bgVar = await figma.variables.importVariableByKeyAsync("BG_VAR_KEY");
const spaceVar = await figma.variables.importVariableByKeyAsync("SPACE_KEY");

// Build section frame with token bindings (no hardcoded values)
const section = figma.createAutoLayout();
section.name = "SectionName";
section.setBoundVariable("paddingLeft", spaceVar);
section.setBoundVariable("paddingRight", spaceVar);
const bgPaint = figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", bgVar
);
section.fills = [bgPaint];

// Create component instances
const btnInst = primaryBtn.createInstance();
section.appendChild(btnInst);
createdNodeIds.push(btnInst.id);

// Append to wrapper, then set FILL
wrapper.appendChild(section);
section.layoutSizingHorizontal = "FILL";

createdNodeIds.push(section.id);
return { success: true, createdNodeIds };
```

### Text overrides

Use `setProperties()` with discovered TEXT property keys from Step 2.
Only fall back to direct `node.characters` for text NOT managed by a
component property. Always `await figma.loadFontAsync(node.fontName)`
before setting characters.

### After each section

Take a screenshot: `get_screenshot` with the section node ID. Run the
quality-gates checklist (see quality-gates.md). Fix issues with targeted
`use_figma` calls before moving on.

Gate: screenshot reviewed, no clipped text, no overlapping elements, no
placeholder text, correct component variants.

---

## Step 5: Transfer Images (if NEEDS_CAPTURE)

1. Find all image nodes in the `generate_figma_design` capture:
   ```js
   const capture = await figma.getNodeByIdAsync("CAPTURE_NODE_ID");
   const images = [];
   capture.findAll(n => {
     if (n.fills && Array.isArray(n.fills)) {
       for (const fill of n.fills) {
         if (fill.type === "IMAGE") {
           images.push({ name: n.name, id: n.id, imageHash: fill.imageHash });
           return true;
         }
       }
     }
     return false;
   });
   return images;
   ```
2. Match each image to the corresponding frame in your output.
3. Apply: `targetFrame.fills = [{ type: "IMAGE", imageHash: "HASH", scaleMode: "FILL" }];`
4. Delete the capture output after all images are transferred.

Gate: no blank image placeholders remain.

---

## Step 6: Final Validation

1. Take a full-view screenshot of the wrapper.
2. Take per-section screenshots.
3. Run the full quality-gates checklist.
4. Fix any remaining issues with targeted `use_figma` calls.

Gate: all quality gates pass.

---

## Step 7: Return Summary

Return a structured summary:

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

---

## Critical Rules (apply to every `use_figma` call)

- Use `return` to send data back. Never `figma.closePlugin()`.
- Plain JS with top-level `await`. Never wrap in async IIFE.
- Never call `figma.notify()` -- it throws.
- Never use `console.log()` for output -- use `return`.
- Colors are 0-1 range, not 0-255.
- Paint `color` is `{r, g, b}` only -- no `a`. Opacity at paint level.
- Fills/strokes are read-only arrays -- clone, modify, reassign.
- `setBoundVariableForPaint` returns a NEW paint -- capture and reassign.
- `layoutSizingHorizontal/Vertical = "FILL"` MUST be set AFTER appendChild.
- `await figma.loadFontAsync(...)` before any text property change.
- `lineHeight`/`letterSpacing` use `{unit, value}` format, not bare numbers.
- `resize()` BEFORE setting sizing modes (resize resets them to FIXED).
- Page switches: `await figma.setCurrentPageAsync(page)` -- sync setter
  does NOT work.
- Every script MUST return all created/mutated node IDs.
- `await` every Promise -- no fire-and-forget.
- Position new top-level nodes away from (0,0).
- At most 10 logical operations per `use_figma` call.
- `getPluginData()`/`setPluginData()` are NOT supported -- use
  `getSharedPluginData()`/`setSharedPluginData()` instead.

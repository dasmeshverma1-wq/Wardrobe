# Failure Recovery Playbook

What to do when things go wrong during the Figma build workflow.

---

## 1. MCP / Auth Failures

### Symptom
`use_figma`, `get_screenshot`, or `search_design_system` returns an auth
error or connection refused.

### Fix
1. Check if the Figma MCP server is connected. If an `mcp_auth` tool is
   available, call it so the user can authenticate.
2. Retry the failed call once after auth succeeds.
3. If auth keeps failing, ask the user to re-authenticate the Figma MCP
   server in their IDE settings.

---

## 2. Component Not Found

### Symptom
`search_design_system` returns no results for a component you need, or
`importComponentSetByKeyAsync` throws "not found".

### Fix -- Discovery Ladder
1. Retry with synonyms: "button" -> "btn", "card" -> "tile", "input" ->
   "text field", "nav" -> "navigation" -> "menu" -> "tabs".
2. Inspect existing screens in the file (Step 2a-ii) -- the component may
   be used under a different name.
3. Check all pages -- components may live on a non-default page:
   ```js
   for (const page of figma.root.children) {
     await figma.setCurrentPageAsync(page);
     page.findAll(n => {
       if (n.type === "COMPONENT" || n.type === "COMPONENT_SET")
         results.push(`[${page.name}] ${n.name} key=${n.key}`);
       return false;
     });
   }
   ```
4. If truly missing, mark the component as "manual build" and construct
   it from primitives (Frame + Text + Rectangle). Document what you built
   so the user can replace it with a proper component later.

---

## 3. Variable / Token Not Found

### Symptom
`search_design_system` with `includeVariables: true` returns empty, or the
variable key from an existing screen doesn't import.

### Fix
1. Try shorter fragments and alternate naming: "gray" vs "grey",
   "spacing" vs "space", "color/bg" vs "background".
2. Check local variables: `figma.variables.getLocalVariableCollectionsAsync()`.
   Note: this only returns local vars, not library vars.
3. Check library collections:
   ```js
   const libs = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
   return libs.map(l => ({ name: l.name, key: l.key, lib: l.libraryName }));
   ```
4. If no variables exist at all, use hardcoded values but document each one
   with the intended token name as a comment in the return value:
   ```
   Unresolved tokens:
   - background-primary: used #FFFFFF (hex)
   - spacing-md: used 16px (raw)
   ```

---

## 4. Font Loading Failure

### Symptom
`loadFontAsync` throws "Font not found" or "Font not available".

### Fix
1. Discover available fonts:
   ```js
   const fonts = await figma.listAvailableFontsAsync();
   const matches = fonts.filter(f =>
     f.fontName.family.toLowerCase().includes("inter")
   );
   return matches.map(f => f.fontName);
   ```
2. Use the closest available style. Map common mismatches:
   - "SemiBold" <-> "Semi Bold"
   - "ExtraBold" <-> "Extra Bold"
   - "DemiBold" <-> "Demi Bold"
3. If the exact family is missing, fall back to "Inter" -> "Roboto" ->
   "Arial" in that order.

---

## 5. Script Error in `use_figma`

### Symptom
`use_figma` returns a JavaScript error.

### Fix (STOP-READ-FIX-RETRY)
1. STOP. Do NOT immediately retry.
2. READ the error message carefully.
3. Check common causes:

| Error | Cause | Fix |
|-------|-------|-----|
| "not implemented" | Used `figma.notify()` | Remove it, use `return` |
| "node must be an auto-layout frame..." | Set FILL before appendChild | Move appendChild before layoutSizing |
| "Setting figma.currentPage is not supported" | Sync page setter | Use `await figma.setCurrentPageAsync(page)` |
| Property value out of range | Color > 1 | Divide by 255 |
| "Cannot read properties of null" | Wrong node ID or page | Verify page context and ID |
| "object is not extensible" | Set non-existent property | Check property name in API typings |
| "no setter for property" | Set width/height directly | Use `resize()` |

4. FIX the script based on the error.
5. RETRY. Failed scripts are atomic -- nothing was created, so retry is safe.

---

## 6. Visual Mismatch After Build

### Symptom
Screenshot shows wrong colors, broken layout, clipped text, or missing elements.

### Fix
1. Use `get_metadata` to check structure (hierarchy, node types, property values).
2. Identify whether the issue is structural or visual.
3. Write a TARGETED fix script that modifies only the broken nodes.
   Do NOT rebuild the entire section.
4. Common fixes:
   - **Clipped text**: increase frame height, set `layoutSizingVertical = "HUG"`.
   - **Overlapping elements**: check parent has `layoutMode` set.
   - **Wrong color**: rebind the fill variable or fix the variable key.
   - **Wrong variant**: swap the component instance to the correct variant.
   - **Missing FILL**: set `layoutSizingHorizontal = "FILL"` after confirming
     the node is a child of an auto-layout parent.

---

## 7. HUG/FILL Sizing Collapse

### Symptom
A section or child frame collapses to zero or minimal width/height.

### Fix
- A HUG parent cannot give FILL children meaningful size. Change parent to
  FIXED or FILL first:
  ```js
  parent.resize(TARGET_WIDTH, 50);
  parent.layoutSizingHorizontal = "FIXED";
  // NOW children with FILL will expand
  ```
- `resize()` resets sizing modes to FIXED. Always call `resize()` BEFORE
  setting sizing modes, not after.
- `layoutGrow` on a child of a HUG parent causes compression. Set
  `layoutGrow = 0` or switch parent to FIXED sizing.

---

## 8. Node ID Invalidation After detachInstance

### Symptom
`getNodeByIdAsync` returns null for a node that should exist.

### Fix
`detachInstance()` on a nested instance may implicitly detach the parent,
giving it a new ID. Re-discover nodes by traversal from a stable
(non-instance) parent frame:
```js
const stableFrame = await figma.getNodeByIdAsync(MANUAL_FRAME_ID);
const target = stableFrame.findOne(n => n.name === "TargetName");
```

---

## General Recovery Principle

`use_figma` is atomic -- failed scripts make NO changes to the file.
Previous successful steps remain intact. You can always:
1. Inspect current state with `get_metadata` / `get_screenshot`
2. Fix and retry the failed step
3. Continue from where you left off using returned node IDs

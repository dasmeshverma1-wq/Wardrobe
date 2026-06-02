# Quality Gates Checklist

Run this checklist after each section (per-section gates) and after the full
view is assembled (final gates). Use `get_screenshot` on the node ID to
visually inspect. Use `get_metadata` to verify structure.

---

## Per-Section Gates

Run after building every section in Step 4.

### Visual (screenshot)

- [ ] No clipped or cropped text (line heights cutting off descenders/ascenders)
- [ ] No overlapping elements (elements stacking due to wrong sizing or missing
      auto-layout)
- [ ] No placeholder text still showing ("Title", "Heading", "Button", "Label")
- [ ] Correct component variants used (e.g. Primary vs Neutral button, correct
      size)
- [ ] No blank image frames (if images are expected)
- [ ] Colors match the source -- no obviously wrong fills or text colors

### Structural (get_metadata)

- [ ] Section is a child of the wrapper frame
- [ ] Section uses `layoutSizingHorizontal = "FILL"` (not HUG or FIXED at
      a random value)
- [ ] Component instances have `mainComponent` set (they are real instances,
      not detached frames)
- [ ] Text content matches the source code's actual strings

### Token Usage

- [ ] No hardcoded hex colors when a design-system variable exists
- [ ] No hardcoded pixel spacing when a spacing variable exists
- [ ] Fill colors bound via `setBoundVariableForPaint`, not raw SOLID fills
- [ ] Text styles applied via `textStyleId`, not manual font/size/weight
- [ ] Effect styles applied via `effectStyleId`, not manual shadow effects

---

## Final Gates

Run after all sections are assembled (Step 6).

### Full-View Visual

- [ ] Overall layout matches the source top-to-bottom
- [ ] Sections are in correct order
- [ ] Spacing between sections is consistent
- [ ] Wrapper frame width matches the target device width

### Full-View Structural

- [ ] Wrapper is a VERTICAL auto-layout frame
- [ ] All sections are direct children of the wrapper
- [ ] No orphaned frames outside the wrapper
- [ ] No leftover `placeholder = true` shimmers on any node

### Image Transfer (if NEEDS_CAPTURE was true)

- [ ] All image frames have `fills[0].type === "IMAGE"` with a valid imageHash
- [ ] `generate_figma_design` capture output has been deleted
- [ ] Image scaling mode is appropriate (FILL, FIT, or CROP)

### Output Completeness

- [ ] All sections from Step 1 are present in the wrapper
- [ ] All created node IDs are returned in the summary
- [ ] Unresolved components/tokens are listed explicitly
- [ ] No errors or warnings remain unaddressed

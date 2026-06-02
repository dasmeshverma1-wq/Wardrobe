# Mistakes learned from past /figma-import runs

A running log of imports that needed correction after the user spotted issues. Read this **before** starting any new run, and **append to it** when you finish.

Format: one entry per mistake.
- **Symptom** — what the user said was wrong
- **Root cause** — what I actually did
- **How to catch next time** — concrete check that would have prevented it

---

## 2026-05-22 — Size Preference half-card link (node 11306:56402)

### “Size Preference” link underline looked wrong (solid black vs design)

- **Symptom:** Link button style not similar to Figma — solid underline, wrong colour.
- **Root cause:** Rebuilt underline as `background: #262a39` 1px solid bar. Figma `base button` uses asset Line 47: `stroke="#686B77"`, `stroke-dasharray="4 4"`, `stroke-linecap="round"` under bold `#262a39` label.
- **How to catch next time:** For Fabric `base button` / text links, fetch node `11306:56402` (or child `721:1114`) and use the line SVG asset — don’t assume solid `text-decoration` matches.

---

## 2026-04-28 — Infinite Reco / Products you may like (node 10989:42664)

### MNow logo rendered as two stacked images

- **Symptom:** "Mnow Logo looks incorrect orientation use image instead of correct height"
- **Root cause:** Figma exposed two SVG assets (`IMG_MNOW_1`, `IMG_MNOW_2`). I assumed they were two halves of one logo and stacked them vertically. In reality `IMG_MNOW_1` (viewBox `30.8074 × 10.125`, ~3:1) is the **complete** wordmark, and `IMG_MNOW_2` (viewBox `14.5839 × 8.22141`) is an unrelated smaller element.
- **How to catch next time:** Decode the viewBox of every asset before composing. If one asset has a wide aspect ratio (≥2:1) it's almost certainly the full wordmark — use only that one. Don't stack assets unless the design clearly stacks them.

### Wishlist heart looked stretched

- **Symptom:** "the Wishlist icons youve used looks strecthed"
- **Root cause:** Set `width: 20px; height: 20px` on a heart SVG with viewBox `16.6667 × 15.0003` (≈10% wider than tall). Without `object-fit: contain`, browser stretched the SVG to fill the box.
- **How to catch next time:** Default rule: every `<img class="icon">` gets `object-fit: contain`. Or compute `aspect-ratio` from viewBox and only set one of width/height.

### Product cards had a border + border-radius the design didn't have

- **Symptom:** "the prouduc card should not have Border radius"
- **Root cause:** I added `border: 1px solid var(--grey-200)` and `border-radius: 12px` because cards "usually" have rounded corners. The Figma node had no stroke and no corner radius — the cards bleed edge-to-edge.
- **How to catch next time:** Check the Figma node's `stroke` and `cornerRadius` properties before adding any. Absence of a stroke in the design context = no border in code. Don't apply default "card treatment" assumptions.

### Mixed selection model in pill row (radio vs. checkbox)

- **Symptom:** Initial implementation used radio behaviour for ALL pills. User clarified: first 3 pills are radio (category); last 2 (MNow + Express) are independent checkboxes that move to front when selected.
- **Root cause:** Treated the pill row as one homogeneous group. Didn't differentiate semantics between category and delivery pills.
- **How to catch next time:** When a divider sits inside a row, treat it as a hard semantic boundary — pills on each side may have different selection models. Always confirm interaction model from the Figma variants (e.g. "Mnow / Mnow active" being independent of category state implies checkbox).

### Close button (×) on delivery pills was oversized

- **Symptom:** "The cross bar you've used appears a lot bigger than in original designs correct it"
- **Root cause:** Set `.pill-close` to `width: 14px; height: 14px`, but Figma design spec for the close button container is `16px`, with the actual icon glyph sized at `10px` (18.75% inset from edges).
- **How to catch next time:** When pulling a nested icon from Figma design context, read the **inset** property. A `16px` container with `inset: 18.75%` means the icon should be rendered at `16 × (1 - 2×0.1875) = 10px`. Don't use the outer container size directly.

### Product card images — clarified corner radius from design

- **Symptom:** User said "the product card image have rounded corners" (initially interpreted as a problem), but then clarified "The product card image needs rounded corners not sharp"
- **Root cause:** Misread the initial feedback as a complaint instead of checking Figma spec first. The design clearly shows product images with `border-radius: 12px` to match the card frame.
- **How to catch next time:** When image styling is ambiguous, always pull the Figma design spec (`get_design_context`) before making assumptions. Look at the image container's `cornerRadius` property in the node tree to see if it's inherited from a wrapper (e.g., card border frame) or applied to the image itself.

### Wishlist icon placement and sizing (icon overlay vs. layout integration)

- **Symptom:** "The placement of the wishlist icon is also not correct its shoudln't be on image but witht the Title and also the szie stil doesnt looks accurate"
- **Root cause:** (1) Positioned wishlist icon absolutely on product image (`position: absolute; top: 8px; right: 8px;`) instead of integrating into flex card-info layout. (2) Mistakenly applied inset-calculated dimensions to a non-existent `.wishlist-btn img` child element instead of the `<img class="wishlist-btn">` element itself.
- **How to catch next time:** (1) Layout: Before absolute positioning, check if Figma shows elements as flex siblings. Secondary icons live **inside card-info** alongside text, not floating over images. Restructure: remove absolute positioning, move element as flex sibling, use `flex-shrink: 0` on icon, wrap adjacent content in wrapper with `flex: 1`, use `justify-content: space-between` on parent. (2) Sizing with inset: Calculate dimensions from container size minus inset: if Xpx container with `inset: A% B%`, then width = X × (1 - 2×B%) and height = X × (1 - 2×A%). For 20px with inset 12.5%/8.33% → width = 20 × (1 - 2×0.0833) = 16.668px; height = 20 × (1 - 2×0.125) = 15px. (3) **Critical:** Apply calculated dimensions directly to the icon element itself. If `<img class="wishlist-btn">`, use `.wishlist-btn { width: 16.668px; height: 15px; object-fit: contain; }`, not `.wishlist-btn img { ... }` (which targets non-existent child).

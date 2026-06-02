# Add Item (`/wardrobe/add` + `AddItemSheet`)

> Override file. Inherits from `MASTER.md`. **Tier B — needs a real refresh.**

## Purpose
Bring an item into the wardrobe. Source can be Camera / Gallery / Myntra URL /
Past purchases. We auto-cut the background, classify the category, and let the
user confirm metadata.

## Target style
**Flat Utility.** Fast, predictable, large tap targets. Minimal decoration.

## Source picker (refresh target)
A 4-up grid of source tiles, each with:
- Big icon
- Title
- One-line subtitle
- Tap → opens that source's flow

| # | Source | Icon | Subtitle |
|---|---|---|---|
| 1 | Camera | `CameraIcon` | Snap a photo on a clean surface |
| 2 | Gallery | `ImageIcon` | Pick from your photo library |
| 3 | Myntra URL | `LinkIcon` | Paste a product link or order |
| 4 | Past orders | `BagIcon` | Pull from your Myntra history |

## Preview state
After source picks an image:
- Big preview with the cut-out result
- Detected category chip (editable)
- Detected color swatch (editable)
- Optional brand + name fields (auto-suggest from URL/past orders)
- Big primary "Add to closet" CTA + "Cancel" ghost

## Tier-B refresh targets
- [ ] Build the 4-up source picker
- [ ] Background-removal progress: show the existing pulsing card with copy "Cutting out…"
- [ ] Confidence pip on the category chip (e.g., "Tops · 92%")
- [ ] On error: show the original image + an "Adjust manually" path
- [ ] Save flow: success haptic + return to wardrobe with the new item highlighted briefly

## Anti-patterns
- ❌ Don't lock the user inside a multi-step wizard with no escape
- ❌ Don't auto-categorize without showing the user what we picked

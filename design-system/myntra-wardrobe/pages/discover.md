# Discover (`/discover`)

> Override file. Inherits from `MASTER.md`. **Intentional brand break.**

## Purpose
Tinder-style swipe feed for creator/Myntra-made outfits. Discovery + light
shopping in a single magazine-flavoured surface.

## Style
**Editorial Magazine + Y2K stickers.** This is the only screen in the app that
breaks Fabric for a deliberate magazine vibe.

## Tokens (Discover-only)
- Surface: `surface-cream` (warm cream + Watermelon halo TL + Lilac halo BR)
- Display font: **Fraunces 900**, `letter-spacing: -0.02em`, `line-height: 0.95`
- Hero gradient: `bg-discover-gradient` (Watermelon → mid → Lilac, 135°)
- Card hairline: `border-[1.5px] border-ink`
- Sticker shadow: `shadow-[2px_3px_0_rgba(38,42,57,.22)]` (hard offset)

## Tier-A polish targets
- [ ] Verify legibility at 375px (smallest iPhone SE width)
- [ ] Card titles wrap gracefully — test "Sunset Boho Maxi Dress Look"
- [ ] Pre-delivery sweep: `cursor-pointer`, `aria-label` on Bag pill, focus rings on action stickers
- [ ] Drag stamp opacity: confirm `Math.min(1, |fraction| * 1.1)` curve feels right
- [ ] Reduced-motion: card stack peek + spring transition gracefully degrades
- [ ] Bag pill `Bag · 03` formatting: keep `tabular-nums`
- [ ] Action stickers: confirm 44×44 touch (currently `h-12 px-4` for md, `h-16 px-5` for lg)

## Anti-patterns
- ❌ Don't extend the cream surface to other screens (it's Discover's signature)
- ❌ Don't use Fraunces anywhere else
- ❌ Don't use the gradient as a page backdrop on other screens — it's a sticker accent

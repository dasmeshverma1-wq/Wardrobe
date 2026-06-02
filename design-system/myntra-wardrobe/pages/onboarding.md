# Onboarding (`/onboarding`)

> Override file. Inherits from `MASTER.md`.

## Purpose
First impression. Builds anticipation, explains what the wardrobe does, and
captures three preferences (vibes / occasions / palette).

## Style
**Hero-Centric Storytelling.** Tall illustration on top half, copy below,
single primary CTA. Reference: clean iOS-style first-run flow.

## Step structure (7 total, zero-indexed)
0. Welcome — value prop + bullets
1. Feature: Build your closet (cream stage)
2. Feature: Plan your week (mint stage)
3. Feature: Discover fresh looks (Discover-themed pink/lilac stage)
4. Vibes (chips)
5. Occasions (chips)
6. Palette (5 swatched options)

## Tier-A polish targets
- [ ] Each illustration's SVG has `role="img"` + meaningful `aria-label`
- [ ] Step indicator only renders on preference questions (steps 4-6)
- [ ] Continue/Back buttons: visible focus rings
- [ ] Welcome step: ensure the bullet items render at 375px without truncation
- [ ] Last step "Open my wardrobe" CTA: leadingIcon size matches Continue

## Anti-patterns
- ❌ Don't show progress bar on feature explainer steps (info-only)
- ❌ Don't autoplay any animations on first paint (respect `prefers-reduced-motion`)
- ❌ Don't trap users — the header "Skip" must always work

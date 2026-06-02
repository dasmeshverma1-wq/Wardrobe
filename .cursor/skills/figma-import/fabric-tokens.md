# Fabric Tokens — pointer

The canonical Fabric design system reference lives at:

**[/Users/harsh.patel1/Documents/Vault/Vault/shared/design-system.md](../../../Vault/shared/design-system.md)**

Read it for: full token tables (color / spacing / radius / typography), variable keys, component keys, library keys, primitive palette, theme overrides.

## Why a separate file used to live here

This file used to duplicate the Fabric token table. It's now a pointer — keeping the data in two places caused drift. Edit the vault doc; the skill picks up the change on next invocation.

## Quick rules (the irreducible bits)

1. **Use semantic tokens, not primitives.** `background-action` over `watermelon-600`, `layout-spacing-loose` over `spacing-200`.
2. **Token decision order.**
   - Figma node has a bound variable → resolve via `get_variable_defs`, use the matching code token.
   - Figma uses a raw hex that matches a Fabric token → use the token name.
   - No match → write the raw value with a comment, log under "Unresolved" in the summary.
3. **Don't bind "close enough."** `#ff3f6c` is `background-action`. `#ff3f6d` is unresolved.
4. **The vault doc is the single source of truth.** When Fabric changes, update the vault doc, not this file.

## Code-side token files

Where Fabric tokens land in code (depending on stack):

- **Tailwind:** extend `theme.colors` and `theme.spacing` in `tailwind.config.js` with semantic names (e.g. `colors: { background: { action: '#ff3f6c' } }`).
- **CSS variables:** `:root { --background-action: #ff3f6c; --layout-spacing-loose: 16px; ... }`.
- **React Native:** single `theme.ts` file with hex values (RN can't consume CSS vars).
- **Vault HTML prototypes:** define on `:root` so prototypes stay self-contained.

If the project doesn't have a token file, add only the tokens you used (don't bulk-import) and reference them from JSX — never scatter raw hexes.

# Fabric Tokens — pointer

The canonical Fabric design system reference lives at:

**[/Users/harsh.patel1/Documents/Vault/Vault/shared/design-system.md](../../../Vault/shared/design-system.md)**

Read it for: full token tables, **variable keys** (for `importVariableByKeyAsync`), **component keys** (for `importComponentByKeyAsync` / `importComponentSetByKeyAsync`), library keys (for `search_design_system` scoping), primitive palette, theme overrides.

## Why this file is a pointer

The vault doc holds the cached variable/component keys. Caching them in two places caused drift. Edit the vault doc; this skill picks up the change on next invocation.

## Quick rules for /figma-export (code → Figma)

1. **Bind by key, not by hex.** Use `importVariableByKeyAsync(KEY)` from the catalog in the vault doc. Hex matching is a fallback when the key cache is stale.
2. **Component-first.** Before building a button / pill / snackbar from primitives, check the component-key table in the vault doc and `importComponentByKeyAsync(KEY)`.
3. **Library scoping.** When discovering new components/variables not in the cache, use `search_design_system({ includeLibraryKeys: [...] })` with the right sub-library key (Fabric, Buttons v0.1, Pills v0.1, etc. — see vault doc).
4. **Token decision order.**
   - Source uses an explicit token name → bind the matching variable.
   - Source uses a raw value that matches a Fabric token → bind the variable.
   - No match → SOLID paint or raw number, log under "Unresolved tokens" in the build summary.
5. **Never "close enough."** `#ff3f6c` binds to `background-action` (key `7985a639…`). `#ff3f6d` is unresolved.

## Spacing — the named-vs-numeric trap

Fabric's *semantic* spacing layer is **named** (`layout-spacing-tight`, `layout-spacing-loose`, `layout-spacing-xl`, …), not numeric. The numeric primitives (`spacing-100 = 8`, etc.) live in the `Primitives v0.1` library and should only be used as a last-resort fallback.

When the source code uses a raw px value that matches a semantic name's effective px, **bind the semantic name**. Don't bind to the numeric primitive.

## Updating the cache

If `importVariableByKeyAsync` throws "not found" for a key in the vault doc, Fabric likely shipped a rename. Re-discover via `search_design_system`, update the vault doc, bump `updated:`.

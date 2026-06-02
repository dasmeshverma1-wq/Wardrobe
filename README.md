# Myntra Digital Wardrobe & Outfit Planner

A high-fidelity, parallel **Figma file** and **web prototype** for a new Myntra feature: digitize your closet, mix owned items with the Myntra catalog, plan looks against the weather, swipe through curated creator and Myntra-made outfits, and share OOTDs as image cards.

This repo is the v1 (Core MVP) deliverable. AI Try-On, Complete-the-Look bag flow, packing lists and laundry tracking are represented in the design and the navigation as "Coming soon" — the data shapes leave room for them.

---

## What's in the box

- **Figma file**: [Myntra Digital Wardrobe](https://www.figma.com/design/pAg1GnIlWiHeMF7IlXd3Jy) — 5 pages: Cover, Foundations (tokens, type, spacing, radii), Components (Button, Chip, ItemCard, OutfitCard, CalendarCell, WeatherChip, BottomNav with variants), Screens (7 mobile screens), and User Flow.
- **FigJam diagram**: [User Flow](https://www.figma.com/board/gyMbGmrMlNGBE4CkbI231c) — interactive PRD §6 flowchart.
- **Web prototype**: Vite + React + TypeScript + Tailwind, mobile-sized viewport, runs in any modern browser, demoable offline once dependencies are installed.
- **Design system**: persisted to `design-system/myntra-wardrobe/` (Master + per-page overrides) — generated and refined with the [`ui-ux-pro-max`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) skill, then fused with Myntra Fabric tokens.

---

## Run it

Prerequisites: **Node 18+**, **npm 9+**.

```bash
npm install
npm run dev
# open http://localhost:5173 — viewport is mobile-sized (max 440px)
```

Production build / preview:

```bash
npm run build
npm run preview
```

Tests + typecheck:

```bash
npm run lint     # tsc --noEmit
npx vitest run   # 31 tests across 5 suites
```

---

## Publish (GitHub + live page)

This project ships with a **GitHub Pages** workflow (`.github/workflows/deploy-pages.yml`). After you push to `main`, the site is built and published automatically.

### 1. Create the repository

Remote for this project: [github.com/dasmeshverma1-wq/Wardrobe](https://github.com/dasmeshverma1-wq/Wardrobe)

### 2. Push this project

```bash
cd /Users/dasmesh.verma1/Wardrobe
git remote add origin https://github.com/dasmeshverma1-wq/Wardrobe.git   # skip if already added
git push -u origin main
```

If GitHub asks you to sign in, use a [Personal Access Token](https://github.com/settings/tokens) as the password (HTTPS), or set up [SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh).

### 3. Enable GitHub Pages

In the repo on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

After the first workflow run succeeds, the app is live at:

`https://dasmeshverma1-wq.github.io/Wardrobe/`

### Local preview (Pages base path)

```bash
GITHUB_PAGES=true GITHUB_REPOSITORY_NAME=Wardrobe npm run build
npx vite preview
```

---

## App structure

The app has **four bottom-nav tabs** plus an immersive flow:

| Tab | Route | What it does |
|---|---|---|
| **Closet** | `/wardrobe` | Your wardrobe with three segments — Closet (items by category), Outfits (saved looks), Sets (curated themed groupings). Sticky filter chrome, multi-select to start a Studio session, FAB to add an item, Settings cog in the top-right. |
| **Discover** | `/discover` | Tinder-style swipe feed of creator and Myntra-made outfits. Editorial cream surface with Watermelon→Lilac gradient stickers. Save / Pass / Mix; tap a card's "Shop" pill to push items into the cart. |
| **Studio** | `/studio` | Mode picker — opens as a half-card sheet from the closet (`Create outfit`) or as a fallback page. Three modes: Collage (freeform), Mix and Match (swipe-to-cycle on body zones), AI Try-On (Coming Soon). |
| **Planner** | `/planner` (week) `/planner/month` | No-scroll glance views. Editorial month name + chevrons + jump-to-today; calendar grid distributes rows from parent height. Below the calendar: a "Look of the month" row showing the most-pinned outfit. |

First-run users land on **Onboarding** (`/onboarding`) — a 7-step flow: Welcome + 3 feature explainers (Closet / Planner / Discover with illustrated stages) + 3 preference questions (vibes, occasions, palette). Replayable via Settings → "Replay welcome tour".

---

## Demo script (≈ 5 minutes)

1. **Onboarding** — first run shows the welcome hero, three illustrated feature explainers, and the three preference questions. Tap **"I'll do this later"** to skip and land on the wardrobe.
2. **Closet (Wardrobe Home).** Twelve seeded items are already there. Show the segmented `Closet · Outfits · Sets` tabs, the search input, the filter cog (with badge for active filter count), and the Settings cog (top-right user icon).
3. **Settings drawer.** Tap the user icon → see the style profile preview, quick stats, and three actions: Edit preferences, Replay welcome tour, Reset everything (full wipe with confirm).
4. **Add an item.** Tap `+` → the source picker opens with four 4:5 tiles (Camera, Gallery, Link, Past orders). Pick **Gallery**, choose a photo, watch the in-browser background-removal model run (first run downloads ~10 MB and caches). Review the auto-tagged category + brand and save.
5. **Build an outfit.** Tap **Select** on the Closet, pick a top, a bottom, footwear and a bag. The floating selection bar shows your composition hint ("1 top · 1 bottom · 1 footwear · 1 bag"). Tap **Create outfit** — a half-card sheet slides up with the three modes.
6. **Mix and Match.** Tap into Mix and Match — items distribute by category onto the mannequin zones automatically. Swipe left/right on any zone to cycle through items in that category, or tap the small chevrons. Position pills below each zone show "1 of 3". Save a look.
7. **Collage.** Reopen Selection mode, pick the same items, tap **Collage**. Drag, rotate, layer items on the canvas. Tap a background swatch (cream, lilac, ink, etc.). The black active-layer chip shows the selected layer's brand + z-index.
8. **OutfitDetail.** After saving, you land on a detail screen with an editorial 28px black-weight title (tap to rename), eyebrow line ("Mix and Match · 5 pieces"), pinned-date pill if planned, item carousel, "Complete the look" rail with mock CTL recommendations, and a sticky `Plan / Share / Wear today` action footer.
9. **Share.** Tap **Share** — Web Share API opens the native sheet on supported browsers, otherwise the PNG downloads.
10. **Plan.** From OutfitDetail tap **Plan** → date picker → pin. Open the Planner: the **Week view** has a 7-day strip with weather temps inline and a hero outfit panel that flexes to fill the viewport. Tap a day to switch the panel without scrolling.
11. **Month view.** Switch to month → see big editorial "May / 2026", calendar with outfit thumbs and per-day temperatures, and a slim "Look of the month" row showing the most-pinned outfit with its plan count. No vertical scroll on either planner.
12. **Discover.** Tap the Cards icon in the bottom nav — eight curated outfits from Myntra Studio and creator handles. Swipe right to save, left to pass, or tap the Bag CTA inside the card to push the items into the cart. The bag pill in the top-right shows the running count.
13. **Sets.** Back on the Closet, switch to the **Sets** segment → tap **+** to create a themed collection ("Beach Day", "Office Layers"), name it, multi-select items, save. Tap a set to see its 2×2 mosaic and edit/remove items.

---

## Architecture (web)

```
src/
  app/
    layout.tsx                # Mobile shell + bottom nav + bootstrap
    routes.tsx                # React Router routes
    OnboardingGate.tsx        # Redirects first-run users to /onboarding
    useBootstrap.ts           # Hydrate stores, seed wardrobe
  pages/
    Onboarding.tsx            # 7-step flow (welcome / 3 explainers / 3 questions)
    WardrobeHome.tsx          # Closet/Outfits/Sets segments, FAB, multi-select
    AddItem.tsx               # 4-tile source picker → Camera / Gallery / Link / Past Purchases
    Discover.tsx              # Tinder-style swipe feed (editorial surface)
    StudioModePicker.tsx      # Standalone fallback (sheet version is StudioModeSheet)
    CollageCanvas.tsx         # react-rnd drag/resize/rotate + bg swatches
    DressingRoom.tsx          # "Mix and Match" — swipe-to-cycle on body zones
    OutfitDetail.tsx          # Editorial title, items, share, add-to-planner, CTL
    PlannerMonth.tsx          # Editorial month + flex-1 calendar + look-of-month
    PlannerWeek.tsx           # WeekNav + DayStrip + flex-1 outfit panel
    ComingSoon.tsx            # AI Try-On placeholder with "Notify me"
  components/
    ui/                       # Button, Chip, Tabs, Sheet, Modal, FAB, BottomNav, TopNav, Toast, EmptyState, SelectionBar, Icon
    onboarding/               # FeatureIllustrations, WardrobeHero
    wardrobe/                 # ItemCard, OutfitCard, CollectionCard, AddItemSheet, FilterSheet, SettingsSheet, CreateCollectionSheet, CollectionDetailSheet, BgRemovalProgress, QuotaBanner, CompositionHintBar, ColorFilter, SavedCelebration
    discover/                 # OutfitSwipeCard
    studio/                   # CanvasItem, MannequinZones, StudioModeSheet
    planner/                  # CalendarMonth, CalendarWeek, DayStrip, WeatherChip, DayDetailSheet, AddToPlannerSheet, usePlannerWeather
  store/
    wardrobeStore.ts          # zustand + lsSave + IndexedDB image refs
    outfitStore.ts            # saved outfits with thumbnails
    plannerStore.ts           # date → outfitId pins
    profileStore.ts           # onboarding answers (vibes, occasions, palette)
    chromeStore.ts            # immersive / selecting flags (drives BottomNav visibility)
    collectionsStore.ts       # themed sets of wardrobe items
    cartStore.ts              # in-memory cart for Discover Shop CTA
    discoverStore.ts          # liked / passed / history (for rewind)
  lib/
    storage.ts                # idb-keyval (images) + localStorage (metadata)
    bgRemoval.ts              # @imgly/background-removal + naive fallback + warmup
    image.ts                  # downscale, dominant colour, naive bg remove
    categorize.ts             # keyword + aspect-ratio heuristic
    color.ts                  # HSL bucketing + complementary lookup
    weather.ts                # Open-Meteo client + mock + advice rules
    completeTheLook.ts        # Mock CTL ranking heuristic (color + missing categories)
    share.ts                  # html2canvas + Web Share API + download fallback
    telemetry.ts              # No-op-by-default event tracker
    cn.ts, id.ts
  data/
    seed.ts                   # 12 inline-SVG seed items
    seedImages.ts             # tee, pants, jacket, dress, sneaker, heel, bag, sunglasses, turtleneck, skirt, kneeBoot, coat, watch
    myntraSamples.ts          # 6 fake "past purchase" products
    creatorOutfits.ts         # 8 curated outfits for Discover
  types/index.ts              # WardrobeItem, Outfit, CanvasNode, PlannerEntry, ForecastDay, Category, StyleProfile

design-system/
  myntra-wardrobe/
    MASTER.md                 # Brand tokens + component contracts + pre-delivery checklist
    pages/
      wardrobe.md, planner.md, discover.md, mix-and-match.md,
      collage.md, outfit-detail.md, onboarding.md, add-item.md
```

Brand tokens live in `tailwind.config.ts` (Watermelon `#FF3F6C` + Lilac `#6E5DC6` + Fabric grey scale) and mirror the Figma variables. Discover-only tokens (`accent-cream`, `accent-paper`, `bg-discover-gradient`) live alongside but are intentionally off-system.

---

## Honest limitations (v1)

- **Background removal**: `@imgly/background-removal` is ONNX in-browser. The first run downloads ~10 MB of WASM + model — that's the bulk of the bundle size warning. If the CDN is blocked or memory is constrained, the app silently falls back to a naïve white-pixel cutout (good for studio photos, weak on noisy backdrops).
- **Auto-categorization is rule-based, not ML.** Filename + URL keywords + aspect ratio heuristics. Practical accuracy ~70 % on common items; the Review step always lets you override.
- **Weather** uses Open-Meteo (no API key) with geolocation. If permission is denied or offline, we fall back to a fixed Bengaluru forecast and label it `(sample)` in the strip.
- **No backend.** All state is local; nothing syncs across devices and there is no real "Myntra past purchases" feed — the **Past orders** tile in Add Item shows six hard-coded sample products. The cart is local too — Bag pill just confirms "Added X items" and doesn't hand off to Myntra checkout.
- **Web Share API** is feature-detected. Mobile Safari and supporting Chromiums get a native share sheet; everything else falls back to downloading the PNG.
- **AI Try-On** is intentionally a "Coming soon" screen with a "Notify me" CTA — the design and nav reference exist so the full vision reads, without faking the capability.
- **Storage quota**: A `QuotaBanner` warns at ≥75% of `navigator.storage.estimate()`, severe at ≥90%. Cleanup is manual (delete items from the closet).
- **Haptics**: Mix and Match fires `navigator.vibrate(8)` on each commit. Works on Android Chrome; iOS Safari silently ignores it.
- **Discover swipe haptic**: deliberate omission — vibrating on every card commit was too noisy in testing.

---

## Accessibility baseline

Every interactive element across the app gets:

- Visible focus rings (`focus-visible:ring-2 ring-primary/30`)
- 44×44 minimum tap targets (icon-only buttons, calendar chevrons, day cells)
- `aria-label` on icon-only controls; `aria-pressed` on toggles; `aria-current` on tabs/dates
- `prefers-reduced-motion` respected globally — decorative animations collapse to ~0ms while functional motion (drag, swipe, springback) stays
- All onboarding illustrations have `role="img"` + descriptive `aria-label`
- Mix and Match swipe carousel has `aria-roledescription="carousel"` + `aria-live="polite"` position announcements
- Bottom nav uses `role="navigation"` + `aria-current="page"`

---

## v2 roadmap

Already structurally accommodated by the data shapes:

1. **AI Try-On (Mode 3)** — swap the mannequin in DressingRoom for a video/render pipeline. `Outfit.mode` already supports a new enum value. The "Notify me" CTA on `ComingSoon` collects intent.
2. **Complete-the-Look real recommendations** — replace the mock rail in `OutfitDetail.tsx` with an API call keyed off `WardrobeItem.dominantColor` + `category`. The heuristic in `lib/completeTheLook.ts` is a placeholder.
3. **Real Myntra cart hand-off** — Discover's "Shop" CTA already aggregates items into `cartStore`; v2 wires it to the Myntra checkout deep-link.
4. **Packing Lists** — a new view that filters outfits by date range and lists their constituent items; reuses `plannerStore` + `collectionsStore`.
5. **Wear Tracker** — `WardrobeItem.timesWorn` and `lastWornAt` are already populated when a planned outfit hits "today"; surface "haven't worn this in 60 days" prompts in the closet grid.
6. **Collaborative lookbooks & DMs** — would require auth + a service layer, currently out of scope.
7. **Dark mode + theming** — Figma variables are already structured Light-mode-first; add a Dark mode and bind code-side tokens to CSS variables.

---

## Tech choices, briefly

- **Vite + React + TS**: fast HMR, zero-config TS, easy to run in any dev sandbox.
- **Tailwind**: tokens map 1:1 to Figma variables, keeps the prototype visually faithful with minimal bespoke CSS. Fraunces serif loaded only for the editorial Discover surface.
- **Zustand**: 8 stores, no boilerplate, ergonomic across pages. Persist via the local `lsLoad/lsSave` adapter (localStorage for metadata, IndexedDB for image blobs).
- **react-rnd** for Collage (drag + resize + bounded movement) and **@dnd-kit/core** for legacy Dressing Room drag (now replaced by pointer-event swipe in Mix and Match).
- **@imgly/background-removal**: only realistic option for in-browser, no-API-key background removal. Falls back gracefully.
- **Open-Meteo**: free, no auth, simple JSON. Cached for an hour in localStorage.
- **html2canvas**: ubiquitous and works on Safari for our share-as-image flow.
- **Vitest + jsdom**: 31 tests across stores (`discoverStore`, `collectionsStore`), color bucketing, categorization, weather advice.

---

## Figma file map

| Page          | Contents |
|---------------|----------|
| Cover         | Feature title, version (v1.0 MVP), owner |
| Foundations   | Color (12 primitives + 13 semantics), Type (10 styles), Spacing (7 steps), Radii (5 steps) |
| Components    | Button (5 variants), Chip (4 variants), ItemCard (3 variants), CalendarCell (4 variants), WeatherChip (4 variants), BottomNav, OutfitCard (2 variants) |
| Screens       | Wardrobe Home, Add Item (Camera), Studio Mode Picker, Collage Canvas, Dressing Room, Planner Month, Outfit Saved |
| User Flow     | 10-step horizontal flow (PRD §6) + Commerce hooks callout. Links out to the FigJam interactive diagram. |

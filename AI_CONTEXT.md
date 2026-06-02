# Myntra Digital Wardrobe & Outfit Planner — Developer & AI Context

This document is designed to give external AI models (like Claude, Gemini, GPT, Cursor, or Copilot) and developers a complete, high-fidelity context of the application architecture, file relationships, state schema, and interface mechanics in this workspace.

---

## 🚀 How to Feed This File to an AI Model
When initiating a session with a new AI model for this codebase, prepending your query with the following prompt is highly recommended:
> *"Please read `AI_CONTEXT.md` in the workspace root. It contains the exact structural overview of the project, routing guards, state managers, component interfaces, styling rules, and recent layout fixes, so we can pair program without needing to scan every file."*

---

## 📂 Project Directory Structure

```
/
├── WARDROBE_CLOSET_V2.md     # Architectural V2 specific specifications file
├── AI_CONTEXT.md             # This file (Complete context mapping for AI models)
├── README.md                 # Original MVP installation & feature documentation
├── package.json              # Project dependencies (React 18, React Router, Vite, Tailwind, Zustand)
├── tsconfig.json             # TypeScript compiler rules
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Shell wrapping bottom nav and notification banners
│   │   ├── routes.tsx        # React Router routes mapping
│   │   └── OnboardingGate.tsx # Reroutes first-run users or enforces V2 bypass
│   ├── pages/
│   │   ├── Home.tsx          # V2 single-screen dashboard & V1 legacy redirect
│   │   ├── TryOnStudio.tsx   # Overhauled 5-step camera setup & generation Fitting Room
│   │   ├── WardrobeHome.tsx  # Legacy V1 closet grid and categories views
│   │   ├── Onboarding.tsx    # 7-step welcome/preference profiling walkthrough
│   │   ├── CreateOutfit.tsx  # Studio launcher sheets
│   │   └── DressingRoom.tsx  # Mannequin swipe-to-cycle editor ("Mix & Match")
│   ├── components/
│   │   ├── ui/               # Primary visual widgets (Button, Icons, SelectionBar, Tabs)
│   │   ├── wardrobe/         # FilterSheet, SettingsSheet, ItemCard, QuotaBanner
│   │   └── home/             # SuggestionCard, CompleteYourClosetWidget, etc.
│   ├── store/
│   │   ├── chromeStore.ts    # Layout active settings (version toggles)
│   │   ├── wardrobeStore.ts  # Garment selections and categories indices
│   │   ├── tryOnStore.ts     # Selfies, body-shots, and generated look results
│   │   └── outfitStore.ts    # User outfit lists
│   ├── lib/
│   │   ├── recommend.ts      # Logic for outfit matching
│   │   └── share.ts          # Native shares and image saving hooks
│   └── data/
│       ├── seed.ts           # Sample wardrobe images
│       └── myntraSamples.ts  # Mock catalog products and price formatters
```

---

## 🔄 Dual-Version Wireframe Layout (V1 vs V2)

The application supports two layout layouts toggled inside the settings drawer:
1. **V1 (Legacy MVP):** Multi-screen flow with bottom tab bar (`BottomNav` containing Closet, Discover, Studio, and Planner pages) and a required 7-step onboarding profiling sequence.
2. **V2 (Single-Screen Closet Dashboard):** A single unified home screen bypassing onboarding. Bottom navigation and tab structures are hidden. Legacy routes `/planner`, `/discover`, `/wardrobe` are intercepted and redirected back to `/home`.

### Global State Toggle
Controlled in `src/store/chromeStore.ts` via the key:
*   `wireframeVersion: 'v1' | 'v2'` (default is `'v2'`)

---

## 📱 V2 Screen Architecture (`src/pages/Home.tsx` -> `HomeV2`)

The V2 dashboard consolidates all wardrobe interactions. It features a static fixed header and a body scroll container with a sticky tab navigation block.

```
+-------------------------------------------------------------+
| [ArrowLeft]   Wardrobe Closet            [Settings/Profile] |  <-- Fixed Header (z-30)
+-------------------------------------------------------------+
|                                                             |
|  Today's Outfit Recommendation Card / Weather recommendation|  <-- Scroll Area Body
|                                                             |
|  +-------------------------------------------------------+  |
|  |     Suggestions    |            Closet                |  |  <--- Sticky Group (z-20)
|  | - - - - - - - - - - - - - - - - - - - - - - - - - - - |  |       (top-0 on scroll)
|  |  [ Search closet... ]  [FilterBtn]  [SelectBtn]       |  |
|  |  [All] [Tops] [Bottoms] [Footwear] ... (Bubble bar)   |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  [Suggestions Content: Promo Cards / Complete Your Closet]  |  <-- Swaps content below
|  - OR -                                                     |      sticky panel
|  [Closet Grid: 3-column items list]                         |
|                                                             |
+-------------------------------------------------------------+
```

### Key V2 Components and Layout Rules

#### 1. Header Layout
*   Contains a simulation "Back to Profile" navigation button styled as a circular border with `ArrowLeftIcon` (arrows left).
*   Center-aligned or left-aligned Title: `"Wardrobe Closet"`.
*   Right-aligned Profile thumbnail that opens `SettingsSheet.tsx`.

#### 2. Sticky Tab & Filter Group (Resolved Layout Bug)
*   **Structure:** The tab tabs, input search bar, action selectors, and horizontal categories bubble row are locked inside a unified container with styling:
    `sticky top-0 z-20 bg-bg border-b border-divider pb-2.5`
*   **Why this style was chosen:** Putting the bottom border and padding directly on the parent sticky container prevents the Closet active tab underline/indicator from overlapping the top curve of the `Search your closet` input field on scroll.
*   **Sequence:** Under the tab container, the Closet query form is laid out sequentially without nested absolute wrappers:
    ```tsx
    <div className="flex items-center gap-2 px-5 mt-3 bg-bg">
      <input className="search-field h-10 w-full ..." />
      ...
    </div>
    ```

#### 3. Complete Your Closet Widget (`CompleteYourClosetWidget`)
*   Positioned inside the **Suggestions** tab.
*   Pairs the first item in the user's wardrobe (`items[0]`) with a sample recommendation from `MYNTRA_SAMPLES` belonging to a different category.
*   Renders a card preview of both items side-by-side with a Plus sign icon.
*   Clicking the card triggers the Try-On flow (`/studio/try-on`) pre-seeded with both items.

#### 4. Weather suggestions
*   Pulls from `usePlannerWeather` geolocation or Bengaluru sample fallback.
*   Hot temperature suggestions recommend light clothes (shorts/sandals); cold temperature recommendations advise layering (jackets/hoodies).

---

## 🎨 Virtual Try-On Studio Flow (`src/pages/TryOnStudio.tsx`)

The Virtual Try-On Studio provides an immersive walkthrough consisting of model configuration steps, simulated image rendering, and a final Fitting Room environment.

### 1. The 5-Step Avatar Onboarding Wizard
Controlled by the state value `avatarStep: AvatarStep`:
1.  `selfies-intro`: Explains selfie capture guidelines with front/side template squares.
2.  `selfies-camera`: Opens full-screen live webcam context using an oval viewfinder overlay cutout. Prompts capturing selfie 1 and selfie 2.
3.  `body-intro`: Guides body shots (front/side layouts).
4.  `body-camera`: Webcam view rendering a rounded-rectangular silhouette helper frame. Prompts capturing body-shot 1 and body-shot 2.
5.  `review`: Displays a 2x2 grid of the captured photos. Includes overlay buttons styled with dark-red borders (`border-error`) labeled `Retake` on top of each snapshot, enabling instant camera recaptures.

### 2. Staged Generation Simulation (`StagedGeneratingView`)
When the user confirms their pictures, the app enters the `'generating'` phase:
*   **Staged Loader:** Transitions through four sequential loader descriptions (Initializing, Mapping proportions, Stitching fabrics, Rendering output) over a simulated timeframe.
*   **Aesthetics:** Multi-colored background transitions (indigo, purple, pink glows) accompanied by concentric pulsing ring waves and a ticking percentage scale.
*   **Image Blur Effect:** The target preview image is blurred progressively as the stages load:
    *   Stage 1: `blur-[4px]`
    *   Stage 2: `blur-[8px]`
    *   Stage 3: `blur-[12px]`
    *   Stage 4: `blur-[16px]`

### 3. The Fitting Room (`'pick'` / `'result'` Phase)
Once generated, the screen switches to the digital mannequin fitting view:
*   **Character Canvas:** Features a borderless, transparent-blended render of the outfit overlay:
    *   Maximum viewport width constrained using: `max-w-[420px]`
*   **Comparison Trigger:** "Hold to Compare" button floating in the bottom-right corner.
*   **Picked items lists:**
    *   Items are represented inside responsive garment cards: `w-full max-w-[342.75px]`.
    *   Cards include a close button overlaying the top-right corner using a dark-blue circular wrapper, close icon size 9, and watermelon pink hover background (`hover:bg-[#ff3f6c]`).
*   **Closet select drawer:** Opens to add new items. Multi-select is active, and the drawer stays open on click to allow fast successive selections instead of closing immediately.

---

## 📦 Global State Stores (`src/store/`)

State properties are managed globally via Zustand stores. Below are key stores used for layout and closet states:

### 1. Layout Store (`src/store/chromeStore.ts`)
*   `wireframeVersion: 'v1' | 'v2'`: Controls whether the app shows V1 bottom navigation/onboarding or the V2 dashboard layout.
*   `isSelecting: boolean`: Syncs selection mode status to dynamically hide the bottom navigation menu.

### 2. Wardrobe Store (`src/store/wardrobeStore.ts`)
*   `items: WardrobeItem[]`: List of garments in the user's closet.
*   `activeCategory: Category | 'all'`: Active category filter value.
*   `selectedIds: Set<string>`: Set of selected items for batch actions.
*   `toggleSelect(id: string)`: Adds/removes a garment ID from selections.
*   `clearSelection()`: Wipes selection cache.

### 3. Try-On Store (`src/store/tryOnStore.ts`)
*   `avatar`: References the active selected avatar metadata.
*   `selfies`: Array containing paths or base64 files of selfies.
*   `bodyShops`: Array containing captured body photos.
*   `generationResult`: Blended canvas image resulting from the compositor.

---

## 🛠️ Build and Development Tools

Ensure you run these commands at the root folder `/Users/dasmesh.verma1/Wardrobe`:

*   **Install Dependencies:** `npm install`
*   **Vite Dev Server:** `npm run dev` (Runs locally on `http://localhost:5173/` or `5175/` depending on active ports)
*   **Type Checker:** `npx tsc --noEmit`
*   **Production Build Bundle:** `npm run build`
*   **Linter Checks:** `npm run lint`
*   **Unit Tests Suite:** `npx vitest run` (Validates weather recommendation advice, stores, and color bucketing)

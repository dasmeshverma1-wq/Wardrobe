# Wardrobe Closet V2 & Try-On Studio Architecture

This document provides a complete context and architectural overview of the Wardrobe Closet V2 single-screen dashboard and the overhauled Virtual Try-On Studio. Use this guide to quickly understand the flow, routes, layout rules, state keys, and visual designs in this codebase.

---

## 1. V2 Single-Screen Dashboard Layout (`/home`)

To simplify user interactions, the system supports a single-page consolidated wireframe interface (**V2**), toggled via the profile settings pane.

### Core Layout Specifications
- **No Bottom Navigation:** In V2, the standard bottom tab bar (`BottomNav`) is hidden. All legacy tabs are bypassed.
- **Onboarding Bypass:** The onboarding gates are skipped in V2, routing the user directly to `/home`.
- **Legacy Route Guard:** Any attempts to navigate directly to `/planner`, `/discover`, or `/wardrobe` are intercepted and redirected back to `/home` immediately.
- **Header Top Layout:**
  - Standard Back button: Shows a straight horizontal left-pointing arrow (`ArrowLeftIcon`) styling a simulated "Back to Profile" toast.
  - Header text: `"Wardrobe Closet"` centered/left-aligned.
  - Settings Button: Accesses the settings sheet containing the Active Layout Toggle control.
- **Scroll & Sticky Pinned Headers:**
  - The top `<header>` remains static and fixed at the very top of the page viewport.
  - Just below the header, a scrollable container (`.scroll-area`) scrolls the page content.
  - Inside the scroll container, a combined Tab switch bar (`Suggestions` and `Closet`) and search/filter panels are wrapped in a single parent container styled with `sticky top-0 z-20 bg-bg`.
  - When scrolling down, the tabs and closet search filters lock directly below the fixed header without collision clipping or overlap. The items grid scrolls underneath them.

### Double-Tab View Control
1. **Suggestions Tab:**
   - **Today's Outfit:** Displays the planned look card containing the day's temperature forecast chip, item stats, and edit links.
   - **Daily weather suggestion card:** Advises appropriate fabric/outfit tips dynamically depending on whether it is warm or cool.
   - **AI Try-On quick access button:** Navigates directly into the Try-On Avatar onboarding flow.
   - **Complete Your Closet widget:** Pairs the first item in the user's closet with a matching product from Myntra catalog samples (`MYNTRA_SAMPLES`) of a different category. Click triggers virtual try-on with both garments.
   - **Suggested For You / Your Outfits rails:** Displays carousel collections.
2. **Closet Tab:**
   - **Search Input Field:** Search items dynamically by title, category, or brand.
   - **Filter trigger:** Opens the drawer sheet to filter by color or source type (Myntra catalog vs uploaded).
   - **Select Mode button:** Toggles item multi-select.
   - **Category filters row:** Clean horizontal scrolling bubble row. Space bounds are padded with `px-2 py-2 -mx-2` to prevent active hover rings from clipping.
   - **Closet items grid:** Displays 3 columns of garment thumbnails. Clicking item toggles selection.

---

## 2. Overhauled Virtual Try-On Studio Flow (`/studio/try-on`)

The onboarding avatar setup wizard has been simplified into a 4-step photo capture walkthrough and a final review screen.

### Step-by-Step State Flow
- **Step 1: Take Selfies (`selfies-intro`)**
  - Prompt to upload or snap two face selfie profiles (front and side).
  - Displays two square boxes side-by-side representing the preview placeholders.
- **Step 2: Selfie Camera (`selfies-camera`)**
  - Displays full-screen live webcam feed.
  - Guides capturing: "Selfie 1 of 2" and "Selfie 2 of 2" consecutively.
  - Renders a clean vertical oval viewfinder cutout layout.
- **Step 3: Take Body Shots (`body-intro`)**
  - Prompt to upload or capture two full body shots (front and side profiles).
  - Displays two preview placeholders.
- **Step 4: Body Camera (`body-camera`)**
  - Displays full-screen webcam feed with a rounded-rectangular silhouette guide.
  - Guides capturing: "Body Shot 1 of 2" and "Body Shot 2 of 2" consecutively.
- **Step 5: Review (`review`)**
  - Grid showing Selfie 1/2 and Body Shot 1/2 side-by-side.
  - Red-bordered `Retake` buttons overlay the preview thumbnails to support one-click camera retakes.
  - Confirm triggers avatar generation.

### AI Generation & Fitting Room
- **Simulated loading stages (`StagedGeneratingView`):**
  - Background colors transition between deep indigo, purple, and accent glows.
  - Features concentric pulsing concentric animated ring waves and dynamic percentage load text.
  - The avatar preview image is blurred progressively as stages increment (from `blur-[4px]` at Stage 1 up to `blur-[16px]` at Stage 4).
- **Fitting Room (`pick` phase):**
  - Displays a borderless, frame-less, transparent-blended lookbook render of the try-on output.
  - The maximum size of the resulting canvas image is set to `max-w-[420px]`.
  - Floating compare trigger ("Hold to Compare") displays on the bottom-right corner.
  - Garment selector panel:
    - Lists picked items in a grid.
    - Delete button: Overlaps the top-right corner of each card using a circular dark-blue container, Close Icon of size 9, and `#ff3f6c` hover.
    - Closet select sheet: Stays open continuously on clicks (multi-select enabled) instead of closing on a single click.
    - Responsive layout: Viewport cards use `w-full max-w-[342.75px]` to prevent horizontal overflow scrolling.

---

## 3. Technology Stack & Directory Structure
- **Vite & React Typescript:** Root config in `vite.config.ts` and compilation configurations in `tsconfig.json`.
- **Tailwind CSS:** Styles loaded in `src/index.css`. Tailored color tokens (`bg`, `primary`, `divider`, `ink`) configured in `tailwind.config.ts`.
- **Global State:** Managed via Zustand stores inside `src/store/`:
  - `chromeStore.ts`: Layout state keys (`wireframeVersion`, `isSelecting`).
  - `wardrobeStore.ts`: Items collection and selected state arrays.
  - `outfitStore.ts` & `plannerStore.ts`: Outfit combinations and calendar events.

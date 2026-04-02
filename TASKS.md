# TASKS.md — American Mahjong Hand Reference Spec

This spec drives the development of a single-page American Mahjong hand reference site built with React and Tailwind CSS. It covers all tile types, a browsable set of winning hands organized by NMJL-style categories, and an interactive detail view. Each task is self-contained and should be completed in order. Claude Code will use the **Context7 MCP server** to pull current React and Tailwind documentation as needed during implementation.

---

## Task 1: Project Scaffolding

**Goal:** Initialize a React + Tailwind CSS project in this repository.

- [ ] Scaffold a new React app (Vite preferred for speed)
- [ ] Install and configure Tailwind CSS (v3+)
- [ ] Verify the dev server starts and renders a placeholder page
- [ ] Ensure the project builds without errors

**Acceptance Criteria:**
- `npm run dev` serves a working page on localhost
- Tailwind utility classes apply correctly (e.g., `bg-red-500` renders a red background)

---

## Task 2: Mahjong Data Layer

**Goal:** Create a data source of mahjong tiles and winning hands with metadata.

- [ ] Create a static JSON or TypeScript data file defining the full American Mahjong tile set:
  - **Suits:** Bams (1–9), Craks (1–9), Dots (1–9)
  - **Honors:** Winds (East, West, North, South), Dragons (Red, Green, White/Soap)
  - **Specials:** Flowers (1–4), Jokers
  - Each tile entry should include: `id`, `suit`, `value`, `label`, `image` (URL or SVG placeholder), `color` (for theming)
- [ ] Create a separate data file for at least 20 **winning hands**, each including:
  - `id` (number)
  - `name` (string, e.g., `"NEWS"`, `"2024"`, `"Consecutive Run #3"`)
  - `category` (string — one of: `"2468"`, `"Like Numbers"`, `"Consecutive Run"`, `"13579"`, `"Winds & Dragons"`, `"Singles & Pairs"`, `"Quints"`, `"Addition"`)
  - `tiles` (array describing the hand — e.g., `[{ suit: "Bam", value: 2, count: 3 }, ...]`)
  - `closed` (boolean — whether the hand must be concealed/closed)
  - `points` (number — hand point value, e.g., 25 or 30)
  - `description` (short notes on strategy or special rules)
- [ ] Export both data files for consumption by React components

**Acceptance Criteria:**
- At least 20 winning hands spanning all major NMJL-style categories
- Tile and hand data imports cleanly into a React component without errors
- A variety of point values (25, 30, 35, 40, 50, 75) are represented

---

## Task 3: Mahjong Tile Component

**Goal:** Build a reusable, visually accurate Mahjong tile component.

- [ ] Create a `MahjongTile` component that displays:
  - Tile face (suit icon or numeral + suit label)
  - Visual color-coding by suit (e.g., green for Bams, red for Craks, blue for Dots, gold for Honors)
  - Joker tiles should be visually distinct (e.g., star or rainbow styling)
  - Optional count badge (e.g., ×3 for a pung)
- [ ] Style with Tailwind CSS:
  - Tile-shaped card with rounded corners, border, and slight shadow
  - Hover effect (subtle lift or glow)
  - Small and large size variants (for hand display vs. detail view)
- [ ] Component accepts `suit`, `value`, `count`, and `size` props and is fully reusable

**Acceptance Criteria:**
- Tiles render correctly across all suits and honor types
- Jokers and Flowers are visually distinct from numbered suit tiles
- Component is reusable across the hand card grid and detail panel

---

## Task 4: Category Filter Bar

**Goal:** Allow users to filter the displayed winning hands by category.

- [ ] Derive a unique list of hand categories from the data
- [ ] Render a horizontal filter bar with a chip/button for each category plus an "All" option
- [ ] Clicking a category filters the grid to only show hands in that category
- [ ] Clicking "All" resets the filter and shows every hand
- [ ] Active filter should be visually highlighted (e.g., filled background, bold text)

**Acceptance Criteria:**
- Selecting "Consecutive Run" shows only Consecutive Run hands
- Selecting "All" shows the complete hand set
- Dual-category hands (if any) appear under each applicable filter
- Active filter state is clearly indicated

---

## Task 5: Hand Detail View

**Goal:** When a user clicks a hand card, display the full details of that winning hand.

- [ ] Create a `HandDetail` component (modal, slide-over panel, or expanded section)
- [ ] Detail view should display:
  - Hand name and category badge
  - Full tile sequence rendered using `MahjongTile` components (large size)
  - Point value (prominently displayed)
  - Closed/Open indicator (e.g., a lock icon or badge)
  - Description / strategy notes
  - A visual legend showing how the hand groups tiles (pairs, pungs, kongs, quints)
- [ ] Provide a way to close/dismiss the detail view and return to the grid
- [ ] Transitions should feel smooth (fade, slide, or scale animation)

**Acceptance Criteria:**
- Clicking any hand card opens the detail view with correct data for that hand
- All tiles in the hand render using the `MahjongTile` component
- Tile groupings (pair, pung, kong, quint) are visually separated or labeled
- User can close the detail view and select a different hand

---

## Task 6: Layout & Polish

**Goal:** Assemble all components into a cohesive, polished single-page layout.

- [ ] Add a site header with a title (e.g., "American Mahjong Hand Reference") and optional subtitle (e.g., "Browse winning hands, tile by tile")
- [ ] Place the category filter bar beneath the header
- [ ] Display hand cards in a responsive grid (1 col mobile, 2 cols tablet, 3–4 cols desktop)
- [ ] Each hand card in the grid should show:
  - Hand name and category badge
  - A compact tile preview (small `MahjongTile` components or stylized tile row)
  - Point value and closed/open indicator
- [ ] Apply consistent spacing, typography, and color palette via Tailwind
- [ ] Use a mahjong-inspired color palette (ivory/cream tiles, deep green baize background, gold accents)
- [ ] Ensure the page looks good on both desktop and mobile viewports

**Acceptance Criteria:**
- The full page renders header → filter bar → hand card grid in a clean layout
- Grid is responsive across breakpoints
- Overall design feels cohesive, thematic, and demo-ready

---

## Notes

- **Single-page app** — no routing or backend required; all data is local/static.
- **No persistent state** — this is a reference tool; nothing needs to be saved between sessions.
- **American Mahjong rules** — hands follow NMJL-style conventions (jokers can substitute in pungs, kongs, and quints but not pairs; closed hands may not call discards for the win).
- **MCP Usage** — Claude Code should leverage the Context7 MCP server to retrieve current React and Tailwind documentation during implementation.

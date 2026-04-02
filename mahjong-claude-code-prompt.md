# Claude Code Prompt — American Mahjong Mobile App

## Overview

Build a fully playable, mobile-first American Mahjong app in React + Tailwind CSS (Vite scaffold) with a visual quality and polish level equivalent to **Pokémon Pocket** — meaning: rich tile art, silky animations, satisfying interactions, and an interface that feels like a premium native app, not a web page.

The game is **1 human player vs. 3 AI opponents**, pass-and-play is not required. All standard American Mahjong rules apply. Use the **fake card defined at the bottom of this prompt** as the winning hand reference for this session.

---

## Visual Design Direction

**Aesthetic target:** Luxury tabletop gaming app. Think deep green baize, lacquered wood, ivory tile faces, jade and gold accents. The feel should be like sitting at a high-end mahjong table in a beautifully lit room — rich, warm, tactile.

**Specific visual requirements:**

- **Tile design:** Each tile should look three-dimensional — an ivory/cream face with a subtle drop shadow, slight bevel or emboss effect, and a dark back. Suit symbols (Bams, Craks, Dots) should be rendered as crisp SVG icons directly on the tile face, color-coded:
  - Bams → deep green bamboo stalks
  - Craks → red Chinese characters (use stylized numerals if characters aren't available)
  - Dots → blue/navy circles
  - Winds → gold compass glyphs (N, S, E, W in serif)
  - Dragons → colored gems or seals (Red Dragon = crimson, Green Dragon = emerald, White Dragon = pearl/soap)
  - Flowers → soft floral illustrations or colored petals (1–4)
  - Jokers → a rainbow-foil star or jester design, visually loud and distinct

- **Table background:** Deep baize green (`#1a4731`) with a subtle felt texture (SVG noise or CSS noise overlay). A wooden rail border around the play area. Player seat labels at each cardinal direction.

- **Typography:** Use a pairing of a refined serif display font (e.g., Playfair Display or Cormorant Garamond via Google Fonts) for headers and hand names, and a clean humanist sans-serif (e.g., Nunito or DM Sans) for UI elements and numbers.

- **Color palette (CSS variables):**
  ```
  --baize: #1a4731
  --baize-light: #2d6a4f
  --tile-face: #f7f2e8
  --tile-shadow: #c8b89a
  --gold: #c9a84c
  --gold-light: #e8c96a
  --red-dragon: #c0392b
  --green-dragon: #27ae60
  --bam-green: #2d6a4f
  --crak-red: #c0392b
  --dot-blue: #1a5276
  --ui-dark: #0d1f17
  --ui-panel: rgba(13, 31, 23, 0.85)
  ```

- **Animations (these are mandatory, not optional):**
  - Tile deal: cards fly in from the wall to the player's hand with a staggered cascade, like cards being dealt
  - Tile draw: tile slides in from the wall with a satisfying "click" feel (scale 1.05 → 1.0 spring)
  - Tile select: tapped tile rises up slightly from the hand (translateY -12px, slight glow)
  - Tile discard: tile flips face-up as it lands in the discard pile (CSS 3D flip or scale + fade)
  - Mahjong declaration: screen-wide shimmer/burst effect with the winning hand highlighted in gold
  - Charleston passes: tiles slide in a smooth arc between seats
  - AI thinking: subtle pulsing glow on opponent's seat while their turn processes

- **Mobile-first layout:**
  - Player's hand is always anchored to the bottom of the screen in a horizontal scroll row
  - Three opponent seats displayed at top, left, and right with face-down tile counts
  - Center of the screen is the discard pool + wall count
  - All tap targets minimum 48×48px
  - No hover-dependent interactions; everything works on touch

---

## Game Architecture

### Tile Set (152 tiles total)
```
Bams 1–9 × 4 = 36
Craks 1–9 × 4 = 36
Dots 1–9 × 4 = 36
Winds (E, W, N, S) × 4 = 16
Dragons (Red, Green, White) × 4 = 12
Flowers (1–4) × 4 = 16  ← American sets use 4 copies of each flower
Jokers × 8 = 8
Total = 160 tiles
```

> Note: Some American sets use 8 flowers and 8 jokers. Use 8 jokers and 8 flowers (2 copies each of Flower 1–4) for a 166-tile set if preferred, but 160 is the most common. Implement whichever and document it clearly.

### Game Flow

**1. Setup**
- Shuffle all tiles into the wall (a flat array, randomly ordered)
- Each of 4 players draws 13 tiles; East (human player) draws 14
- Flowers are immediately exchanged: any player with a Flower tile draws a replacement from the wall before the Charleston

**2. The Charleston (mandatory first charleston, optional second)**

First Charleston:
1. Each player passes 3 tiles **right**
2. Each player passes 3 tiles **across**
3. Each player passes 3 tiles **left** (may "blind pass" up to 3 tiles received from across)

Optional Second Charleston (any player may stop it):
1. Pass 3 tiles **left**
2. Pass 3 tiles **across**
3. Pass 3 tiles **right** (may blind pass up to 3 tiles received from across)

After the Charleston, one optional **courtesy pass** of 1–3 tiles with any one player (both must agree).

For the human player: display tiles received and passed with clear UI. AI players auto-pass tiles least useful to their hand (implement a simple heuristic — discard tiles that appear only once and don't match any hand pattern).

**3. Gameplay**

East draws first (human already has 14). Turn order: East → South → West → North.

On each turn:
- Current player draws 1 tile from the wall
- If it's a Flower: immediately draw a replacement (Flowers are scored but don't count toward the hand)
- Player must then discard 1 tile face-up to the discard pile

**Calling rules:**
- Any player may call a discarded tile **only to declare Mahjong (win)** — no calling for pungs, kongs, or pairs outside of winning
- To win on a discard: player must have a complete hand using that tile, call "Mahjong", and expose the full hand
- Self-drawn Mahjong (winning on your own drawn tile) is also valid

**4. Winning**
- A winning hand must exactly match one of the hands on the card (see Fake Card below)
- The hand must use exactly 14 tiles (or 13 + the called discard)
- Jokers may substitute for any tile in a pung (3 of a kind), kong (4 of a kind), or quint (5 of a kind) but **never in a pair** and **never in a singles hand**
- Flowers do not count toward the hand total but are held separately

**5. Scoring**
- Winner scores the point value listed on the card for the hand played
- Self-drawn win: all three opponents pay the winner the hand's point value
- Called win (on a discard): the player who discarded pays double; the other two pay single
- A player who discards the winning tile is said to have "thrown" and pays double
- Show a scoring summary screen after each round

**6. Wall exhaustion**
- If the wall reaches 0 tiles (or a defined minimum, e.g., 14 remaining), the round ends in a draw
- No points are exchanged; display a "Draw — Wall Exhausted" screen

---

## AI Opponent Behavior

Keep AI simple but functional:

- **Tile evaluation:** Score each tile in hand by how many card hands it appears in. Discard the tile with the lowest score.
- **Charleston:** Pass tiles with the lowest hand scores
- **Mahjong detection:** After each draw or received pass, check if the hand matches any card hand (accounting for jokers as wildcards in pungs/kongs/quints)
- **Calling:** AI checks every discard for a winning call before the next turn begins
- AI "thinking" delay: 800–1200ms random pause before discarding so it doesn't feel instant

---

## UI Screens & Components

### Screens
1. **Home / Lobby** — Title screen with "New Game" button, brief rules summary toggle, and a tile animation in the background (tiles shuffling)
2. **Charleston Screen** — Dedicated phase UI where the player selects tiles to pass, sees incoming tiles, and confirms each pass
3. **Game Table** — Main gameplay screen (described above)
4. **Mahjong Declaration** — Overlay showing the winning hand, who won, scoring breakdown
5. **Round Summary** — Scores, option to play again

### Key Components
- `MahjongTile` — core tile component, size variants: `sm` (opponent racks), `md` (player hand), `lg` (detail/declaration view)
- `PlayerHand` — scrollable horizontal row for the human's tiles; selected tile animates up
- `OpponentSeat` — compact face-down tile count + discard area for each AI
- `DiscardPool` — center grid of all discarded tiles, most recent highlighted
- `WallCounter` — live count of remaining tiles in the wall
- `CardReference` — slide-up panel (bottom sheet) showing the fake card; accessible at any time via a button
- `CharlestonUI` — tile selection for passing during the Charleston phase
- `ScoringOverlay` — post-hand scoring summary

---

## Fake Card (Winning Hands Reference)

The card has **6 categories** and **24 total hands**. Point values are noted. "C" = closed hand (may not win on a discard).

### Category 1: 2468 (Even Numbers)
All tiles must be even-numbered (2, 4, 6, 8) unless otherwise noted.

| # | Hand | Points |
|---|------|--------|
| 1 | FF 222 444 666 888 (any three suits, any combo) | 25 |
| 2 | FF 2222 4444 (same suit) | 25 |
| 3 | FF 22 44 66 88 (four pairs, any suits) | 30 C |
| 4 | 2468 2468 2468 (three sets of 2-4-6-8, one per suit) | 35 C |

---

### Category 2: Consecutive Run
Tiles form runs of consecutive numbers.

| # | Hand | Points |
|---|------|--------|
| 5 | FF 123 123 123 (same three tiles, three suits) | 25 |
| 6 | FF 111 222 333 (three consecutive pungs, one suit) | 25 |
| 7 | FF 1111 2222 (same suit, kong + kong) | 30 |
| 8 | 123 456 789 (complete run 1–9, one suit) | 35 C |
| 9 | FF 11 22 33 44 (four consecutive pairs, one suit) | 35 C |

---

### Category 3: Like Numbers
All tiles share the same number across suits, plus Winds/Dragons.

| # | Hand | Points |
|---|------|--------|
| 10 | 111 111 111 1 (three pungs of 1s across three suits + one Flower) — replace 1 with any single digit | 25 |
| 11 | FF 333 333 (two pungs of same number, two suits) + 33 33 (two pairs same) | 25 |
| 12 | 7777 7777 (two kongs of 7s, two suits) | 30 |
| 13 | FF 9999 999 99 (kong + pung + pair, one suit) | 35 C |

---

### Category 4: Winds & Dragons

| # | Hand | Points |
|---|------|--------|
| 14 | NEWS NEWS NEWS (N=North, E=East, W=West, S=South — three sets of all four winds) | 25 |
| 15 | FF EEEE WWWW SS (East kong, West kong, South pair) | 30 |
| 16 | RRR GGG WWW RG (Red Dragon pung, Green Dragon pung, White Dragon pung + Red+Green pair) | 35 C |
| 17 | EEEE SSSS NNNN WWWW (all four wind kongs) | 50 C |

---

### Category 5: Singles & Pairs
Hands built entirely from pairs (no pungs or kongs). All closed.

| # | Hand | Points |
|---|------|--------|
| 18 | FF 11 22 33 44 55 (five consecutive pairs, one suit) | 35 C |
| 19 | FF EE WW NN SS RR (pairs of all four winds + Red Dragon + any one more) | 40 C |
| 20 | 11 33 55 77 99 11 33 (seven pairs — any suits, no jokers) | 50 C |

---

### Category 6: Quints
Hands using quintuplets (five of the same tile using jokers).

| # | Hand | Points |
|---|------|--------|
| 21 | FF 11111 99999 (two quints, one suit) | 50 |
| 22 | NNNNN SSSSS (two wind quints) | 50 |
| 23 | 11111 22222 (two consecutive quints, one suit) | 60 |
| 24 | RRRRR GGGGG WWWWW (three dragon quints) | 75 C |

---

**Joker rules reminder:**
- Jokers substitute freely in pungs (3), kongs (4), and quints (5)
- Jokers may **never** be used in pairs
- Jokers may **never** be used in Singles & Pairs category hands
- A player may swap a joker from a declared pung/kong on the table by providing the natural tile it represents (this rule applies to exposed sets in other game variants — in this app, since we don't expose sets mid-hand, jokers are locked once the hand is declared)

---

## Technical Requirements

- **Stack:** React 18, Vite, Tailwind CSS v3
- **State management:** React Context + useReducer for game state (no Redux needed)
- **Animation:** Framer Motion for tile animations (deal, draw, discard, charleston arcs, win burst)
- **No backend, no auth, no persistence** — everything lives in React state for the session
- **Fonts:** Load via Google Fonts (Playfair Display + Nunito or similar pairing)
- **Tile SVGs:** Build tile face SVGs programmatically as React components rather than image files — this keeps the bundle small and allows dynamic coloring
- **Responsive target:** 375px–430px wide (iPhone SE through Pro Max) as primary; tablet secondary

---

## File Structure

```
src/
  components/
    MahjongTile.jsx
    PlayerHand.jsx
    OpponentSeat.jsx
    DiscardPool.jsx
    WallCounter.jsx
    CardReference.jsx
    CharlestonUI.jsx
    ScoringOverlay.jsx
    Header.jsx
  screens/
    HomeScreen.jsx
    CharlestonScreen.jsx
    GameTable.jsx
    DeclarationScreen.jsx
    RoundSummary.jsx
  data/
    tiles.js          ← tile definitions
    card.js           ← all 24 winning hands from the fake card
  logic/
    gameEngine.js     ← shuffle, deal, charleston, draw, discard
    handMatcher.js    ← checks if a 14-tile hand matches any card hand (joker-aware)
    aiPlayer.js       ← AI heuristics for passing and discarding
    scoring.js        ← point calculation and payer logic
  context/
    GameContext.jsx   ← global game state via useReducer
  hooks/
    useGameState.js
    useAnimation.js
  styles/
    globals.css       ← Tailwind directives + CSS variables
  assets/
    textures/         ← felt texture SVG, wood grain SVG
  App.jsx
  main.jsx
```

---

## Acceptance Criteria

- [ ] Full 160-tile set implemented with correct counts
- [ ] Charleston phase fully playable (both charlestons, optional second, blind pass logic)
- [ ] Human draw-and-discard turn cycle works correctly
- [ ] AI opponents discard on their turns with a visible thinking delay
- [ ] Calling Mahjong on a discard works and triggers the declaration screen
- [ ] Self-drawn Mahjong works
- [ ] Hand matching correctly validates all 24 hands (including joker substitution)
- [ ] Jokers never validate pairs or singles hands
- [ ] Scoring screen shows correct point totals and who pays whom
- [ ] Wall exhaustion ends the round with a draw
- [ ] Card Reference panel is accessible at any point during play
- [ ] All tile animations are implemented (deal, draw, discard, win burst)
- [ ] Charleston animations show tiles moving between seats
- [ ] App is fully usable on a 375px wide mobile screen with no horizontal scroll
- [ ] Tap targets are all ≥ 48px
- [ ] The visual design matches the described aesthetic (baize, ivory, gold, rich depth)

# Product Backlog

Roadmap for differentiating the app in the (currently trending) mahjong market.

**Positioning:** _"The mahjong app for people who are just getting into mahjong."_
Competitors (e.g. Mahjong Parlor) optimize for experienced players. The trend
wave is bringing in **new** players who want a beautiful app, an AI that teaches
rather than punishes, help understanding what to build toward, and something
worth sharing socially.

Status legend: 🔲 Not started · 🟡 In progress · ✅ Done

---

## Shipped

### Quick wins
- ✅ **localStorage save/resume** — full game state persists; refresh-proof.
- ✅ **AI difficulty selector** — Chill / Spicy / Ruthless. Spicy and Ruthless
  are goal-directed (they target their closest card hands via the advisor
  engine); Chill plays loose and almost never wins, leaving room for the
  learning player.
- ✅ **Share Hand** — branded PNG of the winning hand via Web Share API /
  download. Works for any winner in pass-and-play too.

### Learning & onboarding
- ✅ **"What Can I Win?" advisor** — ranks all 24 hands by tiles-away with
  missing-tile chips and joker hints. Available in-game and during Charleston.
- ✅ **Interactive card reference** — every hand rendered with real tile art;
  tap to expand.
- ✅ **Guided first game** — six phase-aware coach tips (Charleston → discard →
  advisor → calling → declaring), replayable from Home.

### Retention
- ✅ **Hand Journal** — per-hand win counts, 24-hand collection meter,
  trophy/locked states.
- ✅ **Lifetime stats** — games, win rate, streaks, best hand, average win.
- ✅ **Daily challenge** — date-seeded featured hand; win any game for the
  streak, win the featured hand for gold.

### Social
- ✅ **Pass-and-play multiplayer** — 4 humans, one device, privacy handoff
  screens, per-seat Charleston, post-discard call window, custom player names.

### Aesthetics
- ✅ **Runtime theme switcher** — Matcha Garden, Midnight Bloom (dark),
  Coastal Calm, Classic Jade. Full CSS-variable theming; tile faces stay
  authentic across themes.
- ✅ **Tile back designs** — four selectable patterns with per-theme defaults.

### Gameplay
- ✅ **Exposures** — call any discard for a pung/kong/quint (jokers may fill).
  Melds render face-up on every seat; exposing forfeits closed hands; the
  matcher pins exposed melds to card groups by exact tile and size. Cut
  competitive draw rates from ~63% to ~35% (real-table territory) — most
  wins now use at least one exposure.
- ✅ **Sound & haptics** — synthesized Web Audio (tile clacks, call alerts,
  win fanfare — zero assets, offline-safe) plus vibration; mute persists.

### Real-card support (see LEGAL_CARDS.md)
- ✅ **Flowers in hand** — flowers are ordinary tiles inside the 14 (152-tile
  standard set), passable, callable, discardable — real-card semantics.
- ✅ **"My Card" builder** — players who own a physical card transcribe it
  with card notation (suit classes a/b/c, NEWS, dragons, soap, year digits,
  sliding runs); live tile-art validation; compiles into the same variant
  engine as the built-in card. Local-only storage, ships empty.
- ✅ **Card switcher** — Garden Card ↔ My Card on Home; gameplay, advisor,
  card reference, and journal all follow the active card. The daily
  challenge stays pinned to the Garden Card so it's global.

### Platform
- ✅ **Installable PWA** — manifest, icons, offline service worker, iOS meta.
- ✅ **Self-hosted fonts** — Playfair Display + Nunito latin variable fonts
  bundled (124KB); zero third-party requests, honest "no data collected".
- ✅ **App Store path** — see `APP_STORE.md` (PWA today, Bubblewrap for Play,
  Capacitor for iOS).
- ✅ **Seasonal card structure** — the 2026 Garden Card lives in
  `src/data/cards/card2026.js`; new years drop in beside it.

---

## Next up (priority order)

- 🔲 **Joker exchange** — on your turn, swap the matching real tile for a
  joker in ANY exposed meld (yours or an opponent's). The classic American
  mahjong joker economy; the exposure engine already models melds, so this
  is an engine helper + a turn action + AI judgment.
- 🔲 **NMJL license** — the business path to shipping official card content
  in-app; until signed, the Garden Card + "My Card" lanes only (see
  LEGAL_CARDS.md).
- 🔲 **Online multiplayer** — needs a realtime backend (rooms, matchmaking,
  reconnect). Pass-and-play ships as the stepping stone.
- 🔲 **Seasonal card updates** — ship a 2027 Garden Card next year.

---

## Engineering notes

- **Hand engine**: `src/data/cards/card2026.js` declares each hand's concrete
  variants (groups sum to exactly 14; flowers are a side requirement).
  `src/logic/handMatcher.js` is the single evaluator behind `checkWin`,
  `canWinWithTile`, `rankHands` (advisor), and card examples — display,
  win-checking, and advice can never disagree. Jokers only ever fill groups
  of 3+ (derived from group size). Tests: scratchpad engine suite covers
  structure, joker rules, closed/flower gating, 3k-trial fuzz, and full-game
  sims with tile-conservation invariants.
- **AI**: `src/logic/aiPlayer.js`. Spicy/Ruthless pick discards by minimizing
  tiles-to-completion across their top 3/5 ranked hands (~20–45ms per
  decision, hidden inside the thinking delay); they call exposures only when
  the meld strictly improves that distance (accounting for the closed-hand
  forfeit). Chill uses loose heuristics, rarely calls, and skips 40% of
  winning mahjong calls — by design it almost never wins.
- **Exposures**: melds live on `player.exposures`; `exposeFromDiscard`,
  `legalExposures`, `effectiveHandCount` in gameEngine. App.jsx's
  `resolveAfterDiscard` chain: human call window (with Pass) → AI mahjong →
  AI exposures (next-in-turn) → advance. Turn-guard keys include meld count
  because exposure chains consume no wall tiles.
- **Audio**: `src/utils/sound.js` — synthesized Web Audio, lazy context,
  `useSoundEffects` hook in App keys sounds off state transitions.
- **Theming**: tokens in `src/styles/globals.css`, presets + `applyTheme()` in
  `src/theme/presets.js` (auto-computes rgb triplets, syncs `theme-color`).
  Tile faces/artwork are deliberately un-themed.
- **Cards**: `src/data/card.js` resolves the active card (Garden built-in vs
  compiled "My Card"); `src/logic/cardCompiler.js` parses card notation into
  variants; `src/logic/customCard.js` stores/compiles the user's card
  (local-only by policy). Matcher variant cache is a WeakMap keyed on hand
  definition objects so cards can never collide.
- **Persistence**: game saves in `mahjong_saved_game` (v2 — flowers in
  hand); stats/journal/daily in `mahjong_stats` (v1, self-healing; journal
  keys are `cardYear:handId`); theme, tile back, difficulty, coach flags,
  and `mahjong_custom_card`/`mahjong_active_card` in their own keys.
- **Stats recording**: once per game, idempotent by `gameId`, solo mode only.
- **PWA**: `public/sw.js` precaches the shell + parsed assets at install;
  network-first navigations, cache-first assets/fonts. Bump `VERSION` on
  deploys that must invalidate.

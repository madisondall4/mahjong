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
  screens, per-seat Charleston, post-discard call window.

### Aesthetics
- ✅ **Runtime theme switcher** — Matcha Garden, Midnight Bloom (dark),
  Coastal Calm, Classic Jade. Full CSS-variable theming; tile faces stay
  authentic across themes.
- ✅ **Tile back designs** — four selectable patterns with per-theme defaults.

### Platform
- ✅ **Installable PWA** — manifest, icons, offline service worker, iOS meta.
- ✅ **App Store path** — see `APP_STORE.md` (PWA today, Bubblewrap for Play,
  Capacitor for iOS).
- ✅ **Seasonal card structure** — the 2026 Garden Card lives in
  `src/data/cards/card2026.js`; new years drop in beside it.

---

## Next up (priority order)

- 🔲 **Exposures (calling pung/kong/quint)** — the single biggest gameplay
  gap. Without exposures every hand must be assembled from solo draws;
  simulation shows ~63–65% of Spicy/Ruthless games end in wall draws (real
  American mahjong tables see far fewer because calls feed hands). Needs:
  call-window priority (mahjong > exposure), exposed-meld rendering on all
  seats, matcher support (exposed groups pin variant groups), closed-hand
  restrictions, joker-exchange rule, AI call judgment.
- 🔲 **Player-named seats in pass-and-play** — quick name entry before deal.
- 🔲 **Online multiplayer** — needs a realtime backend (rooms, matchmaking,
  reconnect). Pass-and-play ships as the stepping stone.
- 🔲 **Seasonal NMJL-style card updates** — ship a 2027 card next year (never
  copy the NMJL card itself; it's copyrighted).
- 🔲 **Sound & haptics** — tile clacks, win fanfare (add via Capacitor for
  native builds).
- 🔲 **Bundle Google Fonts locally** — removes the last runtime third-party
  request (also required for an honest "no data collected" store label).

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
  decision, hidden inside the thinking delay); Chill uses loose heuristics
  plus randomness and skips 40% of winning calls.
- **Theming**: tokens in `src/styles/globals.css`, presets + `applyTheme()` in
  `src/theme/presets.js` (auto-computes rgb triplets, syncs `theme-color`).
  Tile faces/artwork are deliberately un-themed.
- **Persistence**: game saves in `mahjong_saved_game` (v1); stats/journal/
  daily in `mahjong_stats` (v1, self-healing); theme, tile back, difficulty,
  and coach flags in their own keys.
- **Stats recording**: once per game, idempotent by `gameId`, solo mode only.
- **PWA**: `public/sw.js` precaches the shell + parsed assets at install;
  network-first navigations, cache-first assets/fonts. Bump `VERSION` on
  deploys that must invalidate.

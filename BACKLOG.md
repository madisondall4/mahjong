# Product Backlog

Roadmap for differentiating the app in the (currently trending) mahjong market.

**Positioning:** _"The mahjong app for people who are just getting into mahjong."_
Competitors (e.g. Mahjong Parlor) optimize for experienced players. The trend
wave is bringing in **new** players who want a beautiful app, an AI that teaches
rather than punishes, help understanding what to build toward, and something
worth sharing socially.

Status legend: 🔲 Not started · 🟡 In progress · ✅ Done

---

## Quick wins (ship first — pure frontend, no backend)

- ✅ **localStorage save/resume** — persist game state so a refresh doesn't kill
  an in-progress game (prevents the #1 rage-quit). Also unlocks stats below.
- ✅ **AI difficulty selector** on the home screen:
  - **Chill** — AI makes suboptimal discards, doesn't aggressively call Mahjong.
  - **Spicy** — current heuristics.
  - **Ruthless** — AI tracks discards, blocks your hand, prioritizes
    closed/high-point hands.
- 🔲 **Share Hand** — on the win screen, render a shareable image (tiles laid
  out + hand name + points) for Instagram/TikTok. Free marketing from the exact
  demographic driving the trend.

## Learning & onboarding (the core differentiator)

- 🔲 **"What Can I Win?" advisor** — highlight which of the 24 hands the current
  tiles are closest to, ranked by tiles needed. Solves the #1 new-player problem
  ("what am I even building toward?").
- 🔲 **Interactive card reference** — tap any hand to see an example layout
  rendered with real tile art instead of text notation like `FF 222 444 666 888`.
- 🔲 **Tutorial / guided first game** — walk a brand-new player through Charleston,
  building toward a hand, and calling Mahjong.

## Retention loops

- 🔲 **Hand Journal** — track which of the 24 hands you've won, how often, average
  points. Gamify completion ("You've won 18/24 unique hands!"). Drives the
  "collection" return loop.
- 🔲 **Session & lifetime stats** — win rate, average score, best hand, longest
  win streak.
- 🔲 **Daily / weekly challenges** — e.g. "Win with a Quints hand today."

## Social

- 🔲 **Pass-and-play multiplayer** — 4 players on one device, each sees only their
  hand. Perfect for game nights. Stepping stone before online play.
- 🔲 **Online multiplayer** — matchmaking + real-time play (larger backend effort).

## Aesthetic customization & theme packs

- ✅ **Matcha Garden** preset (greens / creams) — active theme.
- ✅ **Midnight Bloom** preset (pinks / plum) — original Pop & Play palette,
  retained as a preset.
- 🔲 **Runtime theme switcher** — migrate remaining hardcoded component colors to
  the CSS variables in `globals.css`, driven by `src/theme/presets.js`
  (`applyTheme()`), so users can switch presets live in-app.
- 🔲 **Additional presets** — "Coastal Calm" (blues / sand), "Classic Jade"
  (traditional).
- 🔲 **Tile back designs** — selectable patterns.

## Content / longevity

- 🔲 **Seasonal NMJL card updates** — the official card changes annually; ship new
  hand sets each year.

---

## Engineering notes

- Theme tokens live in `src/theme/presets.js` and `src/styles/globals.css`
  (`:root` custom properties) + `tailwind.config.js`. The full runtime switcher
  is blocked on migrating per-component hardcoded hex values to `var(--…)` refs.
- AI heuristics live in `src/logic/aiPlayer.js` with three difficulty tiers:
  chill (random noise, skips 40% mahjong calls), spicy (default balanced),
  ruthless (tracks discard pile, faster, never skips).
- Game state persists to localStorage via `src/utils/persistence.js`. Difficulty
  preference stored separately in `mahjong_difficulty` key.

# Card Content: Legal Strategy

*Strategy notes, not legal advice — have counsel review before store launch.*

## The constraint

The National Mah Jongg League's annual card is a copyrighted compilation (the
selection, arrangement, and expression of its hands), and the League has a
history of enforcing it against apps. "NMJL" / "National Mah Jongg League" are
also its marks. **We must never ship, bundle, sync, or distribute the NMJL
card's contents, and never imply affiliation.**

What is NOT protectable: the *rules and mechanics* of American mahjong
(Charleston, jokers, exposures, calling, scoring conventions) — game rules are
systems/ideas, outside copyright. Generic category vocabulary that predates and
transcends any one card (evens, consecutive runs, winds & dragons, singles and
pairs, year hands) is likewise fair game. That is why the app itself is safe.

## The four-lane strategy

1. **Ship original cards (done).** "The Garden Card" is an original 24-hand
   compilation designed for this app: same skills, same category shapes, our
   own hands. Ship a new edition yearly — that's a retention feature AND the
   legal moat.

2. **"My Card" — user-entered cards (the real-card answer).** Players who own
   the physical card can transcribe it into the app for their own private
   play:
   - The app ships **empty** — no card content, no presets that reconstruct
     any commercial card, no server sync, no sharing/export/import of entered
     cards. Everything stays in the player's localStorage.
   - The player performs any copying, of a card they bought, for personal use
     at their own table — the strongest possible posture, and the app never
     reproduces or distributes anything.
   - In-app copy stays generic: "enter hands from a card you own." Never name
     the League, never pre-fill, never advertise "play the NMJL card."
   - Do NOT add cloud backup/sharing of custom cards later without counsel —
     that would turn us into a distributor.

3. **License (the business path).** If traction warrants, approach the League
   about an official license for in-app card content — precedent exists for
   licensed digital use. Until an agreement is signed, lanes 1–2 only.

4. **Trademark hygiene.** Store listings and app copy say "American mahjong"
   (the game, generic). Include: *"Not affiliated with, endorsed by, or
   licensed by the National Mah Jongg League."* Never use the League's name
   in feature marketing.

## Engineering implications

- Custom cards: localStorage only; excluded from any future telemetry,
  export, or share features by default.
- The card compiler accepts generic notation (suit classes, flowers, winds,
  dragons, year digits) — it is a general tool for ANY card, including
  homemade club cards and our own editions.
- Flowers must count inside the 14-tile hand (real-card semantics) — the
  engine's flower model matches this as of the "flowers in hand" overhaul.

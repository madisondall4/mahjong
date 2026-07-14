/**
 * Rack sorting: the canonical arrangement players expect —
 * bams 1-9, craks 1-9, dots 1-9, winds E-S-W-N, dragons R-G-0,
 * flowers, jokers at the end (they're wild — they go anywhere).
 * Sort is stable so equal tiles keep their relative order.
 */

const SUIT_ORDER = { bam: 0, crak: 1, dot: 2, wind: 3, dragon: 4, flower: 5, joker: 6 };
const WIND_ORDER = { East: 0, South: 1, West: 2, North: 3 };
const DRAGON_ORDER = { Red: 0, Green: 1, White: 2 };

function tileKey(t) {
  const suit = SUIT_ORDER[t.suit] ?? 9;
  let value = 0;
  if (typeof t.value === 'number') value = t.value;
  else if (t.suit === 'wind') value = WIND_ORDER[t.value] ?? 9;
  else if (t.suit === 'dragon') value = DRAGON_ORDER[t.value] ?? 9;
  return suit * 100 + value;
}

export function sortHand(tiles) {
  return [...tiles].sort((a, b) => tileKey(a) - tileKey(b));
}

export function isSorted(tiles) {
  for (let i = 1; i < tiles.length; i++) {
    if (tileKey(tiles[i - 1]) > tileKey(tiles[i])) return false;
  }
  return true;
}

// ── Auto-sort preference (keep the rack sorted after every draw) ──

const AUTO_KEY = 'mahjong_autosort';

export function isAutoSort() {
  try { return localStorage.getItem(AUTO_KEY) === '1'; } catch { return false; }
}

export function setAutoSort(on) {
  try {
    if (on) localStorage.setItem(AUTO_KEY, '1');
    else localStorage.removeItem(AUTO_KEY);
  } catch { /* best effort */ }
}

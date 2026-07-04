/**
 * Active card selection. The Garden Card ships built-in; "My Card" is the
 * player's own transcription (see LEGAL_CARDS.md) compiled at load.
 *
 * The DAILY CHALLENGE is always seeded from the Garden Card so it stays
 * identical for every player, whichever card they play with.
 */

import gardenHands, { CATEGORIES as GARDEN_CATEGORIES, CARD_META as GARDEN_META } from './cards/card2026.js';
import { getCompiledCustomCard } from '../logic/customCard.js';

const ACTIVE_KEY = 'mahjong_active_card';

export const GARDEN_CARD = {
  key: 'garden',
  hands: gardenHands,
  meta: GARDEN_META,
  categories: GARDEN_CATEGORIES,
};

export function getActiveCardKey() {
  try {
    const k = localStorage.getItem(ACTIVE_KEY);
    if (k === 'custom' && getCompiledCustomCard()) return 'custom';
  } catch { /* default */ }
  return 'garden';
}

export function setActiveCardKey(key) {
  try { localStorage.setItem(ACTIVE_KEY, key); } catch { /* best effort */ }
}

export function getActiveCard() {
  if (getActiveCardKey() === 'custom') {
    const custom = getCompiledCustomCard();
    if (custom) return custom;
  }
  return GARDEN_CARD;
}

// Legacy exports (garden card) — used by tests and garden-pinned features.
export { CATEGORIES, CARD_META } from './cards/card2026.js';
export { default } from './cards/card2026.js';

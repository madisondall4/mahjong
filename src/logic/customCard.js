/**
 * "My Card" storage + compilation.
 *
 * LEGAL POSTURE (see LEGAL_CARDS.md): the app ships with NO card content
 * here. Players who own a physical card may transcribe it for their own
 * private play. Everything stays in this device's localStorage — never
 * synced, exported, or shared.
 */

import { compileCard } from './cardCompiler.js';

const KEY = 'mahjong_custom_card';

/** @returns {{name, hands: Array<{pattern, points, closed, anyRun}>} | null} */
export function getCustomCardSource() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.hands)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCustomCardSource(src) {
  try {
    localStorage.setItem(KEY, JSON.stringify(src));
  } catch { /* best effort */ }
  memoJson = null;
}

export function clearCustomCard() {
  try { localStorage.removeItem(KEY); } catch { /* best effort */ }
  memoJson = null;
}

let memoJson = null;
let memoCard = null;

/**
 * Compile the stored card (memoized). Invalid lines are skipped — the
 * builder UI surfaces per-line errors before saving.
 * @returns {{key, hands, meta, categories, errors} | null}
 */
export function getCompiledCustomCard() {
  const src = getCustomCardSource();
  if (!src || src.hands.length === 0) return null;
  const j = JSON.stringify(src);
  if (j === memoJson) return memoCard;

  const { hands, errors } = compileCard(src.hands, { category: 'My Card' });
  memoJson = j;
  memoCard = hands.length === 0 ? null : {
    key: 'custom',
    hands,
    meta: { year: 'custom', name: src.name || 'My Card', edition: 'Personal card — stays on this device' },
    categories: { MY: 'My Card' },
    errors,
  };
  return memoCard;
}

export function hasCustomCard() {
  return getCompiledCustomCard() !== null;
}

/**
 * American Mahjong hand matcher + advisor engine.
 *
 * One declarative evaluator drives BOTH win-checking and the "What Can I Win?"
 * advisor, so they can never disagree:
 *
 *   - A hand definition expands to concrete VARIANTS (see data/cards/*).
 *   - evaluateVariant() measures a tile set against one variant:
 *       distance  — how many tiles you still need to acquire
 *       isWin     — the 14 tiles satisfy the variant exactly
 *       missing   — which tile ids are still needed (for the advisor UI)
 *
 * Joker rules (American): jokers substitute ONLY in groups of 3+ tiles
 * (pung/kong/quint). Never in pairs or singles. Flowers are held separately
 * and are a side requirement (`flowers: n` on the hand def).
 */

import WINNING_HANDS from '../data/card.js';

// ─── Variant cache ────────────────────────────────────────────────────────────

const variantCache = new Map();

function getVariants(handDef) {
  if (!variantCache.has(handDef.id)) {
    variantCache.set(handDef.id, handDef.variants());
  }
  return variantCache.get(handDef.id);
}

function countTiles(tiles) {
  const map = {};
  for (const t of tiles) map[t.id] = (map[t.id] || 0) + 1;
  return map;
}

// ─── Core evaluator ───────────────────────────────────────────────────────────

/**
 * Measure a tile multiset against one concrete variant.
 * @param {Object} counts - tile id -> count (non-flower, non-joker)
 * @param {number} jokers - joker count in hand
 * @param {Array} variant - groups: {id,suit,value,n} or {poolPairs:{pool,count}}
 * @returns {{ distance, isWin, missing: Array<{suit,value,id,short,jokerOk}> }}
 */
function evaluateVariant(counts, jokers, variant) {
  const c = { ...counts };
  let noJokerShort = 0;
  let jokerShort = 0;
  const missing = [];

  const concrete = variant.filter(g => !g.poolPairs);
  const pools = variant.filter(g => g.poolPairs);

  // Pairs/singles claim real tiles first — jokers can't help them.
  const strict = concrete.filter(g => g.n < 3);
  const flexible = concrete.filter(g => g.n >= 3);

  for (const g of strict) {
    const have = Math.min(c[g.id] || 0, g.n);
    if (have) c[g.id] -= have;
    const short = g.n - have;
    if (short) {
      noJokerShort += short;
      missing.push({ suit: g.suit, value: g.value, id: g.id, short, jokerOk: false });
    }
  }

  for (const p of pools) {
    const { pool, count } = p.poolPairs;
    // Greedy optimal: complete pairs first, then upgrade singles (cost 1),
    // then brand-new pairs (cost 2).
    let pairsTaken = 0;
    const singleIds = [];
    for (const id of pool) {
      if (pairsTaken >= count) break;
      const have = Math.min(c[id] || 0, 4);
      const usePairs = Math.min(Math.floor(have / 2), count - pairsTaken);
      if (usePairs > 0) {
        c[id] -= usePairs * 2;
        pairsTaken += usePairs;
      }
    }
    if (pairsTaken < count) {
      for (const id of pool) {
        if (singleIds.length >= count - pairsTaken) break;
        if ((c[id] || 0) === 1) singleIds.push(id);
      }
      for (const id of singleIds) {
        c[id] -= 1;
        noJokerShort += 1;
        const [suit, valueRaw] = id.split('-');
        const value = isNaN(Number(valueRaw)) ? valueRaw : Number(valueRaw);
        missing.push({ suit, value, id, short: 1, jokerOk: false });
      }
      const stillShort = count - pairsTaken - singleIds.length;
      if (stillShort > 0) {
        noJokerShort += stillShort * 2;
        // Suggest unused pool ids for the UI.
        let suggested = 0;
        for (const id of pool) {
          if (suggested >= stillShort) break;
          if ((c[id] || 0) === 0 && !singleIds.includes(id)) {
            const [suit, valueRaw] = id.split('-');
            const value = isNaN(Number(valueRaw)) ? valueRaw : Number(valueRaw);
            missing.push({ suit, value, id, short: 2, jokerOk: false });
            suggested++;
          }
        }
      }
    }
  }

  for (const g of flexible) {
    const have = Math.min(c[g.id] || 0, g.n);
    if (have) c[g.id] -= have;
    const short = g.n - have;
    if (short) {
      jokerShort += short;
      missing.push({ suit: g.suit, value: g.value, id: g.id, short, jokerOk: true });
    }
  }

  const strays = Object.values(c).reduce((a, b) => a + (b > 0 ? b : 0), 0);
  const distance = noJokerShort + Math.max(0, jokerShort - jokers);
  // A win = every group filled (jokers covering flexible shorts exactly),
  // no stray tiles, no leftover jokers (group sizes sum to 14 by design).
  const isWin = noJokerShort === 0 && strays === 0 && jokerShort === jokers;

  return { distance, isWin, missing };
}

/**
 * Consume the variant groups that this player's exposures pin down.
 * An exposed meld must EXACTLY match a group (same tile id, same size) —
 * a pung exposure can never serve a kong requirement.
 * @returns {Array|null} remaining groups, or null if any exposure doesn't fit
 */
function assignExposures(variant, exposures) {
  if (!exposures || exposures.length === 0) return variant;
  const remaining = [...variant];
  for (const exp of exposures) {
    const idx = remaining.findIndex(g =>
      !g.poolPairs && g.id === exp.id && g.n === exp.tiles.length
    );
    if (idx === -1) return null;
    remaining.splice(idx, 1);
  }
  return remaining;
}

const IMPOSSIBLE = Object.freeze({
  distance: Infinity, tileDistance: Infinity, flowersShort: 0, isWin: false, missing: [],
});

/**
 * Evaluate one hand definition against a player's position. Returns the best
 * variant. `tiles` are CONCEALED tiles only; exposed melds are passed
 * separately and pin their matching groups.
 */
export function evaluateHand(handDef, tiles, flowerCount, exposures = []) {
  // Exposing anything forfeits closed hands.
  if (handDef.closed && exposures && exposures.length > 0) return IMPOSSIBLE;

  const nonFlower = tiles.filter(t => t.suit !== 'flower' && t.suit !== 'joker');
  const jokers = tiles.filter(t => t.suit === 'joker').length;
  const counts = countTiles(nonFlower);
  const flowersShort = Math.max(0, (handDef.flowers || 0) - flowerCount);

  let best = null;
  for (const variant of getVariants(handDef)) {
    const groups = assignExposures(variant, exposures);
    if (!groups) continue;
    const res = evaluateVariant(counts, jokers, groups);
    const total = res.distance + flowersShort;
    if (!best || total < best.distance || (total === best.distance && res.isWin)) {
      best = {
        distance: total,
        tileDistance: res.distance,
        flowersShort,
        isWin: res.isWin && flowersShort === 0,
        missing: res.missing,
      };
      if (best.isWin) break;
    }
  }
  return best || IMPOSSIBLE;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Check if a 14-tile hand (non-flower tiles; jokers included) wins.
 * Returns the highest-point matching hand.
 * @returns {{ matched: boolean, handDef: Object|null }}
 */
export function checkWin(hand14, flowerCount, isSelfDraw = true, exposures = []) {
  let bestDef = null;
  for (const handDef of WINNING_HANDS) {
    if (handDef.closed && !isSelfDraw) continue;
    const res = evaluateHand(handDef, hand14, flowerCount, exposures);
    if (res && res.isWin) {
      if (!bestDef || handDef.points > bestDef.points) bestDef = handDef;
    }
  }
  return { matched: !!bestDef, handDef: bestDef };
}

/**
 * Can a concealed hand + a discarded tile win? (Called wins can't use closed hands.)
 */
export function canWinWithTile(hand13, tile, flowerCount, exposures = []) {
  return checkWin([...hand13, tile], flowerCount, false, exposures);
}

/**
 * Rank all 24 hands by how close the given position is to completing them.
 * Powers the "What Can I Win?" advisor. Hands incompatible with the player's
 * exposures rank last with Infinity distance (filter before display).
 * @param {Object[]} tiles - concealed tiles (jokers included)
 * @param {number} flowerCount
 * @param {Array} exposures - face-up melds
 * @returns {Array<{ hand, distance, flowersShort, missing, complete }>}
 */
export function rankHands(tiles, flowerCount, exposures = []) {
  const results = WINNING_HANDS.map(handDef => {
    const res = evaluateHand(handDef, tiles, flowerCount, exposures);
    return {
      hand: handDef,
      distance: res.distance,
      flowersShort: res.flowersShort,
      missing: res.missing,
      complete: res.isWin,
    };
  });
  results.sort((a, b) => a.distance - b.distance || b.hand.points - a.hand.points);
  return results;
}

/**
 * Expand a hand's canonical example into pseudo-tiles for card display.
 * @returns {Array<Array<{suit,value,uid}>>} groups of display tiles
 */
export function exampleTileGroups(handDef) {
  let uid = 0;
  return handDef.example.map(g =>
    Array.from({ length: g.n }, () => ({
      suit: g.suit,
      value: g.value,
      id: g.id,
      uid: `ex-${handDef.id}-${uid++}`,
    }))
  );
}

export { WINNING_HANDS };

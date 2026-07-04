/**
 * AI Player heuristics for American Mahjong
 *
 * Three difficulty tiers:
 * - chill:    suboptimal discards, skips some mahjong calls
 * - spicy:    balanced heuristics (default)
 * - ruthless: tracks discards, avoids helping opponents, faster
 */

import { checkWin, canWinWithTile, rankHands, evaluateHand } from './handMatcher.js';

const SUITS_NUMBERED = ['bam', 'crak', 'dot'];

/**
 * Goal-directed evaluation: how close is this position to its best target
 * hands? Returns the minimum distance across the current top-K candidates.
 */
function bestDistance(tiles, flowerCount, targets, exposures = []) {
  let best = Infinity;
  for (const t of targets) {
    const res = evaluateHand(t, tiles, flowerCount, exposures);
    if (res.distance < best) best = res.distance;
    if (best === 0) break;
  }
  return best;
}

/**
 * Pick the discard that leaves the hand closest to completing one of its
 * best target hands. Ties break toward the generic heuristic (dumping
 * isolated tiles first). Jokers and near-target tiles are protected.
 */
function chooseDiscardGoalDirected(hand, flowers, difficulty, discardPile, targetCount, exposures = []) {
  const flowerCount = flowers.length;
  const targets = rankHands(hand, flowerCount, exposures).slice(0, targetCount).map(r => r.hand);
  let bestUid = null;
  let bestDist = Infinity;
  let bestHeuristic = Infinity;
  const seenIds = new Set();
  for (const tile of hand) {
    if (tile.suit === 'joker') continue; // never throw a joker
    if (seenIds.has(tile.id)) continue; // identical tiles are interchangeable
    seenIds.add(tile.id);
    const without = hand.filter(t => t.uid !== tile.uid);
    const d = bestDistance(without, flowerCount, targets, exposures);
    const h = scoreTile(tile, hand, difficulty, discardPile);
    if (d < bestDist || (d === bestDist && h < bestHeuristic)) {
      bestDist = d;
      bestHeuristic = h;
      bestUid = tile.uid;
    }
  }
  // All tiles were jokers/degenerate — fall back to heuristic.
  return bestUid ?? null;
}

/**
 * Should this AI claim the discard as an exposure — and at what meld size?
 * Calls only when the meld strictly improves its best distance (accounting
 * for the closed-hand forfeit that exposing implies).
 * @returns {{n:number, jokersUsed:number}|null}
 */
export function chooseExposure(hand, flowers, exposures, tile, difficulty = 'spicy') {
  if (difficulty === 'chill' && Math.random() < 0.7) return null; // chill rarely calls
  if (!tile || tile.suit === 'joker' || tile.suit === 'flower') return null;

  const flowerCount = flowers.length;
  const targetCount = difficulty === 'ruthless' ? 5 : 3;
  const targets = rankHands(hand, flowerCount, exposures).slice(0, targetCount).map(r => r.hand);
  const d0 = bestDistance(hand, flowerCount, targets, exposures);

  const real = hand.filter(t => t.id === tile.id);
  const jokers = hand.filter(t => t.suit === 'joker');

  let best = null;
  for (const n of [3, 4, 5]) {
    const need = n - 1;
    const jokersUsed = Math.max(0, need - real.length);
    if (jokersUsed > jokers.length) continue;
    if (difficulty === 'chill' && (n !== 3 || jokersUsed > 0)) continue; // chill: obvious pungs only

    const removeReal = new Set(real.slice(0, Math.min(real.length, need)).map(t => t.uid));
    const removeJokers = new Set(jokers.slice(0, jokersUsed).map(t => t.uid));
    const newHand = hand.filter(t => !removeReal.has(t.uid) && !removeJokers.has(t.uid));
    const meld = { id: tile.id, tiles: [tile, ...real.slice(0, need - jokersUsed), ...jokers.slice(0, jokersUsed)] };
    const newExposures = [...exposures, meld];

    // Re-rank against the new position (closed hands now impossible).
    const newTargets = rankHands(newHand, flowerCount, newExposures).slice(0, targetCount).map(r => r.hand);
    const d1 = bestDistance(newHand, flowerCount, newTargets, newExposures);
    if (d1 < d0 && (!best || d1 < best.d1)) {
      best = { n, jokersUsed, d1 };
    }
  }
  return best ? { n: best.n, jokersUsed: best.jokersUsed } : null;
}

function scoreTile(tile, hand, difficulty, discardPile) {
  if (tile.suit === 'joker') return 100;
  if (tile.suit === 'flower') return 50;

  const copies = hand.filter(t => t.id === tile.id).length;

  let score = copies * 10;

  if (copies >= 4) score += 40;
  else if (copies >= 3) score += 25;
  else if (copies >= 2) score += 12;

  if (SUITS_NUMBERED.includes(tile.suit)) {
    const v = tile.value;
    for (const dv of [-1, 1, -2, 2]) {
      const adj = hand.filter(t => t.suit === tile.suit && t.value === v + dv);
      score += adj.length * 3;
    }
    if ([2, 4, 6, 8].includes(v)) score += 4;
  }

  if (tile.suit === 'wind' || tile.suit === 'dragon') score += 5;

  if (difficulty === 'chill') {
    score += (Math.random() - 0.5) * 16;
  }

  if (difficulty === 'ruthless' && discardPile && discardPile.length > 0) {
    const discardedCopies = discardPile.filter(t => t.id === tile.id).length;
    if (discardedCopies >= 3) score -= 8;
    else if (discardedCopies >= 2) score -= 4;

    if (copies === 1 && discardedCopies === 0) {
      score += 3;
    }

    const suitInDiscards = discardPile.filter(t => t.suit === tile.suit).length;
    if (SUITS_NUMBERED.includes(tile.suit) && suitInDiscards < 3 && copies === 1) {
      score -= 5;
    }
  }

  return score;
}

export function chooseTilesForCharleston(hand, flowers, difficulty = 'spicy') {
  if (hand.length < 3) return hand.map(t => t.uid);

  if (difficulty === 'chill') {
    const scored = hand
      .filter(t => t.suit !== 'joker')
      .map(tile => ({ tile, score: scoreTile(tile, hand, difficulty, []) }));
    scored.sort((a, b) => a.score - b.score);
    const pool = scored.slice(0, 6);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 3).map(s => s.tile.uid);
  }

  // Goal-directed: iteratively give away the three least useful tiles.
  const targetCount = difficulty === 'ruthless' ? 5 : 3;
  let working = [...hand];
  const give = [];
  for (let k = 0; k < 3; k++) {
    const uid = chooseDiscardGoalDirected(working, flowers, difficulty, [], targetCount);
    const pick = uid !== null
      ? working.find(t => t.uid === uid)
      : working.find(t => t.suit !== 'joker') || working[0];
    give.push(pick.uid);
    working = working.filter(t => t.uid !== pick.uid);
  }
  return give;
}

export function chooseTileToDiscard(hand, flowers, difficulty = 'spicy', discardPile = [], exposures = []) {
  if (hand.length === 0) return null;

  if (difficulty !== 'chill') {
    // Spicy targets its 3 closest hands; Ruthless searches 5 and also
    // weighs the discard pile via the heuristic tiebreak.
    const targetCount = difficulty === 'ruthless' ? 5 : 3;
    const uid = chooseDiscardGoalDirected(hand, flowers, difficulty, discardPile, targetCount, exposures);
    if (uid !== null) return uid;
  }

  const scored = hand.map(tile => ({
    tile,
    score: scoreTile(tile, hand, difficulty, discardPile),
  }));
  scored.sort((a, b) => a.score - b.score);

  if (difficulty === 'chill' && scored.length > 3) {
    const worstN = scored.slice(0, 3);
    return worstN[Math.floor(Math.random() * worstN.length)].tile.uid;
  }

  return scored[0].tile.uid;
}

export function shouldCallMahjong(hand13, discard, flowerCount, difficulty = 'spicy', exposures = []) {
  try {
    const result = canWinWithTile(hand13, discard, flowerCount, exposures);
    if (!result.matched) return false;

    if (difficulty === 'chill' && Math.random() < 0.4) return false;

    return true;
  } catch {
    return false;
  }
}

export function canSelfDeclare(hand14, flowerCount, difficulty = 'spicy', exposures = []) {
  try {
    const result = checkWin(hand14, flowerCount, true, exposures);
    if (!result.matched) return null;

    if (difficulty === 'chill' && Math.random() < 0.15) return null;

    return result.handDef;
  } catch {
    return null;
  }
}

export function getThinkingDelay(difficulty = 'spicy') {
  if (difficulty === 'chill') return 1200 + Math.floor(Math.random() * 600);
  if (difficulty === 'ruthless') return 400 + Math.floor(Math.random() * 300);
  return 800 + Math.floor(Math.random() * 400);
}

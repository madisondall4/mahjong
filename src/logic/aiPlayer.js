/**
 * AI Player heuristics for American Mahjong
 *
 * Three difficulty tiers:
 * - chill:    suboptimal discards, skips some mahjong calls
 * - spicy:    balanced heuristics (default)
 * - ruthless: tracks discards, avoids helping opponents, faster
 */

import { checkWin, canWinWithTile } from './handMatcher.js';

const SUITS_NUMBERED = ['bam', 'crak', 'dot'];

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

  const scored = hand.map(tile => ({ tile, score: scoreTile(tile, hand, difficulty, []) }));
  scored.sort((a, b) => a.score - b.score);

  if (difficulty === 'chill') {
    const pool = scored.slice(0, 6);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 3).map(s => s.tile.uid);
  }

  return scored.slice(0, 3).map(s => s.tile.uid);
}

export function chooseTileToDiscard(hand, flowers, difficulty = 'spicy', discardPile = []) {
  if (hand.length === 0) return null;

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

export function shouldCallMahjong(hand13, discard, flowerCount, difficulty = 'spicy') {
  try {
    const result = canWinWithTile(hand13, discard, flowerCount);
    if (!result.matched) return false;

    if (difficulty === 'chill' && Math.random() < 0.4) return false;

    return true;
  } catch {
    return false;
  }
}

export function canSelfDeclare(hand14, flowerCount, difficulty = 'spicy') {
  try {
    const result = checkWin(hand14, flowerCount, true);
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

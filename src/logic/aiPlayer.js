/**
 * AI Player heuristics for American Mahjong
 */

import { checkWin, canWinWithTile } from './handMatcher.js';

const SUITS_NUMBERED = ['bam', 'crak', 'dot'];

// Score a tile: higher = more valuable (keep), lower = discard candidate
export function scoreTile(tile, hand) {
  if (tile.suit === 'joker') return 100;
  if (tile.suit === 'flower') return 50;

  // Count how many copies of this tile are in hand
  const copies = hand.filter(t => t.id === tile.id).length;

  // Base score by copies
  let score = copies * 10;

  // Bonus for pairs/pungs/kongs (more copies = more valuable)
  if (copies >= 4) score += 40;
  else if (copies >= 3) score += 25;
  else if (copies >= 2) score += 12;

  // Bonus for numbered tiles that could form runs
  if (SUITS_NUMBERED.includes(tile.suit)) {
    const v = tile.value;
    // Check adjacent tiles
    for (const dv of [-1, 1, -2, 2]) {
      const adj = hand.filter(t => t.suit === tile.suit && t.value === v + dv);
      score += adj.length * 3;
    }
    // Even numbers bonus (2468 hands)
    if ([2,4,6,8].includes(v)) score += 4;
  }

  // Winds and dragons bonus (appear in multiple hands)
  if (tile.suit === 'wind' || tile.suit === 'dragon') score += 5;

  return score;
}

// Choose 3 tiles to pass during charleston (pass lowest-scored tiles)
export function chooseTilesForCharleston(hand, flowers) {
  if (hand.length < 3) return hand.map(t => t.uid);

  const scored = hand.map(tile => ({ tile, score: scoreTile(tile, hand) }));
  scored.sort((a, b) => a.score - b.score);

  return scored.slice(0, 3).map(s => s.tile.uid);
}

// Choose which tile to discard
export function chooseTileToDiscard(hand, flowers) {
  if (hand.length === 0) return null;

  const scored = hand.map(tile => ({ tile, score: scoreTile(tile, hand) }));
  scored.sort((a, b) => a.score - b.score);

  return scored[0].tile.uid;
}

// Check if AI should call a discard for Mahjong
export function shouldCallMahjong(hand13, discard, flowerCount) {
  try {
    const result = canWinWithTile(hand13, discard, flowerCount);
    return result.matched;
  } catch {
    return false;
  }
}

// Check if AI can self-declare with current 14-tile hand
export function canSelfDeclare(hand14, flowerCount) {
  try {
    const result = checkWin(hand14, flowerCount, true);
    return result.matched ? result.handDef : null;
  } catch {
    return null;
  }
}

// Get AI thinking delay (800-1200ms)
export function getThinkingDelay() {
  return 800 + Math.floor(Math.random() * 400);
}

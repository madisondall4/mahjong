/**
 * American Mahjong Hand Matcher
 *
 * Rules:
 * - Jokers substitute in pungs(3), kongs(4), quints(5) - NEVER in pairs
 * - Jokers never used in Singles & Pairs category hands
 * - Flowers held separately; a hand needing FF requires 2+ flowers
 * - The 14 non-flower tiles + flowers = total held; patterns specify the breakdown
 *
 * Tile: { uid, id, suit, value, label }
 * Suits: 'bam','crak','dot','wind','dragon','flower','joker'
 */

import WINNING_HANDS from '../data/card.js';

const SUITS_NUMBERED = ['bam', 'crak', 'dot'];

// Count tiles by id
function countTiles(tiles) {
  const map = {};
  for (const t of tiles) {
    map[t.id] = (map[t.id] || 0) + 1;
  }
  return map;
}

// Try to take 'n' copies of tileId from counts, using jokers to fill
// Returns { success, jokersUsed } and modifies counts
function takeTiles(counts, jokerCount, tileId, n, noJoker = false) {
  const have = counts[tileId] || 0;
  if (have >= n) {
    const newCounts = { ...counts, [tileId]: have - n };
    if (newCounts[tileId] === 0) delete newCounts[tileId];
    return { success: true, jokersUsed: 0, counts: newCounts, jokerCount };
  }
  if (noJoker) return { success: false };
  const need = n - have;
  if (jokerCount >= need) {
    const newCounts = { ...counts };
    if (have > 0) newCounts[tileId] = 0;
    delete newCounts[tileId];
    return { success: true, jokersUsed: need, counts: newCounts, jokerCount: jokerCount - need };
  }
  return { success: false };
}

// Check if hand has a "pung+joker" group of a given tile (3 total, joker-ok)
function hasPung(counts, jokerCount, tileId) {
  return takeTiles(counts, jokerCount, tileId, 3);
}

function hasKong(counts, jokerCount, tileId) {
  return takeTiles(counts, jokerCount, tileId, 4);
}

function hasQuint(counts, jokerCount, tileId) {
  return takeTiles(counts, jokerCount, tileId, 5);
}

function hasPair(counts, tileId) {
  // NO jokers in pairs
  return takeTiles(counts, 0, tileId, 2, true);
}

// Build tile id
function tid(suit, value) {
  return `${suit}-${value}`;
}

// ─── Individual hand checkers ─────────────────────────────────────────────────

// Hand 1: FF 222 444 666 888 (any three suits, any combo of even pungs)
// Non-flower tiles = 12, need 2 flowers + jokers fill to 14
function check_2468_1(nonFlower, jokers, flowers) {
  if (flowers < 2) return false;
  const evenIds = [];
  for (const suit of SUITS_NUMBERED) {
    for (const v of [2,4,6,8]) evenIds.push(tid(suit, v));
  }
  // Need exactly 3 pungs from even numbered tiles
  let counts = countTiles(nonFlower);
  let jk = jokers;
  let pungsFound = 0;
  for (const id of evenIds) {
    if (pungsFound === 3) break;
    const res = hasPung(counts, jk, id);
    if (res.success) {
      counts = res.counts;
      jk = res.jokerCount;
      pungsFound++;
    }
  }
  if (pungsFound !== 3) return false;
  // Remaining tiles must be jokers or zero
  const remaining = Object.values(counts).reduce((a, b) => a + b, 0);
  return remaining === 0 && jk >= 0;
}

// Hand 2: FF 2222 4444 (same suit)
function check_2468_2(nonFlower, jokers, flowers) {
  if (flowers < 2) return false;
  let counts = countTiles(nonFlower);
  let jk = jokers;
  for (const suit of SUITS_NUMBERED) {
    const r1 = hasKong({ ...counts }, jk, tid(suit, 2));
    if (!r1.success) continue;
    const r2 = hasKong(r1.counts, r1.jokerCount, tid(suit, 4));
    if (!r2.success) continue;
    const remaining = Object.values(r2.counts).reduce((a, b) => a + b, 0);
    if (remaining === 0) return true;
  }
  return false;
}

// Hand 3: FF 22 44 66 88 (four pairs even, any suits) CLOSED - no jokers in pairs
function check_2468_3(nonFlower, jokers, flowers) {
  if (flowers < 2) return false;
  // No jokers in pairs hands
  const counts = countTiles(nonFlower);
  const allEven = [];
  for (const suit of SUITS_NUMBERED) {
    for (const v of [2,4,6,8]) allEven.push(tid(suit, v));
  }
  // Need 4 pairs
  let c = { ...counts };
  let found = 0;
  for (const id of allEven) {
    if (found === 4) break;
    const r = hasPair(c, id);
    if (r.success) {
      c = r.counts;
      found++;
    }
  }
  if (found !== 4) return false;
  return Object.values(c).reduce((a, b) => a + b, 0) === 0;
}

// Hand 4: 2468 2468 2468 (three sets of 2,4,6,8 one per suit) CLOSED
function check_2468_4(nonFlower, jokers, flowers) {
  const counts = countTiles(nonFlower);
  for (const [s1, s2, s3] of [['bam','crak','dot'], ['bam','dot','crak'], ['crak','bam','dot']]) {
    let c = { ...counts };
    let ok = true;
    for (const suit of [s1, s2, s3]) {
      for (const v of [2,4,6,8]) {
        const r = hasPair(c, tid(suit, v));
        if (!r.success) { ok = false; break; }
        c = r.counts;
      }
      if (!ok) break;
    }
    if (ok && Object.values(c).reduce((a,b)=>a+b,0)===0) return true;
  }
  // Actually hand 4 says singles: 2468 2468 2468 - each number once per suit
  // Re-check: 3 sets of [2,4,6,8] across the 3 suits - each suit contributes one full set
  // = 4 singles per suit × 3 suits = 12 tiles + need 2 more...
  // Actually: "2468 2468 2468" = 3 groups of {2,4,6,8}. Since 3×4=12 ≠ 14, need 2 jokers
  // Let's try with jokers
  let jk = jokers;
  let c = countTiles(nonFlower);
  // One set per suit: bam has {2,4,6,8}, crak has {2,4,6,8}, dot has {2,4,6,8}
  let ok = true;
  for (const suit of SUITS_NUMBERED) {
    for (const v of [2,4,6,8]) {
      const have = c[tid(suit, v)] || 0;
      if (have >= 1) {
        c = { ...c, [tid(suit, v)]: have - 1 };
        if (c[tid(suit, v)] === 0) delete c[tid(suit, v)];
      } else if (jk > 0) {
        jk--;
      } else {
        ok = false; break;
      }
    }
    if (!ok) break;
  }
  if (ok && Object.values(c).reduce((a,b)=>a+b,0)===0) return true;
  return false;
}

// Hand 5: FF 123 123 123 (three pungs in three different suits for values 1,2,3)
function check_consec_1(nonFlower, jokers, flowers) {
  if (flowers < 2) return false;
  let counts = countTiles(nonFlower);
  let jk = jokers;
  // Three pungs: one in each suit, values 1-3
  // Try each permutation of values across suits
  const suits = SUITS_NUMBERED;
  for (const [v1, v2, v3] of permutations([1,2,3])) {
    let c = { ...counts };
    let j = jk;
    const r1 = hasPung(c, j, tid(suits[0], v1));
    if (!r1.success) continue;
    c = r1.counts; j = r1.jokerCount;
    const r2 = hasPung(c, j, tid(suits[1], v2));
    if (!r2.success) continue;
    c = r2.counts; j = r2.jokerCount;
    const r3 = hasPung(c, j, tid(suits[2], v3));
    if (!r3.success) continue;
    if (Object.values(r3.counts).reduce((a,b)=>a+b,0)===0) return true;
  }
  return false;
}

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = permutations([...arr.slice(0,i), ...arr.slice(i+1)]);
    for (const p of rest) result.push([arr[i], ...p]);
  }
  return result;
}

// Hand 6: FF 111 222 333 (three consecutive pungs one suit)
function check_consec_2(nonFlower, jokers, flowers) {
  if (flowers < 2) return false;
  for (const suit of SUITS_NUMBERED) {
    for (let start = 1; start <= 7; start++) {
      let c = countTiles(nonFlower);
      let jk = jokers;
      let ok = true;
      for (let i = 0; i < 3; i++) {
        const r = hasPung(c, jk, tid(suit, start + i));
        if (!r.success) { ok = false; break; }
        c = r.counts; jk = r.jokerCount;
      }
      if (ok && Object.values(c).reduce((a,b)=>a+b,0)===0) return true;
    }
  }
  return false;
}

// Hand 7: FF 1111 2222 (two consecutive kongs one suit)
function check_consec_3(nonFlower, jokers, flowers) {
  if (flowers < 2) return false;
  for (const suit of SUITS_NUMBERED) {
    for (let v = 1; v <= 8; v++) {
      let c = countTiles(nonFlower);
      let jk = jokers;
      const r1 = hasKong(c, jk, tid(suit, v));
      if (!r1.success) continue;
      c = r1.counts; jk = r1.jokerCount;
      const r2 = hasKong(c, jk, tid(suit, v + 1));
      if (!r2.success) continue;
      if (Object.values(r2.counts).reduce((a,b)=>a+b,0)===0) return true;
    }
  }
  return false;
}

// Hand 8: 123 456 789 (complete run 1-9 one suit - singles) CLOSED
function check_consec_4(nonFlower, jokers, flowers) {
  for (const suit of SUITS_NUMBERED) {
    const counts = countTiles(nonFlower);
    let ok = true;
    let c = { ...counts };
    for (let v = 1; v <= 9; v++) {
      const have = c[tid(suit, v)] || 0;
      if (have < 1) { ok = false; break; }
      c = { ...c, [tid(suit, v)]: have - 1 };
      if (c[tid(suit, v)] === 0) delete c[tid(suit, v)];
    }
    // Remaining 5 tiles from jokers - wait, 9 tiles + need 5 more...
    // A 14-tile hand: 9 singles + 5 jokers. Allow jokers to fill.
    if (ok) {
      const remaining = Object.values(c).reduce((a,b)=>a+b,0);
      // Remaining must be zero non-joker tiles; jokers were separate
      if (remaining === 0 && jokers >= 5) return true;
      if (remaining === 0 && jokers === 5) return true;
    }
    // Actually: the 14 tiles = 9 suit tiles + 5 jokers if closed.
    // Let's check: hand has exactly 9 tiles of 1-9 in one suit + 5 jokers = 14
    let c2 = countTiles(nonFlower);
    let jk = jokers;
    let ok2 = true;
    for (let v = 1; v <= 9; v++) {
      const have = c2[tid(suit, v)] || 0;
      if (have >= 1) {
        c2 = { ...c2, [tid(suit, v)]: have - 1 };
        if (c2[tid(suit, v)] === 0) delete c2[tid(suit, v)];
      } else {
        ok2 = false; break;
      }
    }
    if (ok2 && Object.values(c2).reduce((a,b)=>a+b,0)===0) return true;
  }
  return false;
}

// Hand 9: FF 11 22 33 44 (four consecutive pairs one suit) CLOSED
function check_consec_5(nonFlower, jokers, flowers) {
  if (flowers < 2) return false;
  for (const suit of SUITS_NUMBERED) {
    for (let start = 1; start <= 6; start++) {
      let c = countTiles(nonFlower);
      let ok = true;
      for (let i = 0; i < 4; i++) {
        const r = hasPair(c, tid(suit, start + i));
        if (!r.success) { ok = false; break; }
        c = r.counts;
      }
      if (ok && Object.values(c).reduce((a,b)=>a+b,0)===0) return true;
    }
  }
  return false;
}

// Hand 10: 111 111 111 F (three pungs same number across all three suits + 1 flower)
function check_like_1(nonFlower, jokers, flowers) {
  if (flowers < 1) return false;
  for (let v = 1; v <= 9; v++) {
    let c = countTiles(nonFlower);
    let jk = jokers;
    let ok = true;
    for (const suit of SUITS_NUMBERED) {
      const r = hasPung(c, jk, tid(suit, v));
      if (!r.success) { ok = false; break; }
      c = r.counts; jk = r.jokerCount;
    }
    if (ok && Object.values(c).reduce((a,b)=>a+b,0)===0) return true;
  }
  return false;
}

// Hand 11: FF 333 333 33 33 (2 pungs + 2 pairs same number two suits)
function check_like_2(nonFlower, jokers, flowers) {
  if (flowers < 2) return false;
  for (let v = 1; v <= 9; v++) {
    for (let si = 0; si < SUITS_NUMBERED.length; si++) {
      for (let sj = si+1; sj < SUITS_NUMBERED.length; sj++) {
        const s1 = SUITS_NUMBERED[si], s2 = SUITS_NUMBERED[sj];
        // pung in s1, pung in s2, pair in s1, pair in s2
        let c = countTiles(nonFlower);
        let jk = jokers;
        const r1 = hasPung(c, jk, tid(s1, v));
        if (!r1.success) continue;
        c = r1.counts; jk = r1.jokerCount;
        const r2 = hasPung(c, jk, tid(s2, v));
        if (!r2.success) continue;
        c = r2.counts; jk = r2.jokerCount;
        const r3 = hasPair(c, tid(s1, v));
        if (!r3.success) continue;
        c = r3.counts;
        const r4 = hasPair(c, tid(s2, v));
        if (!r4.success) continue;
        if (Object.values(r4.counts).reduce((a,b)=>a+b,0)===0) return true;
      }
    }
  }
  return false;
}

// Hand 12: 7777 7777 (two kongs of 7, two suits) - 8 tiles + 6 jokers = 14
function check_like_3(nonFlower, jokers, flowers) {
  for (let si = 0; si < SUITS_NUMBERED.length; si++) {
    for (let sj = si+1; sj < SUITS_NUMBERED.length; sj++) {
      let c = countTiles(nonFlower);
      let jk = jokers;
      const r1 = hasKong(c, jk, tid(SUITS_NUMBERED[si], 7));
      if (!r1.success) continue;
      c = r1.counts; jk = r1.jokerCount;
      const r2 = hasKong(c, jk, tid(SUITS_NUMBERED[sj], 7));
      if (!r2.success) continue;
      if (Object.values(r2.counts).reduce((a,b)=>a+b,0)===0) return true;
    }
  }
  return false;
}

// Hand 13: FF 9999 999 99 (kong+pung+pair of 9, one suit) CLOSED
function check_like_4(nonFlower, jokers, flowers) {
  if (flowers < 2) return false;
  for (const suit of SUITS_NUMBERED) {
    const id = tid(suit, 9);
    let c = countTiles(nonFlower);
    let jk = jokers;
    // Need 4+3+2 = 9 tiles of the same suit-9 + 5 jokers = 14
    const have = c[id] || 0;
    if (have + jk >= 9) {
      const jokerNeeded = Math.max(0, 9 - have);
      if (jokerNeeded <= jk) {
        // consume
        const newHave = have - Math.min(have, 9);
        const remaining = Object.values(c).reduce((a,b)=>a+b,0) - Math.min(have, 9);
        if (remaining === 0) return true;
      }
    }
  }
  return false;
}

// Hand 14: NEWS NEWS NEWS (three sets of all four winds)
function check_winds_1(nonFlower, jokers, flowers) {
  const winds = ['East','South','West','North'];
  let c = countTiles(nonFlower);
  let jk = jokers;
  // Need 3 of each wind = 12 + 2 jokers = 14
  for (const w of winds) {
    const id = tid('wind', w);
    const r = hasPung(c, jk, id);
    if (!r.success) return false;
    c = r.counts; jk = r.jokerCount;
  }
  return Object.values(c).reduce((a,b)=>a+b,0)===0;
}

// Hand 15: FF EEEE WWWW SS
function check_winds_2(nonFlower, jokers, flowers) {
  if (flowers < 2) return false;
  let c = countTiles(nonFlower);
  let jk = jokers;
  const r1 = hasKong(c, jk, tid('wind','East'));
  if (!r1.success) return false;
  c = r1.counts; jk = r1.jokerCount;
  const r2 = hasKong(c, jk, tid('wind','West'));
  if (!r2.success) return false;
  c = r2.counts; jk = r2.jokerCount;
  const r3 = hasPair(c, tid('wind','South'));
  if (!r3.success) return false;
  return Object.values(r3.counts).reduce((a,b)=>a+b,0)===0;
}

// Hand 16: RRR GGG WWW RG (dragon pungs + Red+Green pair) CLOSED
function check_winds_3(nonFlower, jokers, flowers) {
  let c = countTiles(nonFlower);
  let jk = jokers;
  const r1 = hasPung(c, jk, tid('dragon','Red'));
  if (!r1.success) return false;
  c = r1.counts; jk = r1.jokerCount;
  const r2 = hasPung(c, jk, tid('dragon','Green'));
  if (!r2.success) return false;
  c = r2.counts; jk = r2.jokerCount;
  const r3 = hasPung(c, jk, tid('dragon','White'));
  if (!r3.success) return false;
  c = r3.counts; jk = r3.jokerCount;
  const r4 = hasPair(c, tid('dragon','Red'));
  if (!r4.success) return false;
  c = r4.counts;
  const r5 = hasPair(c, tid('dragon','Green'));
  if (!r5.success) return false;
  return Object.values(r5.counts).reduce((a,b)=>a+b,0)===0;
}

// Hand 17: EEEE SSSS NNNN WWWW (all four wind kongs) CLOSED
function check_winds_4(nonFlower, jokers, flowers) {
  let c = countTiles(nonFlower);
  let jk = jokers;
  for (const w of ['East','South','North','West']) {
    const r = hasKong(c, jk, tid('wind', w));
    if (!r.success) return false;
    c = r.counts; jk = r.jokerCount;
  }
  return Object.values(c).reduce((a,b)=>a+b,0)===0;
}

// Hand 18: FF 11 22 33 44 55 (five consecutive pairs one suit) CLOSED
function check_singles_1(nonFlower, jokers, flowers) {
  if (flowers < 2) return false;
  for (const suit of SUITS_NUMBERED) {
    for (let start = 1; start <= 5; start++) {
      let c = countTiles(nonFlower);
      let ok = true;
      for (let i = 0; i < 5; i++) {
        const r = hasPair(c, tid(suit, start + i));
        if (!r.success) { ok = false; break; }
        c = r.counts;
      }
      if (ok && Object.values(c).reduce((a,b)=>a+b,0)===0) return true;
    }
  }
  return false;
}

// Hand 19: FF EE WW NN SS RR (pairs of all winds + Red + any one) CLOSED
function check_singles_2(nonFlower, jokers, flowers) {
  if (flowers < 2) return false;
  const required = [
    tid('wind','East'), tid('wind','West'),
    tid('wind','North'), tid('wind','South'),
    tid('dragon','Red'),
  ];
  let c = countTiles(nonFlower);
  for (const id of required) {
    const r = hasPair(c, id);
    if (!r.success) return false;
    c = r.counts;
  }
  // Remaining 2 tiles must form a pair (the "any one more")
  const remaining = Object.entries(c).filter(([,n]) => n >= 2);
  return remaining.length === 1 && remaining[0][1] === 2;
}

// Hand 20: 11 33 55 77 99 11 33 (seven pairs any suits, NO JOKERS) CLOSED
function check_singles_3(nonFlower, jokers, flowers) {
  // No jokers allowed
  const counts = countTiles(nonFlower);
  const pairs = Object.values(counts).filter(n => n >= 2).reduce((acc, n) => acc + Math.floor(n / 2), 0);
  const total = nonFlower.length;
  return total === 14 && pairs >= 7 && Object.values(counts).every(n => n % 2 === 0);
}

// Hand 21: FF 11111 99999 (two quints, one suit)
function check_quints_1(nonFlower, jokers, flowers) {
  if (flowers < 2) return false;
  for (const suit of SUITS_NUMBERED) {
    for (let v1 = 1; v1 <= 9; v1++) {
      for (let v2 = 1; v2 <= 9; v2++) {
        if (v2 === v1) continue;
        let c = countTiles(nonFlower);
        let jk = jokers;
        const r1 = hasQuint(c, jk, tid(suit, v1));
        if (!r1.success) continue;
        c = r1.counts; jk = r1.jokerCount;
        const r2 = hasQuint(c, jk, tid(suit, v2));
        if (!r2.success) continue;
        if (Object.values(r2.counts).reduce((a,b)=>a+b,0)===0) return true;
      }
    }
  }
  return false;
}

// Hand 22: NNNNN SSSSS (North and South quints)
function check_quints_2(nonFlower, jokers, flowers) {
  let c = countTiles(nonFlower);
  let jk = jokers;
  const r1 = hasQuint(c, jk, tid('wind','North'));
  if (!r1.success) return false;
  c = r1.counts; jk = r1.jokerCount;
  const r2 = hasQuint(c, jk, tid('wind','South'));
  if (!r2.success) return false;
  return Object.values(r2.counts).reduce((a,b)=>a+b,0)===0;
}

// Hand 23: 11111 22222 (two consecutive quints one suit)
function check_quints_3(nonFlower, jokers, flowers) {
  for (const suit of SUITS_NUMBERED) {
    for (let v = 1; v <= 8; v++) {
      let c = countTiles(nonFlower);
      let jk = jokers;
      const r1 = hasQuint(c, jk, tid(suit, v));
      if (!r1.success) continue;
      c = r1.counts; jk = r1.jokerCount;
      const r2 = hasQuint(c, jk, tid(suit, v+1));
      if (!r2.success) continue;
      if (Object.values(r2.counts).reduce((a,b)=>a+b,0)===0) return true;
    }
  }
  return false;
}

// Hand 24: RRRRR GGGGG WWWWW (three dragon quints) CLOSED
function check_quints_4(nonFlower, jokers, flowers) {
  let c = countTiles(nonFlower);
  let jk = jokers;
  for (const d of ['Red','Green','White']) {
    const r = hasQuint(c, jk, tid('dragon', d));
    if (!r.success) return false;
    c = r.counts; jk = r.jokerCount;
  }
  return Object.values(c).reduce((a,b)=>a+b,0)===0;
}

const CHECKERS = [
  check_2468_1, check_2468_2, check_2468_3, check_2468_4,
  check_consec_1, check_consec_2, check_consec_3, check_consec_4, check_consec_5,
  check_like_1, check_like_2, check_like_3, check_like_4,
  check_winds_1, check_winds_2, check_winds_3, check_winds_4,
  check_singles_1, check_singles_2, check_singles_3,
  check_quints_1, check_quints_2, check_quints_3, check_quints_4,
];

/**
 * Check if a 14-tile hand matches any winning hand.
 * @param {Object[]} hand14 - exactly 14 tiles (non-flower)
 * @param {number} flowerCount - how many flowers the player holds
 * @param {boolean} isSelfDraw - true for self-drawn (allows closed hands)
 * @returns {{ matched: boolean, handDef: Object|null }}
 */
export function checkWin(hand14, flowerCount, isSelfDraw = true) {
  const flowers = flowerCount;
  const nonFlower = hand14.filter(t => t.suit !== 'flower' && t.suit !== 'joker');
  const jokers = hand14.filter(t => t.suit === 'joker').length;

  for (let i = 0; i < CHECKERS.length; i++) {
    const handDef = WINNING_HANDS[i];
    if (handDef.closed && !isSelfDraw) continue;
    if (CHECKERS[i](nonFlower, jokers, flowers)) {
      return { matched: true, handDef };
    }
  }
  return { matched: false, handDef: null };
}

/**
 * Can a 13-tile hand + a given discard win?
 * @param {Object[]} hand13 - 13 tiles
 * @param {Object} tile - the discard tile being called
 * @param {number} flowerCount
 * @returns {{ matched: boolean, handDef: Object|null }}
 */
export function canWinWithTile(hand13, tile, flowerCount) {
  const hand14 = [...hand13, tile];
  // On called discard = not self-draw, so closed hands not allowed
  return checkWin(hand14, flowerCount, false);
}

export { WINNING_HANDS };

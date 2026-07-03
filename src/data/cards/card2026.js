/**
 * The Garden Card — 2026 Edition
 *
 * 24 winning hands across 6 categories. This is the app's built-in practice
 * card (inspired by, but not copying, the annual NMJL card).
 *
 * DESIGN INVARIANTS — enforced by tests:
 *  1. Every variant's groups sum to EXACTLY 14 tiles. Flowers are a side
 *     requirement (`flowers: n`) because the engine auto-sets flowers aside.
 *  2. Every variant is physically buildable: ≤4 copies of any tile id, and
 *     joker-eligible shortfalls never exceed the 8 jokers in the wall.
 *  3. Jokers substitute ONLY in groups of 3+ (pung/kong/quint) — never in
 *     pairs or singles. The matcher derives this from group size (n >= 3).
 *
 * Group shapes:
 *   { suit, value, n }                        — concrete tiles
 *   { poolPairs: { pool: [tileId], count } }  — "any K pairs drawn from pool"
 *
 * `variants()` returns every legal concrete arrangement of a hand.
 * `example` is the canonical arrangement rendered on the card UI.
 */

export const CATEGORIES = {
  EVEN: '2468',
  CONSEC: 'Consecutive Run',
  LIKE: 'Like Numbers',
  WINDS: 'Winds & Dragons',
  SINGLES: 'Singles & Pairs',
  QUINTS: 'Quints',
};

export const CARD_META = {
  year: 2026,
  name: 'The Garden Card',
  edition: '2026 Edition',
};

const NSUITS = ['bam', 'crak', 'dot'];
const WINDS = ['East', 'South', 'West', 'North'];
const DRAGONS = ['Red', 'Green', 'White'];

const tid = (s, v) => `${s}-${v}`;
const G = (suit, value, n) => ({ id: tid(suit, value), suit, value, n });

const EVEN_IDS = NSUITS.flatMap(s => [2, 4, 6, 8].map(v => tid(s, v)));
const ODD_IDS = NSUITS.flatMap(s => [1, 3, 5, 7, 9].map(v => tid(s, v)));
const ALL_PAIRABLE_IDS = [
  ...NSUITS.flatMap(s => [1,2,3,4,5,6,7,8,9].map(v => tid(s, v))),
  ...WINDS.map(w => tid('wind', w)),
  ...DRAGONS.map(d => tid('dragon', d)),
];

// other-suit helpers
const others = (s) => NSUITS.filter(x => x !== s);
const perms3 = (() => {
  const out = [];
  for (const a of NSUITS) for (const b of NSUITS) for (const c of NSUITS) {
    if (a !== b && b !== c && a !== c) out.push([a, b, c]);
  }
  return out;
})();

export const WINNING_HANDS = [
  // ── 2468 ────────────────────────────────────────────────────────────────
  {
    id: 1,
    category: CATEGORIES.EVEN,
    name: 'Even Steven',
    pattern: '222 444 6666 8888',
    points: 25,
    closed: false,
    flowers: 0,
    description: 'Pungs of 2 and 4, kongs of 6 and 8 — each group in any suit.',
    variants() {
      const out = [];
      for (const s2 of NSUITS) for (const s4 of NSUITS)
        for (const s6 of NSUITS) for (const s8 of NSUITS)
          out.push([G(s2, 2, 3), G(s4, 4, 3), G(s6, 6, 4), G(s8, 8, 4)]);
      return out;
    },
    example: [G('bam', 2, 3), G('crak', 4, 3), G('dot', 6, 4), G('bam', 8, 4)],
  },
  {
    id: 2,
    category: CATEGORIES.EVEN,
    name: 'Even Keel',
    pattern: 'FF 2222 4444 666 888',
    points: 30,
    closed: false,
    flowers: 2,
    description: 'Kongs of 2 and 4 plus pungs of 6 and 8 — each group in any suit. Needs 2 flowers.',
    variants() {
      const out = [];
      for (const s2 of NSUITS) for (const s4 of NSUITS)
        for (const s6 of NSUITS) for (const s8 of NSUITS)
          out.push([G(s2, 2, 4), G(s4, 4, 4), G(s6, 6, 3), G(s8, 8, 3)]);
      return out;
    },
    example: [G('dot', 2, 4), G('bam', 4, 4), G('dot', 6, 3), G('crak', 8, 3)],
  },
  {
    id: 3,
    category: CATEGORIES.EVEN,
    name: 'Even Sevens',
    pattern: '22 44 66 88 22 44 66',
    points: 40,
    closed: true,
    flowers: 0,
    description: 'Seven pairs, all even numbers, any suits. No jokers. Closed.',
    variants() {
      return [[{ poolPairs: { pool: EVEN_IDS, count: 7 } }]];
    },
    example: [
      G('bam', 2, 2), G('bam', 4, 2), G('bam', 6, 2), G('bam', 8, 2),
      G('crak', 2, 2), G('crak', 4, 2), G('crak', 6, 2),
    ],
  },
  {
    id: 4,
    category: CATEGORIES.EVEN,
    name: 'Even Spread',
    pattern: '2468 2468 2468 22',
    points: 45,
    closed: true,
    flowers: 0,
    description: 'A full 2-4-6-8 in every suit, plus one extra even pair. No jokers in singles or pairs. Closed.',
    variants() {
      const singles = NSUITS.flatMap(s => [2, 4, 6, 8].map(v => G(s, v, 1)));
      return EVEN_IDS.map(id => {
        const [suit, v] = id.split('-');
        return [...singles, G(suit, Number(v), 2)];
      });
    },
    example: [
      G('bam', 2, 1), G('bam', 4, 1), G('bam', 6, 1), G('bam', 8, 1),
      G('crak', 2, 1), G('crak', 4, 1), G('crak', 6, 1), G('crak', 8, 1),
      G('dot', 2, 1), G('dot', 4, 1), G('dot', 6, 1), G('dot', 8, 1),
      G('bam', 2, 2),
    ],
  },

  // ── Consecutive Run ─────────────────────────────────────────────────────
  {
    id: 5,
    category: CATEGORIES.CONSEC,
    name: 'Staircase',
    pattern: '111 222 333 444 55',
    points: 25,
    closed: false,
    flowers: 0,
    description: 'Four consecutive pungs plus the next pair up — every group may be a different suit. Start anywhere 1–5.',
    variants() {
      const out = [];
      for (let v = 1; v <= 5; v++) {
        for (const s1 of NSUITS) for (const s2 of NSUITS)
          for (const s3 of NSUITS) for (const s4 of NSUITS) for (const s5 of NSUITS) {
            out.push([G(s1, v, 3), G(s2, v + 1, 3), G(s3, v + 2, 3), G(s4, v + 3, 3), G(s5, v + 4, 2)]);
          }
      }
      return out;
    },
    example: [G('crak', 1, 3), G('bam', 2, 3), G('crak', 3, 3), G('dot', 4, 3), G('crak', 5, 2)],
  },
  {
    id: 6,
    category: CATEGORIES.CONSEC,
    name: 'Big Steps',
    pattern: 'FF 1111 2222 3333 44',
    points: 30,
    closed: false,
    flowers: 2,
    description: 'Three consecutive kongs plus the next pair up — every group may be a different suit. Needs 2 flowers.',
    variants() {
      const out = [];
      for (let v = 1; v <= 6; v++) {
        for (const s1 of NSUITS) for (const s2 of NSUITS)
          for (const s3 of NSUITS) for (const s4 of NSUITS) {
            out.push([G(s1, v, 4), G(s2, v + 1, 4), G(s3, v + 2, 4), G(s4, v + 3, 2)]);
          }
      }
      return out;
    },
    example: [G('dot', 1, 4), G('bam', 2, 4), G('dot', 3, 4), G('crak', 4, 2)],
  },
  {
    id: 7,
    category: CATEGORIES.CONSEC,
    name: 'Grand Staircase',
    pattern: '123456789 111 99',
    points: 40,
    closed: true,
    flowers: 0,
    description: 'The full run 1 through 9 plus a pung of 1 and a pair of 9, all one suit. Jokers only in the pung. Closed.',
    variants() {
      return NSUITS.map(s => [
        ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => G(s, v, 1)),
        G(s, 1, 3),
        G(s, 9, 2),
      ]);
    },
    example: [
      ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => G('bam', v, 1)),
      G('bam', 1, 3), G('bam', 9, 2),
    ],
  },
  {
    id: 8,
    category: CATEGORIES.CONSEC,
    name: 'Seven Steps',
    pattern: 'FF 11 22 33 44 55 66 77',
    points: 45,
    closed: true,
    flowers: 2,
    description: 'Seven consecutive pairs in one suit. No jokers. Needs 2 flowers. Closed.',
    variants() {
      const out = [];
      for (const s of NSUITS) for (let v = 1; v <= 3; v++) {
        out.push([0, 1, 2, 3, 4, 5, 6].map(i => G(s, v + i, 2)));
      }
      return out;
    },
    example: [1, 2, 3, 4, 5, 6, 7].map(v => G('dot', v, 2)),
  },

  // ── Like Numbers ────────────────────────────────────────────────────────
  {
    id: 9,
    category: CATEGORIES.LIKE,
    name: 'Triple Threat',
    pattern: '555 555 555 GGG RR',
    points: 30,
    closed: false,
    flowers: 0,
    description: 'Pungs of one number in all three suits, plus a dragon pung and a different dragon pair.',
    variants() {
      const out = [];
      for (let v = 1; v <= 9; v++) {
        for (const dPung of DRAGONS) for (const dPair of DRAGONS) {
          if (dPung === dPair) continue;
          out.push([
            G('bam', v, 3), G('crak', v, 3), G('dot', v, 3),
            G('dragon', dPung, 3), G('dragon', dPair, 2),
          ]);
        }
      }
      return out;
    },
    example: [
      G('bam', 5, 3), G('crak', 5, 3), G('dot', 5, 3),
      G('dragon', 'Green', 3), G('dragon', 'Red', 2),
    ],
  },
  {
    id: 10,
    category: CATEGORIES.LIKE,
    name: 'The Dozen',
    pattern: '3333 3333 3333 DD',
    points: 50,
    closed: true,
    flowers: 0,
    description: 'Kongs of one number in all three suits — every copy in the set — plus any dragon pair. Closed.',
    variants() {
      const out = [];
      for (let v = 1; v <= 9; v++) for (const d of DRAGONS) {
        out.push([G('bam', v, 4), G('crak', v, 4), G('dot', v, 4), G('dragon', d, 2)]);
      }
      return out;
    },
    example: [G('bam', 3, 4), G('crak', 3, 4), G('dot', 3, 4), G('dragon', 'White', 2)],
  },
  {
    id: 11,
    category: CATEGORIES.LIKE,
    name: 'Sevens & NEWS',
    pattern: '7777 7777 NEWS 77',
    points: 35,
    closed: false,
    flowers: 0,
    description: 'Kongs of one number in two suits, its pair in the third suit, plus one of each wind.',
    variants() {
      const out = [];
      for (let v = 1; v <= 9; v++) {
        for (const pairSuit of NSUITS) {
          const [k1, k2] = others(pairSuit);
          out.push([
            G(k1, v, 4), G(k2, v, 4),
            ...WINDS.map(w => G('wind', w, 1)),
            G(pairSuit, v, 2),
          ]);
        }
      }
      return out;
    },
    example: [
      G('bam', 7, 4), G('crak', 7, 4),
      ...WINDS.map(w => G('wind', w, 1)),
      G('dot', 7, 2),
    ],
  },
  {
    id: 12,
    category: CATEGORIES.LIKE,
    name: 'Nines & Aces',
    pattern: 'FF 9999 999 99 111 11',
    points: 40,
    closed: true,
    flowers: 2,
    description: 'Kong, pung and pair of one number spread across the three suits, plus a pung and pair of a second number in two suits. Needs 2 flowers. Closed.',
    variants() {
      const out = [];
      for (let hi = 1; hi <= 9; hi++) for (let lo = 1; lo <= 9; lo++) {
        if (hi === lo) continue;
        for (const [sk, sp, spr] of perms3) {
          for (const loPung of NSUITS) {
            for (const loPair of others(loPung)) {
              out.push([
                G(sk, hi, 4), G(sp, hi, 3), G(spr, hi, 2),
                G(loPung, lo, 3), G(loPair, lo, 2),
              ]);
            }
          }
        }
      }
      return out;
    },
    example: [
      G('bam', 9, 4), G('crak', 9, 3), G('dot', 9, 2),
      G('bam', 1, 3), G('crak', 1, 2),
    ],
  },

  // ── Winds & Dragons ─────────────────────────────────────────────────────
  {
    id: 13,
    category: CATEGORIES.WINDS,
    name: 'NEWS ×3',
    pattern: 'NNN EEE WWW SSS RG',
    points: 30,
    closed: false,
    flowers: 0,
    description: 'A pung of every wind, plus one Red and one Green dragon. Jokers only in the pungs.',
    variants() {
      return [[
        ...WINDS.map(w => G('wind', w, 3)),
        G('dragon', 'Red', 1), G('dragon', 'Green', 1),
      ]];
    },
    example: [
      ...WINDS.map(w => G('wind', w, 3)),
      G('dragon', 'Red', 1), G('dragon', 'Green', 1),
    ],
  },
  {
    id: 14,
    category: CATEGORIES.WINDS,
    name: 'East–West',
    pattern: 'FF EEEE WWWW SS NN DD',
    points: 35,
    closed: false,
    flowers: 2,
    description: 'Kongs of East and West, pairs of South and North, plus any dragon pair. Needs 2 flowers.',
    variants() {
      return DRAGONS.map(d => [
        G('wind', 'East', 4), G('wind', 'West', 4),
        G('wind', 'South', 2), G('wind', 'North', 2),
        G('dragon', d, 2),
      ]);
    },
    example: [
      G('wind', 'East', 4), G('wind', 'West', 4),
      G('wind', 'South', 2), G('wind', 'North', 2),
      G('dragon', 'Red', 2),
    ],
  },
  {
    id: 15,
    category: CATEGORIES.WINDS,
    name: 'Dragon Fortress',
    pattern: 'RRRR GGGG 0000 NN',
    points: 45,
    closed: true,
    flowers: 0,
    description: 'A kong of every dragon (0 = White "soap"), plus any wind pair. Closed.',
    variants() {
      return WINDS.map(w => [
        G('dragon', 'Red', 4), G('dragon', 'Green', 4), G('dragon', 'White', 4),
        G('wind', w, 2),
      ]);
    },
    example: [
      G('dragon', 'Red', 4), G('dragon', 'Green', 4), G('dragon', 'White', 4),
      G('wind', 'North', 2),
    ],
  },
  {
    id: 16,
    category: CATEGORIES.WINDS,
    name: 'Four Winds',
    pattern: 'EEEE SSS WWW NNNN',
    points: 40,
    closed: true,
    flowers: 0,
    description: 'Kongs of two winds and pungs of the other two — any arrangement. Closed.',
    variants() {
      const out = [];
      for (let i = 0; i < WINDS.length; i++) {
        for (let j = i + 1; j < WINDS.length; j++) {
          const kongs = [WINDS[i], WINDS[j]];
          const pungs = WINDS.filter(w => !kongs.includes(w));
          out.push([
            ...kongs.map(w => G('wind', w, 4)),
            ...pungs.map(w => G('wind', w, 3)),
          ]);
        }
      }
      return out;
    },
    example: [
      G('wind', 'East', 4), G('wind', 'North', 4),
      G('wind', 'South', 3), G('wind', 'West', 3),
    ],
  },

  // ── Singles & Pairs (no jokers anywhere) ────────────────────────────────
  {
    id: 17,
    category: CATEGORIES.SINGLES,
    name: 'Windy City',
    pattern: 'NN EE WW SS RR GG 00',
    points: 50,
    closed: true,
    flowers: 0,
    description: 'Pairs of all four winds and all three dragons. No jokers. Closed.',
    variants() {
      return [[
        ...WINDS.map(w => G('wind', w, 2)),
        ...DRAGONS.map(d => G('dragon', d, 2)),
      ]];
    },
    example: [
      ...WINDS.map(w => G('wind', w, 2)),
      ...DRAGONS.map(d => G('dragon', d, 2)),
    ],
  },
  {
    id: 18,
    category: CATEGORIES.SINGLES,
    name: 'Odd Couple',
    pattern: '11 33 55 77 99 11 33',
    points: 45,
    closed: true,
    flowers: 0,
    description: 'Seven pairs, all odd numbers, any suits. No jokers. Closed.',
    variants() {
      return [[{ poolPairs: { pool: ODD_IDS, count: 7 } }]];
    },
    example: [
      G('bam', 1, 2), G('bam', 3, 2), G('bam', 5, 2), G('bam', 7, 2),
      G('bam', 9, 2), G('crak', 1, 2), G('crak', 3, 2),
    ],
  },
  {
    id: 19,
    category: CATEGORIES.SINGLES,
    name: 'Seven Pairs',
    pattern: '11 22 33 NN EE RR 99',
    points: 40,
    closed: true,
    flowers: 0,
    description: 'Any seven pairs — numbers, winds, or dragons. No jokers. Closed.',
    variants() {
      return [[{ poolPairs: { pool: ALL_PAIRABLE_IDS, count: 7 } }]];
    },
    example: [
      G('bam', 1, 2), G('crak', 2, 2), G('dot', 3, 2),
      G('wind', 'North', 2), G('wind', 'East', 2),
      G('dragon', 'Red', 2), G('dot', 9, 2),
    ],
  },
  {
    id: 20,
    category: CATEGORIES.SINGLES,
    name: 'Year 2026',
    pattern: '2026 2026 2026 RR',
    points: 50,
    closed: true,
    flowers: 0,
    description: 'The year in every suit — 2, 0 (White "soap"), 2, 6 — plus a Red dragon pair. No jokers. Closed.',
    variants() {
      return [[
        ...NSUITS.flatMap(s => [G(s, 2, 2), G(s, 6, 1)]),
        // three soap singles (one per "2026") — n=1 keeps them joker-proof
        ...NSUITS.map(() => G('dragon', 'White', 1)),
        G('dragon', 'Red', 2),
      ]];
    },
    example: [
      G('bam', 2, 2), G('dragon', 'White', 1), G('bam', 6, 1),
      G('crak', 2, 2), G('dragon', 'White', 1), G('crak', 6, 1),
      G('dot', 2, 2), G('dragon', 'White', 1), G('dot', 6, 1),
      G('dragon', 'Red', 2),
    ],
  },

  // ── Quints ──────────────────────────────────────────────────────────────
  {
    id: 21,
    category: CATEGORIES.QUINTS,
    name: 'Bookends',
    pattern: 'FF 11111 99999 5555',
    points: 50,
    closed: false,
    flowers: 2,
    description: 'Quints of 1 and 9 in one suit, plus a kong of 5 in any suit. Quints need jokers. Needs 2 flowers.',
    variants() {
      const out = [];
      for (const s of NSUITS) for (const k of NSUITS) {
        out.push([G(s, 1, 5), G(s, 9, 5), G(k, 5, 4)]);
      }
      return out;
    },
    example: [G('bam', 1, 5), G('bam', 9, 5), G('dot', 5, 4)],
  },
  {
    id: 22,
    category: CATEGORIES.QUINTS,
    name: 'North by South',
    pattern: 'NNNNN SSSSS EEEE',
    points: 55,
    closed: false,
    flowers: 0,
    description: 'Quints of North and South winds plus a kong of East.',
    variants() {
      return [[
        G('wind', 'North', 5), G('wind', 'South', 5), G('wind', 'East', 4),
      ]];
    },
    example: [G('wind', 'North', 5), G('wind', 'South', 5), G('wind', 'East', 4)],
  },
  {
    id: 23,
    category: CATEGORIES.QUINTS,
    name: 'Triple Climb',
    pattern: '11111 22222 3333',
    points: 60,
    closed: false,
    flowers: 0,
    description: 'Two consecutive quints plus a kong of the next number up, all one suit.',
    variants() {
      const out = [];
      for (const s of NSUITS) for (let v = 1; v <= 7; v++) {
        out.push([G(s, v, 5), G(s, v + 1, 5), G(s, v + 2, 4)]);
      }
      return out;
    },
    example: [G('crak', 1, 5), G('crak', 2, 5), G('crak', 3, 4)],
  },
  {
    id: 24,
    category: CATEGORIES.QUINTS,
    name: "Dragon's Hoard",
    pattern: 'RRRRR GGGGG 0000',
    points: 75,
    closed: true,
    flowers: 0,
    description: 'Quints of Red and Green dragons plus a kong of White "soap". The crown jewel. Closed.',
    variants() {
      return [[
        G('dragon', 'Red', 5), G('dragon', 'Green', 5), G('dragon', 'White', 4),
      ]];
    },
    example: [G('dragon', 'Red', 5), G('dragon', 'Green', 5), G('dragon', 'White', 4)],
  },
];

export default WINNING_HANDS;

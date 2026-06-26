// Full 160-tile American Mahjong set
// Bams 1-9 x4=36, Craks 1-9 x4=36, Dots 1-9 x4=36
// Winds (E,W,N,S) x4=16, Dragons (Red,Green,White) x4=12
// Flowers (1-4) x4=16, Jokers x8=8 → Total 160

export const SUITS = {
  BAM: 'bam',
  CRAK: 'crak',
  DOT: 'dot',
  WIND: 'wind',
  DRAGON: 'dragon',
  FLOWER: 'flower',
  JOKER: 'joker',
};

export const WINDS = ['East', 'South', 'West', 'North'];
export const DRAGONS = ['Red', 'Green', 'White'];

// Create a tile definition (not an instance)
export function tileId(suit, value) {
  return `${suit}-${value}`;
}

export const TILE_DEFINITIONS = [
  // Bams 1-9
  ...Array.from({ length: 9 }, (_, i) => ({
    id: tileId(SUITS.BAM, i + 1),
    suit: SUITS.BAM,
    value: i + 1,
    label: `${i + 1}B`,
    color: '#2E7D43',
    count: 4,
  })),
  // Craks 1-9
  ...Array.from({ length: 9 }, (_, i) => ({
    id: tileId(SUITS.CRAK, i + 1),
    suit: SUITS.CRAK,
    value: i + 1,
    label: `${i + 1}C`,
    color: '#2E7D43',
    count: 4,
  })),
  // Dots 1-9
  ...Array.from({ length: 9 }, (_, i) => ({
    id: tileId(SUITS.DOT, i + 1),
    suit: SUITS.DOT,
    value: i + 1,
    label: `${i + 1}D`,
    color: '#1E6FA8', // circles suit — blue
    count: 4,
  })),
  // Winds
  ...WINDS.map(w => ({
    id: tileId(SUITS.WIND, w),
    suit: SUITS.WIND,
    value: w,
    label: w[0],
    color: '#2C3E50',
    count: 4,
  })),
  // Dragons
  ...DRAGONS.map(d => ({
    id: tileId(SUITS.DRAGON, d),
    suit: SUITS.DRAGON,
    value: d,
    label: d[0] === 'W' ? 'Soap' : `${d[0]}D`,
    color: d === 'Red' ? '#C5302B' : d === 'Green' ? '#2E7D43' : '#1E6FA8',
    count: 4,
  })),
  // Flowers 1-4
  ...Array.from({ length: 4 }, (_, i) => ({
    id: tileId(SUITS.FLOWER, i + 1),
    suit: SUITS.FLOWER,
    value: i + 1,
    label: `F${i + 1}`,
    color: '#C95E83',
    count: 4,
  })),
  // Jokers
  {
    id: tileId(SUITS.JOKER, 'joker'),
    suit: SUITS.JOKER,
    value: 'joker',
    label: 'JKR',
    color: '#C5302B',
    count: 8,
  },
];

// Build the full wall (all tile instances)
export function buildWall() {
  const wall = [];
  let uid = 0;
  for (const def of TILE_DEFINITIONS) {
    for (let i = 0; i < def.count; i++) {
      wall.push({
        uid: uid++,
        id: def.id,
        suit: def.suit,
        value: def.value,
        label: def.label,
        color: def.color,
      });
    }
  }
  return wall;
}

// Fisher-Yates shuffle
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function isFlower(tile) {
  return tile.suit === SUITS.FLOWER;
}

export function isJoker(tile) {
  return tile.suit === SUITS.JOKER;
}

export function tilesMatch(a, b) {
  return a.id === b.id;
}

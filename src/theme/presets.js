/**
 * Runtime theme presets.
 *
 * Each preset maps the same semantic tokens onto the CSS custom properties in
 * globals.css. Tile FACES and suit artwork are deliberately not themed — real
 * tiles don't change with the table — but tile BACKS are (with a user
 * override). applyTheme() swaps everything live.
 */

const THEME_KEY = 'mahjong_theme';
const TILEBACK_KEY = 'mahjong_tileback';

export const TILE_BACKS = {
  matcha: { label: 'Matcha', a: '#4A6340', b: '#34472E', c: '#46603C' },
  blossom: { label: 'Blossom', a: '#B3527B', b: '#8E3D60', c: '#C4688D' },
  midnight: { label: 'Midnight', a: '#4A3A6B', b: '#332852', c: '#55437A' },
  jade: { label: 'Jade', a: '#2F6B4F', b: '#1F4A38', c: '#3A7A5C' },
};

export const THEME_PRESETS = {
  matchaGarden: {
    label: 'Matcha Garden',
    emoji: '🍵',
    tileBack: 'matcha',
    tokens: {
      bg: '#F4EEE2', paper: '#FBF7EF', table: '#ECE6D8',
      primary: '#5F7D4F', deep: '#3C5236',
      rose: '#C95E83', roseDeep: '#A8456A',
      sky: '#5E92B3', sage: '#9DB58E',
      ink: '#33302A', deepInk: '#2B3A2A',
      surfaceDeep: '#2B3A2A', shadow: '#3C5236',
    },
  },
  midnightBloom: {
    label: 'Midnight Bloom',
    emoji: '🌙',
    tileBack: 'midnight',
    tokens: {
      bg: '#251C36', paper: '#33284B', table: '#1E172B',
      primary: '#C75E97', deep: '#F3DCEB',
      rose: '#FF9DBF', roseDeep: '#D9779F',
      sky: '#7FB8DC', sage: '#8E7FB3',
      ink: '#F1EAF8', deepInk: '#EDE2F4',
      surfaceDeep: '#191225', shadow: '#000000',
    },
  },
  coastalCalm: {
    label: 'Coastal Calm',
    emoji: '🌊',
    tileBack: 'jade',
    tokens: {
      bg: '#F2EFE6', paper: '#FBFAF4', table: '#E3E9E4',
      primary: '#4E7A96', deep: '#2E4A5C',
      rose: '#D97757', roseDeep: '#B85F44',
      sky: '#6FA3BE', sage: '#A9C3CE',
      ink: '#2F3438', deepInk: '#33424E',
      surfaceDeep: '#22394A', shadow: '#3A5468',
    },
  },
  classicJade: {
    label: 'Classic Jade',
    emoji: '🀄',
    tileBack: 'jade',
    tokens: {
      bg: '#F1EFE3', paper: '#FAF8EC', table: '#D7E4D0',
      primary: '#2E6E52', deep: '#1F4A38',
      rose: '#B03A2E', roseDeep: '#8E2E24',
      sky: '#4A8FA0', sage: '#7FAE95',
      ink: '#2E3229', deepInk: '#26402F',
      surfaceDeep: '#1F3A2C', shadow: '#1F3A2C',
    },
  },
};

export const DEFAULT_THEME = 'matchaGarden';

function hexToRgbTriplet(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

export function getSavedTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return THEME_PRESETS[t] ? t : DEFAULT_THEME;
  } catch { return DEFAULT_THEME; }
}

export function getSavedTileBack() {
  try {
    const t = localStorage.getItem(TILEBACK_KEY);
    return TILE_BACKS[t] ? t : null; // null = follow theme default
  } catch { return null; }
}

export function setTileBack(key) {
  try { localStorage.setItem(TILEBACK_KEY, key); } catch { /* best effort */ }
  applyTileBack(key);
}

export function applyTileBack(key) {
  const p = TILE_BACKS[key] || TILE_BACKS.matcha;
  const root = document.documentElement;
  root.style.setProperty('--tb-a', p.a);
  root.style.setProperty('--tb-b', p.b);
  root.style.setProperty('--tb-c', p.c);
}

export function applyTheme(presetKey = DEFAULT_THEME, { persist = true } = {}) {
  const preset = THEME_PRESETS[presetKey] || THEME_PRESETS[DEFAULT_THEME];
  const t = preset.tokens;
  const root = document.documentElement;

  root.style.setProperty('--bg', t.bg);
  root.style.setProperty('--paper', t.paper);
  root.style.setProperty('--table', t.table);
  root.style.setProperty('--matcha', t.primary);
  root.style.setProperty('--matcha-deep', t.deep);
  root.style.setProperty('--rose', t.rose);
  root.style.setProperty('--rose-deep', t.roseDeep);
  root.style.setProperty('--sky', t.sky);
  root.style.setProperty('--sage', t.sage);
  root.style.setProperty('--ink', t.ink);
  root.style.setProperty('--surface-deep', t.surfaceDeep);

  root.style.setProperty('--matcha-rgb', hexToRgbTriplet(t.primary));
  root.style.setProperty('--rose-rgb', hexToRgbTriplet(t.rose));
  root.style.setProperty('--sky-rgb', hexToRgbTriplet(t.sky));
  root.style.setProperty('--ink-rgb', hexToRgbTriplet(t.ink));
  root.style.setProperty('--deep-rgb', hexToRgbTriplet(t.deepInk));
  root.style.setProperty('--shadow-rgb', hexToRgbTriplet(t.shadow));
  root.style.setProperty('--paper-rgb', hexToRgbTriplet(t.paper));

  // Tile back: user override wins, else the theme's default.
  applyTileBack(getSavedTileBack() || preset.tileBack);

  // Keep the browser/PWA chrome in step.
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = t.bg;

  if (persist) {
    try { localStorage.setItem(THEME_KEY, presetKey); } catch { /* best effort */ }
  }
}

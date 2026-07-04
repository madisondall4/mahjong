const STORAGE_KEY = 'mahjong_saved_game';
const DIFFICULTY_KEY = 'mahjong_difficulty';
// v2: flowers became ordinary in-hand tiles (152-tile set); v1 saves are incompatible.
const SAVE_VERSION = 2;

export const DIFFICULTIES = {
  CHILL: 'chill',
  SPICY: 'spicy',
  RUTHLESS: 'ruthless',
};

export function getDifficulty() {
  try {
    const val = localStorage.getItem(DIFFICULTY_KEY);
    if (val && Object.values(DIFFICULTIES).includes(val)) return val;
  } catch { /* best effort */ }
  return DIFFICULTIES.SPICY;
}

export function setDifficulty(d) {
  try { localStorage.setItem(DIFFICULTY_KEY, d); } catch { /* best effort */ }
}

export function saveGame(state) {
  try {
    const data = { v: SAVE_VERSION, state, ts: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* best effort */ }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.v !== SAVE_VERSION) return null;
    const s = data.state;
    if (!s || !s.phase || s.phase === 'home') return null;
    return {
      ...s,
      thinkingPlayer: null,
      waitingForAI: false,
    };
  } catch {
    clearSavedGame();
    return null;
  }
}

export function clearSavedGame() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* best effort */ }
}

export function getSavedGameInfo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.v !== SAVE_VERSION) return null;
    const s = data.state;
    if (!s || !s.phase || s.phase === 'home') return null;
    return {
      phase: s.phase,
      roundNumber: s.roundNumber || 1,
      tilesRemaining: s.wall ? s.wall.length - (s.wallIndex || 0) : 0,
      timestamp: data.ts,
    };
  } catch {
    return null;
  }
}

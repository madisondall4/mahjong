const STORAGE_KEY = 'mahjong_saved_game';
const DIFFICULTY_KEY = 'mahjong_difficulty';
const SAVE_VERSION = 1;

export const DIFFICULTIES = {
  CHILL: 'chill',
  SPICY: 'spicy',
  RUTHLESS: 'ruthless',
};

export function getDifficulty() {
  try {
    const val = localStorage.getItem(DIFFICULTY_KEY);
    if (val && Object.values(DIFFICULTIES).includes(val)) return val;
  } catch (_) {}
  return DIFFICULTIES.SPICY;
}

export function setDifficulty(d) {
  try { localStorage.setItem(DIFFICULTY_KEY, d); } catch (_) {}
}

export function saveGame(state) {
  try {
    const data = { v: SAVE_VERSION, state, ts: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
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
  } catch (_) {
    clearSavedGame();
    return null;
  }
}

export function clearSavedGame() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
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
  } catch (_) {
    return null;
  }
}

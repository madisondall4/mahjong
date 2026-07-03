// Coach-tip preferences, shared by CoachTips and the Home rules panel.

const SEEN_KEY = 'mahjong_coach_seen';
const OFF_KEY = 'mahjong_coach_off';

export function getSeenTips() {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); }
  catch { return new Set(); }
}

export function persistSeenTips(seen) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...seen])); } catch { /* best effort */ }
}

export function isCoachEnabled() {
  try { return localStorage.getItem(OFF_KEY) !== '1'; } catch { return true; }
}

export function setCoachEnabled(on) {
  try {
    if (on) {
      localStorage.removeItem(OFF_KEY);
      localStorage.removeItem(SEEN_KEY);
    } else {
      localStorage.setItem(OFF_KEY, '1');
    }
  } catch { /* best effort */ }
}

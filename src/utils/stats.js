/**
 * Lifetime stats, hand journal, and daily challenge persistence.
 * All stored under one localStorage key; every write is guarded so a
 * corrupted store self-heals to defaults.
 */

import { GARDEN_CARD, getActiveCard } from '../data/card.js';

const KEY = 'mahjong_stats';
const VERSION = 1;

function emptyStats() {
  return {
    v: VERSION,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    totalWinPoints: 0,
    bestHand: null, // { name, points, date }
    currentStreak: 0,
    bestStreak: 0,
    handsWon: {}, // `${cardYear}:${handId}` -> count
    daily: { streak: 0, lastWinDate: null, completed: {} }, // completed: date -> 'win'|'gold'
    recentGameIds: [],
  };
}

export function getStats() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyStats();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== VERSION) return emptyStats();
    return { ...emptyStats(), ...parsed };
  } catch {
    return emptyStats();
  }
}

function save(stats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    // storage full/unavailable — stats are best-effort
  }
}

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Deterministic featured hand for a date — same for every player, changes daily.
 */
export function getDailyChallenge(dateKey = todayKey()) {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) {
    h = (h * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  // Daily challenge is always seeded from the built-in Garden Card so it is
  // the same for every player regardless of which card they play.
  const hands = GARDEN_CARD.hands;
  const hand = hands[h % hands.length];
  const stats = getStats();
  const status = stats.daily.completed[dateKey] || null; // null | 'win' | 'gold'
  return { dateKey, hand, status, streak: stats.daily.streak };
}

function yesterdayKey(dateKey) {
  const d = new Date(`${dateKey}T12:00:00`);
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

/**
 * Record a finished game exactly once (idempotent by gameId).
 * @param {Object} p
 * @param {string} p.gameId
 * @param {number|null} p.winnerIdx - 0 = human
 * @param {Object|null} p.handDef - winning hand definition
 * @param {boolean} p.wallExhausted
 */
export function recordGameEnd({ gameId, winnerIdx, handDef, wallExhausted }) {
  const stats = getStats();
  if (gameId && stats.recentGameIds.includes(gameId)) return stats;

  stats.gamesPlayed += 1;
  if (gameId) {
    stats.recentGameIds = [...stats.recentGameIds.slice(-19), gameId];
  }

  if (wallExhausted || winnerIdx === null || winnerIdx === undefined) {
    stats.draws += 1;
    stats.currentStreak = 0;
  } else if (winnerIdx === 0) {
    stats.wins += 1;
    stats.currentStreak += 1;
    stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
    if (handDef) {
      stats.totalWinPoints += handDef.points || 0;
      if (!stats.bestHand || (handDef.points || 0) > stats.bestHand.points) {
        stats.bestHand = { name: handDef.name, points: handDef.points, date: todayKey() };
      }
      const key = `${getActiveCard().meta.year}:${handDef.id}`;
      stats.handsWon[key] = (stats.handsWon[key] || 0) + 1;

      // Daily challenge
      const today = todayKey();
      const featured = getDailyChallenge(today).hand;
      const gold = featured && featured.id === handDef.id;
      const prev = stats.daily.completed[today];
      if (!prev || (gold && prev !== 'gold')) {
        stats.daily.completed[today] = gold ? 'gold' : 'win';
      }
      if (stats.daily.lastWinDate !== today) {
        stats.daily.streak = stats.daily.lastWinDate === yesterdayKey(today)
          ? stats.daily.streak + 1
          : 1;
        stats.daily.lastWinDate = today;
      }
      // keep completed map bounded
      const keys = Object.keys(stats.daily.completed).sort();
      if (keys.length > 60) {
        for (const k of keys.slice(0, keys.length - 60)) delete stats.daily.completed[k];
      }
    }
  } else {
    stats.losses += 1;
    stats.currentStreak = 0;
  }

  save(stats);
  return stats;
}

/**
 * Journal summary: which of the 24 hands the player has won, and totals.
 */
export function getJournal() {
  const stats = getStats();
  const card = getActiveCard();
  const entries = card.hands.map(hand => ({
    hand,
    count: stats.handsWon[`${card.meta.year}:${hand.id}`] || 0,
  }));
  const uniqueWon = entries.filter(e => e.count > 0).length;
  return { entries, uniqueWon, total: card.hands.length };
}

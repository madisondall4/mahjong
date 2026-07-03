import React, { useState } from 'react';

/**
 * First-game coach: phase-aware tip cards that walk a brand-new player
 * through the Charleston, drawing/discarding, the advisor, and calling
 * Mahjong. Non-blocking, dismissible per tip, auto-retires after the
 * core tips are seen. Replayable from the Home rules panel.
 */

const SEEN_KEY = 'mahjong_coach_seen';
const OFF_KEY = 'mahjong_coach_off';

function getSeen() {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); }
  catch { return new Set(); }
}

function persistSeen(seen) {
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

const TIPS = [
  {
    id: 'charleston',
    when: s => s.phase === 'charleston' && s.charleston?.round === 1 && s.charleston?.step === 0,
    icon: '🌱',
    title: 'Welcome to the Charleston!',
    text: 'Every game opens with tile passing. Pick the 3 tiles that fit your hand least and pass them along. Not sure what to keep? Tap 💡 Hands to see which winning hands you’re closest to.',
  },
  {
    id: 'charleston2',
    when: s => s.phase === 'charleston' && s.charleston?.round === 2 && s.charleston?.step === 0,
    icon: '🔁',
    title: 'Second Charleston (optional)',
    text: 'If your hand already has a direction, you can Skip. Otherwise keep trading — three more passes.',
  },
  {
    id: 'discard',
    when: s => s.phase === 'playing' && s.currentPlayer === 0 && (s.players?.[0]?.hand?.length || 0) === 14 && !s.humanCanDeclare,
    icon: '🀄',
    title: 'Your turn: draw, then discard',
    text: 'You drew a tile automatically. Now tap a tile to select it, and tap it again to discard. Build toward one of the 24 hands on the card.',
  },
  {
    id: 'advisor',
    when: s => s.phase === 'playing' && (s.discardPile?.length || 0) >= 4,
    icon: '💡',
    title: 'Feeling lost? That’s normal.',
    text: 'Tap 💡 Hands any time — it ranks all 24 winning hands by how many tiles away you are and shows exactly what you still need.',
  },
  {
    id: 'call',
    when: s => s.phase === 'playing' && s.canHumanCallMahjong,
    icon: '🎉',
    title: 'You can win on that discard!',
    text: 'That discarded tile completes one of your hands. Tap the glowing Mahjong button to claim it — or pass and keep building.',
  },
  {
    id: 'declare',
    when: s => s.phase === 'playing' && s.humanCanDeclare,
    icon: '🏆',
    title: 'Your hand is complete!',
    text: 'Your 14 tiles match a winning hand. Tap Mahjong! at the top to declare and win the round.',
  },
];

export default function CoachTips({ gameState }) {
  const [seenTick, setSeenTick] = useState(0); // re-render after dismiss

  if (gameState.mode === 'pass') return null; // coach is a solo-mode feature
  if (!isCoachEnabled()) return null;
  const seen = getSeen();
  const tip = TIPS.find(t => !seen.has(t.id) && t.when(gameState));
  if (!tip) return null;

  function dismiss() {
    const s = getSeen();
    s.add(tip.id);
    persistSeen(s);
    if (TIPS.every(t => s.has(t.id))) setCoachEnabled(false);
    setSeenTick(seenTick + 1);
  }

  return (
    <div style={{
      position: 'absolute', top: 58, left: 12, right: 12, zIndex: 30,
      background: 'rgba(251,247,239,0.98)',
      border: '1.5px solid rgba(95,125,79,0.45)',
      borderRadius: 14, padding: '12px 14px',
      boxShadow: '0 10px 30px rgba(60,82,54,0.22)',
      display: 'flex', gap: 10, alignItems: 'flex-start',
      animation: 'fadeInUp 0.35s ease-out',
    }}>
      <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1.2 }}>{tip.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#3C5236', marginBottom: 2 }}>
          {tip.title}
        </div>
        <div style={{ fontSize: 12, fontFamily: 'Nunito', color: 'rgba(51,48,42,0.75)', lineHeight: 1.5 }}>
          {tip.text}
        </div>
      </div>
      <button
        onClick={dismiss}
        style={{
          flexShrink: 0,
          background: '#5F7D4F', color: 'white', border: 'none',
          borderRadius: 999, padding: '6px 13px',
          fontSize: 11.5, fontFamily: 'Nunito', fontWeight: 800, cursor: 'pointer',
          alignSelf: 'center',
        }}
      >
        Got it
      </button>
    </div>
  );
}

import React, { useState } from 'react';
import MahjongTile from './MahjongTile';

const STEP_LABELS = {
  // round 1
  '1-0': { dir: 'RIGHT →', desc: 'Pass 3 tiles to the right' },
  '1-1': { dir: '← ACROSS →', desc: 'Pass 3 tiles across' },
  '1-2': { dir: '← LEFT', desc: 'Pass 3 tiles to the left (may blind pass up to 3)' },
  // round 2
  '2-0': { dir: '← LEFT', desc: 'Pass 3 tiles to the left' },
  '2-1': { dir: '← ACROSS →', desc: 'Pass 3 tiles across' },
  '2-2': { dir: 'RIGHT →', desc: 'Pass 3 tiles to the right (may blind pass up to 3)' },
};

/**
 * Charleston tile selection UI
 * @param {Object[]} hand - player's current hand
 * @param {Object[]} flowers - player's flowers
 * @param {Object[]} receivedTiles - tiles received in this pass (to show)
 * @param {number} charlestonRound - 1 or 2
 * @param {number} charlestonStep - 0, 1, or 2
 * @param {function} onPass - (selectedUids: number[]) => void
 * @param {boolean} waitingForAI - AI is processing
 * @param {Object[]} incomingTiles - tiles just received (null if first pass)
 */
export default function CharlestonUI({
  hand = [],
  flowers = [],
  charlestonRound = 1,
  charlestonStep = 0,
  onPass,
  waitingForAI = false,
  incomingTiles = null,
}) {
  const [selected, setSelected] = useState(new Set());
  const label = STEP_LABELS[`${charlestonRound}-${charlestonStep}`] || { dir: '', desc: '' };
  const canBlindPass = (charlestonRound === 1 && charlestonStep === 2) || (charlestonRound === 2 && charlestonStep === 2);

  function toggleTile(uid) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(uid)) {
        next.delete(uid);
      } else if (next.size < 3) {
        next.add(uid);
      }
      return next;
    });
  }

  function handlePass() {
    if (selected.size !== 3) return;
    onPass([...selected]);
    setSelected(new Set());
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 16, padding: 16, flex: 1,
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div className="eyebrow" style={{ color: 'rgba(var(--ink-rgb),0.45)' }}>
          Charleston Round {charlestonRound}
        </div>
        <div style={{ fontSize: 24, fontFamily: 'Playfair Display, serif', color: 'var(--matcha-deep)', fontWeight: 700, marginTop: 4 }}>
          {label.dir}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(var(--ink-rgb),0.6)', fontFamily: 'Nunito', marginTop: 4 }}>
          {label.desc}
        </div>
      </div>

      {/* Incoming tiles */}
      {incomingTiles && incomingTiles.length > 0 && (
        <div style={{
          background: 'rgba(var(--matcha-rgb),0.08)',
          border: '1px solid rgba(var(--matcha-rgb),0.2)',
          borderRadius: 10,
          padding: '10px 14px',
        }}>
          <div style={{ fontSize: 11, color: 'var(--matcha)', fontFamily: 'Nunito', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ↓ Tiles received:
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {incomingTiles.map(t => (
              <MahjongTile key={t.uid} tile={t} size="md" animateIn/>
            ))}
          </div>
        </div>
      )}

      {/* Selection counter */}
      <div style={{ textAlign: 'center', fontSize: 13, fontFamily: 'Nunito', color: selected.size === 3 ? 'var(--matcha)' : 'rgba(var(--ink-rgb),0.6)' }}>
        Selected: <strong>{selected.size}</strong>/3
        {canBlindPass && (
          <span style={{ color: 'rgba(var(--ink-rgb),0.4)', marginLeft: 8, fontSize: 11 }}>
            (blind pass allowed)
          </span>
        )}
      </div>

      {/* Hand tiles + flowers together */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center',
        padding: '8px 0', flex: 1, alignContent: 'flex-start',
      }}>
        {flowers.map(f => (
          <div key={f.uid} style={{ opacity: 0.85 }}>
            <MahjongTile tile={f} size="md"/>
          </div>
        ))}
        {flowers.length > 0 && hand.length > 0 && (
          <div style={{
            width: 2, alignSelf: 'stretch',
            marginTop: 4, marginBottom: 4,
            borderRadius: 1,
            background: 'rgba(var(--rose-rgb),0.25)',
          }}/>
        )}
        {hand.map(tile => (
          <div
            key={tile.uid}
            style={{
              transform: selected.has(tile.uid) ? 'translateY(-10px)' : 'translateY(0)',
              transition: 'transform 0.15s ease',
            }}
          >
            <MahjongTile
              tile={tile}
              size="md"
              selected={selected.has(tile.uid)}
              onClick={() => toggleTile(tile.uid)}
            />
          </div>
        ))}
      </div>

      {/* Pass button */}
      {waitingForAI ? (
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--sky)', fontFamily: 'Nunito', animation: 'pulse 1s ease-in-out infinite' }}>
          AI players are choosing tiles...
        </div>
      ) : (
        <button
          onClick={handlePass}
          disabled={selected.size !== 3}
          style={{
            padding: '14px 0',
            borderRadius: 999,
            border: 'none',
            background: selected.size === 3 ? 'var(--matcha)' : 'rgba(var(--matcha-rgb),0.12)',
            color: selected.size === 3 ? 'white' : 'rgba(var(--ink-rgb),0.35)',
            fontSize: 15,
            fontWeight: 800,
            fontFamily: 'Playfair Display, serif',
            cursor: selected.size === 3 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            letterSpacing: '0.04em',
            boxShadow: selected.size === 3 ? '0 4px 16px rgba(var(--matcha-rgb),0.35)' : 'none',
          }}
        >
          Pass {selected.size === 3 ? '3 Tiles' : `(${selected.size}/3 selected)`}
        </button>
      )}
    </div>
  );
}

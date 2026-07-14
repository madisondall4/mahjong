import React from 'react';
import MahjongTile from './MahjongTile';

const MELD_NAMES = { 3: 'Pung', 4: 'Kong', 5: 'Quint' };

/**
 * Center discard pool showing all discarded tiles
 * @param {Object[]} discards - array of discarded tiles
 * @param {Object} lastDiscard - most recent discard (highlighted)
 * @param {function} onCallMahjong - called when player taps to call mahjong on discard
 * @param {boolean} canCall - whether human can call this discard for the win
 * @param {Array<{n,jokersUsed}>} exposeOptions - legal exposure claims
 * @param {function} onExpose - (option) => void
 * @param {function} onPassCall - decline the call window
 */
export default function DiscardPool({
  discards = [], lastDiscard = null, lastDiscardByName = null,
  onCallMahjong, canCall = false,
  exposeOptions = [], onExpose, onPassCall,
}) {
  const promptOpen = lastDiscard && (canCall || exposeOptions.length > 0);
  // Show last ~30 discards in a compact grid
  const toShow = discards.slice(-30);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      minHeight: 0,
      padding: '4px 6px',
    }}>
      {/* Discard grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        justifyContent: 'center',
        alignContent: 'center',
        maxWidth: 220,
      }}>
        {toShow.map((tile) => {
          const isLast = lastDiscard && tile.uid === lastDiscard.uid;
          return (
            <div
              key={tile.uid}
              style={{
                transform: isLast ? 'scale(1.15)' : 'scale(1)',
                zIndex: isLast ? 2 : 1,
                transition: 'transform 0.2s ease',
              }}
            >
              <MahjongTile
                tile={tile}
                size="sm"
                winning={isLast && canCall}
              />
            </div>
          );
        })}
        {discards.length === 0 && (
          <div style={{
            width: 120, height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            color: 'rgba(var(--ink-rgb),0.4)',
            fontFamily: 'Playfair Display, serif',
            fontStyle: 'italic',
          }}>
            No discards yet
          </div>
        )}
      </div>

      {/* Who threw the last tile */}
      {lastDiscard && lastDiscardByName && !promptOpen && (
        <div style={{
          fontSize: 10.5, fontFamily: 'Nunito', fontWeight: 700,
          color: 'rgba(var(--ink-rgb),0.45)',
        }}>
          ↑ {lastDiscardByName}&apos;s discard
        </div>
      )}

      {/* Call window: mahjong / exposure claims / pass */}
      {promptOpen && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
          {canCall && (
            <button
              onClick={onCallMahjong}
              style={{
                background: 'linear-gradient(135deg, var(--matcha), var(--rose))',
                color: 'white',
                border: 'none',
                borderRadius: 20,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 800,
                fontFamily: 'Playfair Display, serif',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(var(--matcha-rgb),0.4)',
                animation: 'pulseGlow 1s ease-in-out infinite',
                letterSpacing: '0.05em',
              }}
            >
              🀄 Mahjong!
            </button>
          )}
          {exposeOptions.map(opt => (
            <button
              key={opt.n}
              onClick={() => onExpose?.(opt)}
              style={{
                background: 'rgba(var(--sky-rgb),0.14)',
                color: 'var(--sky)',
                border: '1.5px solid rgba(var(--sky-rgb),0.45)',
                borderRadius: 20,
                padding: '7px 14px',
                fontSize: 12,
                fontWeight: 800,
                fontFamily: 'Nunito, sans-serif',
                cursor: 'pointer',
              }}
            >
              Call {MELD_NAMES[opt.n]} ×{opt.n}{opt.jokersUsed > 0 ? ` (${opt.jokersUsed}🃏)` : ''}
            </button>
          ))}
          <button
            onClick={onPassCall}
            style={{
              background: 'transparent',
              color: 'rgba(var(--ink-rgb),0.55)',
              border: '1px solid rgba(var(--ink-rgb),0.25)',
              borderRadius: 20,
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'Nunito, sans-serif',
              cursor: 'pointer',
            }}
          >
            Pass
          </button>
        </div>
      )}
    </div>
  );
}

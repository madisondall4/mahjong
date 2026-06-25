import React from 'react';
import MahjongTile from './MahjongTile';

/**
 * Center discard pool showing all discarded tiles
 * @param {Object[]} discards - array of discarded tiles
 * @param {Object} lastDiscard - most recent discard (highlighted)
 * @param {function} onCallMahjong - called when player taps to call mahjong on discard
 * @param {boolean} canCall - whether human can call this discard
 */
export default function DiscardPool({ discards = [], lastDiscard = null, onCallMahjong, canCall = false }) {
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
        {toShow.map((tile, idx) => {
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
            fontSize: 11,
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'Nunito',
            fontStyle: 'italic',
          }}>
            No discards yet
          </div>
        )}
      </div>

      {/* Call Mahjong button */}
      {canCall && lastDiscard && (
        <button
          onClick={onCallMahjong}
          style={{
            background: 'linear-gradient(135deg, #5E8C3E, #E2A03F)',
            color: 'white',
            border: 'none',
            borderRadius: 20,
            padding: '8px 20px',
            fontSize: 13,
            fontWeight: 800,
            fontFamily: 'Playfair Display, serif',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(94,140,62,0.4)',
            animation: 'pulseGlow 1s ease-in-out infinite',
            letterSpacing: '0.05em',
          }}
        >
          🀄 Call Mahjong!
        </button>
      )}
    </div>
  );
}

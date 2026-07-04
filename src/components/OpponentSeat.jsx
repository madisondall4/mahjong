import React from 'react';
import MahjongTile from './MahjongTile';

const FAKE_TILE = { uid: -1, suit: 'bam', value: 1, label: '1B', id: 'bam-1', color: 'var(--matcha)' };

/**
 * Opponent seat - compact face-down display
 * @param {Object} player - player object
 * @param {'top'|'left'|'right'} position - seat position
 * @param {boolean} isThinking - show thinking animation
 * @param {boolean} isCurrentTurn - highlight current turn
 */
export default function OpponentSeat({ player, position = 'top', isThinking = false, isCurrentTurn = false }) {
  const tileCount = player.hand.length;
  const maxVisible = position === 'top' ? 10 : 6;
  const shown = Math.min(tileCount, maxVisible);

  const seatStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '6px 8px',
    borderRadius: 8,
    background: isCurrentTurn ? 'rgba(var(--matcha-rgb),0.16)' : 'rgba(var(--paper-rgb),0.72)',
    border: isCurrentTurn ? '1px solid rgba(var(--matcha-rgb),0.5)' : '1px solid rgba(var(--matcha-rgb),0.18)',
    transition: 'all 0.3s ease',
    boxShadow: isThinking ? '0 0 20px rgba(var(--sky-rgb),0.4)' : 'none',
    animation: isThinking ? 'pulseGlow 1.5s ease-in-out infinite' : 'none',
    minWidth: position === 'top' ? 120 : 60,
  };

  const isVertical = position === 'left' || position === 'right';

  return (
    <div style={seatStyle}>
      {/* Player name */}
      <div style={{
        fontSize: 11,
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 700,
        color: isCurrentTurn ? 'var(--matcha-deep)' : 'rgba(var(--ink-rgb),0.55)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        {isThinking && (
          <span style={{ animation: 'pulse 1s infinite' }}>
            <svg width="8" height="8" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" fill="var(--sky)"/>
            </svg>
          </span>
        )}
        {player.name}
        {isCurrentTurn && !isThinking && (
          <svg width="6" height="8" viewBox="0 0 6 8" fill="var(--matcha)">
            <polygon points="0,0 6,4 0,8"/>
          </svg>
        )}
      </div>

      {/* Tiles row */}
      <div style={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        gap: 2,
        flexWrap: isVertical ? 'nowrap' : 'wrap',
        justifyContent: 'center',
        maxWidth: isVertical ? 36 : 200,
        maxHeight: isVertical ? 180 : 44,
        overflow: 'hidden',
      }}>
        {Array.from({ length: shown }).map((_, i) => (
          <MahjongTile
            key={i}
            tile={FAKE_TILE}
            size="sm"
            faceDown
          />
        ))}
        {tileCount > maxVisible && (
          <div style={{
            width: 28, height: 36,
            borderRadius: 3,
            background: 'rgba(var(--matcha-rgb),0.1)',
            border: '1px dashed rgba(var(--matcha-rgb),0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            color: 'var(--matcha)',
            fontFamily: 'Nunito',
            fontWeight: 700,
          }}>
            +{tileCount - maxVisible}
          </div>
        )}
      </div>

      {/* Exposed melds — public information, face-up */}
      {(player.exposures || []).length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          gap: 3,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: isVertical ? 40 : 200,
        }}>
          {player.exposures.map((meld, mi) => (
            <div key={mi} style={{
              display: 'flex',
              flexDirection: isVertical ? 'column' : 'row',
              gap: 1,
              padding: 2, borderRadius: 5,
              background: 'rgba(var(--sky-rgb),0.12)',
              border: '1px solid rgba(var(--sky-rgb),0.3)',
            }}>
              {meld.tiles.map(t => <MahjongTile key={t.uid} tile={t} size="sm"/>)}
            </div>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div style={{
        display: 'flex',
        gap: 8,
        fontSize: 10,
        color: 'rgba(var(--ink-rgb),0.5)',
        fontFamily: 'Nunito',
      }}>
        <span>{tileCount} tiles</span>
      </div>
    </div>
  );
}

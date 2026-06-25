import React from 'react';
import MahjongTile from './MahjongTile';

const FAKE_TILE = { uid: -1, suit: 'bam', value: 1, label: '1B', id: 'bam-1', color: '#A4D65E' };

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
    background: isCurrentTurn ? 'rgba(164,214,94,0.1)' : 'rgba(43,58,42,0.6)',
    border: isCurrentTurn ? '1px solid rgba(164,214,94,0.5)' : '1px solid rgba(94,140,62,0.1)',
    transition: 'all 0.3s ease',
    boxShadow: isThinking ? '0 0 20px rgba(127,179,164,0.4)' : 'none',
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
        color: isCurrentTurn ? '#A4D65E' : 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        {isThinking && (
          <span style={{ animation: 'pulse 1s infinite' }}>
            <svg width="8" height="8" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" fill="#7FB3A4"/>
            </svg>
          </span>
        )}
        {player.name}
        {isCurrentTurn && !isThinking && (
          <svg width="6" height="8" viewBox="0 0 6 8" fill="#A4D65E">
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
            background: 'rgba(164,214,94,0.1)',
            border: '1px dashed rgba(164,214,94,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            color: '#A4D65E',
            fontFamily: 'Nunito',
            fontWeight: 700,
          }}>
            +{tileCount - maxVisible}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        gap: 8,
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Nunito',
      }}>
        <span>{tileCount} tiles</span>
        {player.flowers.length > 0 && (
          <span style={{ color: '#E2A03F' }}>🌸×{player.flowers.length}</span>
        )}
      </div>
    </div>
  );
}

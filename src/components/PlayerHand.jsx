import React, { useRef } from 'react';
import MahjongTile from './MahjongTile';

/**
 * The human player's hand - horizontal scroll row pinned to bottom.
 * @param {Object[]} tiles - array of tile objects
 * @param {Set<number>} selectedUids - set of selected tile uids
 * @param {function} onTileClick - (tile) => void
 * @param {boolean} canDiscard - whether player can discard
 * @param {boolean} animateIn - deal animation
 * @param {Object[]} flowers - player's flower tiles
 */
export default function PlayerHand({ tiles = [], selectedUids = new Set(), onTileClick, canDiscard = false, animateIn = false, flowers = [] }) {
  const scrollRef = useRef(null);

  return (
    <div className="relative">
      {/* Flowers above hand */}
      {flowers.length > 0 && (
        <div className="flex items-center gap-1 px-3 mb-1">
          <span style={{ fontSize: 10, color: '#c9a84c', fontFamily: 'Nunito', fontWeight: 600 }}>Flowers:</span>
          {flowers.map((f, i) => (
            <MahjongTile key={f.uid} tile={f} size="sm"/>
          ))}
        </div>
      )}

      {/* Hand row */}
      <div
        ref={scrollRef}
        className="no-scrollbar"
        style={{
          overflowX: 'auto',
          overflowY: 'visible',
          paddingBottom: 20,
          paddingTop: 20,
          paddingLeft: 12,
          paddingRight: 12,
          display: 'flex',
          gap: 5,
          alignItems: 'flex-end',
          minHeight: 88,
        }}
      >
        {tiles.map((tile, idx) => (
          <div
            key={tile.uid}
            style={{
              flexShrink: 0,
              transition: 'transform 0.15s ease',
            }}
          >
            <MahjongTile
              tile={tile}
              size="md"
              selected={selectedUids.has(tile.uid)}
              onClick={canDiscard || onTileClick ? () => onTileClick?.(tile) : undefined}
              animateIn={animateIn}
              animDelay={idx * 50}
            />
          </div>
        ))}
      </div>

      {/* Discard hint */}
      {canDiscard && (
        <div style={{
          textAlign: 'center',
          fontSize: 11,
          color: '#c9a84c',
          fontFamily: 'Nunito',
          fontWeight: 600,
          marginTop: -14,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          Tap a tile to discard
        </div>
      )}
    </div>
  );
}

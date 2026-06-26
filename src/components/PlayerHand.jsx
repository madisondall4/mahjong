import React, { useRef } from 'react';
import MahjongTile from './MahjongTile';

export default function PlayerHand({ tiles = [], selectedUids = new Set(), onTileClick, canDiscard = false, animateIn = false, flowers = [] }) {
  const scrollRef = useRef(null);

  return (
    <div className="relative">
      {/* Hand row — flowers + tiles together */}
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
          gap: 6,
          alignItems: 'flex-end',
          minHeight: 112,
        }}
      >
        {/* Flowers shown inline at same size, not selectable */}
        {flowers.map((f, idx) => (
          <div key={f.uid} style={{ flexShrink: 0, opacity: 0.85 }}>
            <MahjongTile
              tile={f}
              size="lg"
              animateIn={animateIn}
              animDelay={idx * 50}
            />
          </div>
        ))}

        {/* Divider between flowers and hand */}
        {flowers.length > 0 && tiles.length > 0 && (
          <div style={{
            width: 2,
            alignSelf: 'stretch',
            marginTop: 8,
            marginBottom: 8,
            borderRadius: 1,
            background: 'rgba(201,94,131,0.25)',
            flexShrink: 0,
          }}/>
        )}

        {/* Hand tiles */}
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
              size="lg"
              selected={selectedUids.has(tile.uid)}
              onClick={canDiscard || onTileClick ? () => onTileClick?.(tile) : undefined}
              animateIn={animateIn}
              animDelay={(flowers.length + idx) * 50}
            />
          </div>
        ))}
      </div>

      {/* Discard hint */}
      {canDiscard && (
        <div style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'rgba(95,125,79,0.7)',
          fontFamily: 'Nunito',
          fontWeight: 700,
          marginTop: -14,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          Tap a tile to discard
        </div>
      )}
    </div>
  );
}

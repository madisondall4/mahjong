import React, { useRef } from 'react';
import MahjongTile from './MahjongTile';

export default function PlayerHand({ tiles = [], selectedUids = new Set(), onTileClick, canDiscard = false, animateIn = false, flowers = [], exposures = [] }) {
  const scrollRef = useRef(null);

  return (
    <div className="relative">
      {/* Exposed melds — face-up, locked */}
      {exposures.length > 0 && (
        <div className="no-scrollbar" style={{
          display: 'flex', gap: 8, alignItems: 'center',
          padding: '6px 12px 0', overflowX: 'auto',
        }}>
          <span style={{
            fontSize: 9, fontFamily: 'Nunito', fontWeight: 800,
            color: 'rgba(var(--ink-rgb),0.4)', textTransform: 'uppercase', letterSpacing: '0.07em',
            flexShrink: 0,
          }}>
            Exposed
          </span>
          {exposures.map((meld, mi) => (
            <div key={mi} style={{
              display: 'flex', gap: 2, flexShrink: 0,
              padding: 3, borderRadius: 7,
              background: 'rgba(var(--sky-rgb),0.1)',
              border: '1px solid rgba(var(--sky-rgb),0.3)',
            }}>
              {meld.tiles.map(t => <MahjongTile key={t.uid} tile={t} size="sm"/>)}
            </div>
          ))}
        </div>
      )}

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
            background: 'rgba(var(--rose-rgb),0.25)',
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
          color: 'rgba(var(--matcha-rgb),0.7)',
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

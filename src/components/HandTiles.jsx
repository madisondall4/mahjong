import React from 'react';
import MahjongTile from './MahjongTile';
import { exampleTileGroups } from '../logic/handMatcher.js';

/**
 * Renders a hand definition's canonical example with real tile art,
 * grouped the way the pattern reads. Used by the card reference and advisor.
 */
export function HandExample({ hand, tileSize = 'sm' }) {
  const groups = exampleTileGroups(hand);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, rowGap: 6, alignItems: 'flex-end' }}>
      {hand.flowers > 0 && (
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          {Array.from({ length: hand.flowers }, (_, i) => (
            <MahjongTile key={`f${i}`} tile={{ suit: 'flower', value: i + 1, uid: `exf-${hand.id}-${i}` }} size={tileSize}/>
          ))}
        </div>
      )}
      {groups.map((group, gi) => (
        <div key={gi} style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          {group.map(t => <MahjongTile key={t.uid} tile={t} size={tileSize}/>)}
        </div>
      ))}
    </div>
  );
}

/**
 * A "missing tile" chip: the tile face with a ×n count and an amber ring
 * when a joker could fill the spot.
 */
export function MissingTileChip({ entry }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <div style={{
        borderRadius: 8,
        outline: entry.jokerOk ? '2px dashed rgba(217,138,61,0.55)' : 'none',
        outlineOffset: 1,
      }}>
        <MahjongTile tile={{ suit: entry.suit, value: entry.value, uid: `miss-${entry.id}` }} size="sm"/>
      </div>
      {entry.short > 1 && (
        <span style={{
          position: 'absolute', top: -6, right: -6,
          background: '#C95E83', color: 'white',
          borderRadius: 999, fontSize: 9, fontWeight: 800,
          fontFamily: 'Nunito, sans-serif',
          minWidth: 15, height: 15, lineHeight: '15px', textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        }}>
          ×{entry.short}
        </span>
      )}
    </div>
  );
}

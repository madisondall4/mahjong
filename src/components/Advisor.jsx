import React, { useMemo, useState } from 'react';
import { rankHands } from '../logic/handMatcher.js';
import { HandExample, MissingTileChip } from './HandTiles.jsx';

const SHOW_COUNT = 6;

/**
 * "What Can I Win?" — ranks the 24 hands by how close the player's current
 * tiles are, shows what's still missing. The core new-player teaching tool.
 *
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {Object[]} tiles - player's current hand (jokers included)
 * @param {number} flowerCount
 */
export default function Advisor({ isOpen, onClose, tiles = [], flowerCount = 0 }) {
  const [expanded, setExpanded] = useState(null);

  const ranked = useMemo(
    () => (isOpen ? rankHands(tiles, flowerCount).slice(0, SHOW_COUNT) : []),
    [isOpen, tiles, flowerCount]
  );
  const jokersHeld = tiles.filter(t => t.suit === 'joker').length;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50,
          opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'all' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />
      <div aria-hidden={!isOpen} style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, height: '78vh',
        background: '#FBF7EF',
        borderTop: '2px solid rgba(95,125,79,0.25)',
        borderRadius: '16px 16px 0 0', zIndex: 51,
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 40, height: 4, background: 'rgba(95,125,79,0.4)', borderRadius: 2 }}/>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 16px 10px', borderBottom: '1px solid rgba(95,125,79,0.15)',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontFamily: 'Playfair Display, serif', color: '#5F7D4F', fontWeight: 700 }}>
              What Can I Win?
            </h2>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(51,48,42,0.5)', fontFamily: 'Nunito' }}>
              Your closest hands, ranked
              {jokersHeld > 0 && ` · ${jokersHeld} joker${jokersHeld > 1 ? 's' : ''} can fill dashed spots`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#C95E83', fontSize: 22, cursor: 'pointer', padding: 4, lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ranked.map((r, i) => {
            const pct = Math.max(0, Math.min(1, (14 - r.distance) / 14));
            const isExpanded = expanded === r.hand.id;
            return (
              <button
                key={r.hand.id}
                onClick={() => setExpanded(isExpanded ? null : r.hand.id)}
                style={{
                  background: i === 0 ? 'rgba(95,125,79,0.08)' : 'rgba(251,247,239,0.7)',
                  border: `1px solid ${i === 0 ? 'rgba(95,125,79,0.4)' : 'rgba(95,125,79,0.18)'}`,
                  borderRadius: 10, padding: '10px 12px', textAlign: 'left', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 7,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 14, fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#33302A' }}>
                    {i === 0 && '⭐ '}{r.hand.name}
                  </span>
                  <span style={{ flexShrink: 0, fontSize: 12, fontFamily: 'Nunito', fontWeight: 800, color: r.distance <= 2 ? '#5F7D4F' : 'rgba(51,48,42,0.55)' }}>
                    {r.complete ? 'MAHJONG!' : `${r.distance} away`}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: 5, background: 'rgba(95,125,79,0.12)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct * 100}%`, height: '100%',
                    background: r.distance <= 2
                      ? 'linear-gradient(90deg, #5F7D4F, #8FBC6F)'
                      : 'linear-gradient(90deg, #9DB58E, #C9D8BE)',
                    borderRadius: 3, transition: 'width 0.3s ease',
                  }}/>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontFamily: 'Nunito', color: 'rgba(51,48,42,0.5)' }}>
                    {r.hand.pattern}
                  </span>
                  <span style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
                    {r.hand.closed && (
                      <span style={{ fontSize: 9, background: 'rgba(201,94,131,0.12)', color: '#C95E83', border: '1px solid rgba(201,94,131,0.35)', borderRadius: 3, padding: '1px 4px', fontFamily: 'Nunito', fontWeight: 700 }}>
                        CLOSED
                      </span>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#5F7D4F', fontFamily: 'Playfair Display, serif' }}>
                      {r.hand.points}pts
                    </span>
                  </span>
                </div>

                {/* Missing tiles */}
                {!r.complete && (r.missing.length > 0 || r.flowersShort > 0) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center', paddingTop: 2 }}>
                    <span style={{ fontSize: 10, fontFamily: 'Nunito', fontWeight: 700, color: 'rgba(51,48,42,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Need:
                    </span>
                    {r.missing.slice(0, 8).map((m, mi) => <MissingTileChip key={mi} entry={m}/>)}
                    {r.missing.length > 8 && (
                      <span style={{ fontSize: 11, fontFamily: 'Nunito', color: 'rgba(51,48,42,0.5)' }}>
                        +{r.missing.length - 8} more
                      </span>
                    )}
                    {r.flowersShort > 0 && (
                      <span style={{ fontSize: 11, fontFamily: 'Nunito', fontWeight: 700, color: '#C95E83' }}>
                        +{r.flowersShort} flower{r.flowersShort > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}

                {/* Expanded: full example */}
                {isExpanded && (
                  <div style={{
                    marginTop: 4, padding: '10px 10px 8px',
                    background: 'rgba(255,255,255,0.7)', borderRadius: 8,
                    border: '1px solid rgba(95,125,79,0.15)',
                  }}>
                    <div style={{ fontSize: 10, fontFamily: 'Nunito', fontWeight: 700, color: 'rgba(51,48,42,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                      Example
                    </div>
                    <HandExample hand={r.hand}/>
                    <div style={{ fontSize: 11, fontFamily: 'Nunito', color: 'rgba(51,48,42,0.6)', lineHeight: 1.5, marginTop: 8 }}>
                      {r.hand.description}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

import React, { useState } from 'react';
import WINNING_HANDS, { CATEGORIES } from '../data/card.js';
import MahjongTile from './MahjongTile';

const CATEGORY_COLORS = {
  [CATEGORIES.EVEN]: '#c9a84c',
  [CATEGORIES.CONSEC]: '#27ae60',
  [CATEGORIES.LIKE]: '#1a5276',
  [CATEGORIES.WINDS]: '#8e44ad',
  [CATEGORIES.SINGLES]: '#c0392b',
  [CATEGORIES.QUINTS]: '#e07b39',
};

function HandCard({ hand, onClick }) {
  const col = CATEGORY_COLORS[hand.category] || '#c9a84c';
  return (
    <button
      onClick={() => onClick(hand)}
      style={{
        background: 'rgba(13,31,23,0.8)',
        border: `1px solid ${col}33`,
        borderRadius: 8,
        padding: '8px 10px',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        touchAction: 'manipulation',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: col, fontFamily: 'Nunito', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {hand.category}
        </span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {hand.closed && (
            <span style={{ fontSize: 9, background: '#c0392b22', color: '#c0392b', border: '1px solid #c0392b44', borderRadius: 3, padding: '1px 4px', fontFamily: 'Nunito', fontWeight: 700 }}>
              CLOSED
            </span>
          )}
          <span style={{ fontSize: 13, fontWeight: 800, color: '#e8c96a', fontFamily: 'Playfair Display, serif' }}>
            {hand.points}pts
          </span>
        </div>
      </div>
      <div style={{ fontSize: 13, color: '#f7f2e8', fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
        {hand.pattern}
      </div>
    </button>
  );
}

/**
 * Slide-up panel showing all 24 winning hands
 * @param {boolean} isOpen
 * @param {function} onClose
 */
export default function CardReference({ isOpen, onClose }) {
  const [selectedHand, setSelectedHand] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Object.values(CATEGORIES)];
  const filtered = activeCategory === 'All'
    ? WINNING_HANDS
    : WINNING_HANDS.filter(h => h.category === activeCategory);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 50,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'all' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        height: '80vh',
        background: '#0d1f17',
        borderTop: '2px solid rgba(201,168,76,0.4)',
        borderRadius: '16px 16px 0 0',
        zIndex: 51,
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 40, height: 4, background: 'rgba(201,168,76,0.4)', borderRadius: 2 }}/>
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 16px 10px',
          borderBottom: '1px solid rgba(201,168,76,0.15)',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontFamily: 'Playfair Display, serif', color: '#e8c96a', fontWeight: 700 }}>
              Mahjong Card
            </h2>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(247,242,232,0.5)', fontFamily: 'Nunito' }}>
              24 winning hands
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#c9a84c', fontSize: 22, cursor: 'pointer', padding: 4, lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Category filter */}
        <div style={{
          overflowX: 'auto', display: 'flex', gap: 6, padding: '8px 16px',
          borderBottom: '1px solid rgba(201,168,76,0.1)',
        }} className="no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                flexShrink: 0,
                padding: '4px 10px',
                borderRadius: 20,
                border: '1px solid rgba(201,168,76,0.3)',
                background: activeCategory === cat ? 'rgba(201,168,76,0.25)' : 'transparent',
                color: activeCategory === cat ? '#e8c96a' : 'rgba(247,242,232,0.6)',
                fontSize: 11,
                fontFamily: 'Nunito',
                fontWeight: activeCategory === cat ? 700 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Hand list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {selectedHand ? (
            <HandDetail hand={selectedHand} onBack={() => setSelectedHand(null)} />
          ) : (
            filtered.map(hand => (
              <HandCard key={hand.id} hand={hand} onClick={setSelectedHand} />
            ))
          )}
        </div>
      </div>
    </>
  );
}

function HandDetail({ hand, onBack }) {
  const col = CATEGORY_COLORS[hand.category] || '#c9a84c';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#c9a84c', cursor: 'pointer', padding: 0, fontSize: 13, fontFamily: 'Nunito' }}
      >
        ← Back to all hands
      </button>

      <div style={{ background: 'rgba(13,31,23,0.8)', border: `1px solid ${col}44`, borderRadius: 10, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: col, fontFamily: 'Nunito', fontWeight: 700, textTransform: 'uppercase' }}>
            {hand.category}
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {hand.closed && (
              <span style={{ fontSize: 10, background: '#c0392b22', color: '#c0392b', border: '1px solid #c0392b55', borderRadius: 4, padding: '2px 6px', fontFamily: 'Nunito', fontWeight: 700 }}>
                CLOSED
              </span>
            )}
            <span style={{ fontSize: 20, fontWeight: 800, color: '#e8c96a', fontFamily: 'Playfair Display, serif' }}>
              {hand.points} pts
            </span>
          </div>
        </div>

        <div style={{ fontSize: 22, color: '#f7f2e8', fontFamily: 'Playfair Display, serif', fontWeight: 700, marginBottom: 10 }}>
          {hand.pattern}
        </div>

        <div style={{ fontSize: 12, color: 'rgba(247,242,232,0.7)', fontFamily: 'Nunito', lineHeight: 1.5 }}>
          {hand.description}
        </div>

        {/* Group breakdown */}
        <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {hand.groups.map((g, i) => (
            <span key={i} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 10,
              background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)',
              color: '#c9a84c', fontFamily: 'Nunito', fontWeight: 600,
            }}>
              {g.type === 'flowers' ? `${g.count} Flower(s)` :
               g.type === 'quint' ? 'Quint ×5' :
               g.type === 'kong' ? 'Kong ×4' :
               g.type === 'pung' ? 'Pung ×3' :
               g.type === 'pair' ? 'Pair ×2' :
               g.type === 'sequence' ? `Run [${g.values?.join(',')}]` :
               g.type === 'allWinds' ? 'NEWS set' :
               g.type === 'sevenPairs' ? '7 Pairs' :
               g.type === 'fourConsecPairs' ? '4 Consec Pairs' :
               g.type === 'fiveConsecPairs' ? '5 Consec Pairs' :
               g.type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

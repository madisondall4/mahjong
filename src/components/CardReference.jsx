import React, { useState } from 'react';
import WINNING_HANDS, { CATEGORIES, CARD_META } from '../data/card.js';
import { HandExample } from './HandTiles.jsx';

const CATEGORY_COLORS = {
  [CATEGORIES.EVEN]: '#5F7D4F',
  [CATEGORIES.CONSEC]: '#5F7D4F',
  [CATEGORIES.LIKE]: '#5E92B3',
  [CATEGORIES.WINDS]: '#C95E83',
  [CATEGORIES.SINGLES]: '#5F7D4F',
  [CATEGORIES.QUINTS]: '#5F7D4F',
};

function HandCard({ hand, onClick }) {
  const col = CATEGORY_COLORS[hand.category] || '#5F7D4F';
  return (
    <button
      onClick={() => onClick(hand)}
      style={{
        background: 'rgba(251,247,239,0.7)',
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
            <span style={{ fontSize: 9, background: 'rgba(201,94,131,0.12)', color: '#C95E83', border: '1px solid rgba(201,94,131,0.35)', borderRadius: 3, padding: '1px 4px', fontFamily: 'Nunito', fontWeight: 700 }}>
              CLOSED
            </span>
          )}
          <span style={{ fontSize: 13, fontWeight: 800, color: '#5F7D4F', fontFamily: 'Playfair Display, serif' }}>
            {hand.points}pts
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 14, color: '#33302A', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
          {hand.name}
        </span>
        <span style={{ fontSize: 11.5, color: 'rgba(51,48,42,0.55)', fontFamily: 'Nunito', fontWeight: 600 }}>
          {hand.pattern}
        </span>
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
      <div aria-hidden={!isOpen} style={{
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        height: '80vh',
        background: '#FBF7EF',
        borderTop: '2px solid rgba(95,125,79,0.25)',
        borderRadius: '16px 16px 0 0',
        zIndex: 51,
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}>
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 40, height: 4, background: 'rgba(95,125,79,0.4)', borderRadius: 2 }}/>
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 16px 10px',
          borderBottom: '1px solid rgba(95,125,79,0.15)',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontFamily: 'Playfair Display, serif', color: '#5F7D4F', fontWeight: 700 }}>
              {CARD_META.name}
            </h2>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(51,48,42,0.5)', fontFamily: 'Nunito' }}>
              {CARD_META.edition} · 24 winning hands · tap any hand to see it in tiles
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#C95E83', fontSize: 22, cursor: 'pointer', padding: 4, lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Category filter */}
        <div style={{
          overflowX: 'auto', display: 'flex', gap: 6, padding: '8px 16px',
          borderBottom: '1px solid rgba(95,125,79,0.1)',
        }} className="no-scrollbar">
          {categories.map(cat => {
            const catCol = CATEGORY_COLORS[cat] || '#5F7D4F';
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0,
                  padding: '4px 10px',
                  borderRadius: 20,
                  border: `1px solid ${activeCategory === cat ? catCol + '88' : 'rgba(95,125,79,0.2)'}`,
                  background: activeCategory === cat ? catCol + '22' : 'transparent',
                  color: activeCategory === cat ? catCol : 'rgba(51,48,42,0.55)',
                  fontSize: 11,
                  fontFamily: 'Nunito',
                  fontWeight: activeCategory === cat ? 700 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            );
          })}
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
  const col = CATEGORY_COLORS[hand.category] || '#5F7D4F';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#5E92B3', cursor: 'pointer', padding: 0, fontSize: 13, fontFamily: 'Nunito' }}
      >
        ← Back to all hands
      </button>

      <div style={{ background: 'rgba(251,247,239,0.8)', border: `1px solid ${col}33`, borderRadius: 10, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: col, fontFamily: 'Nunito', fontWeight: 700, textTransform: 'uppercase' }}>
            {hand.category}
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {hand.closed && (
              <span style={{ fontSize: 10, background: 'rgba(201,94,131,0.12)', color: '#C95E83', border: '1px solid rgba(201,94,131,0.35)', borderRadius: 4, padding: '2px 6px', fontFamily: 'Nunito', fontWeight: 700 }}>
                CLOSED
              </span>
            )}
            <span style={{ fontSize: 20, fontWeight: 800, color: '#5F7D4F', fontFamily: 'Playfair Display, serif' }}>
              {hand.points} pts
            </span>
          </div>
        </div>

        <div style={{ fontSize: 20, color: '#33302A', fontFamily: 'Playfair Display, serif', fontWeight: 700, marginBottom: 4 }}>
          {hand.name}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(51,48,42,0.55)', fontFamily: 'Nunito', fontWeight: 600, marginBottom: 12 }}>
          {hand.pattern}
        </div>

        {/* Example rendered with real tile art */}
        <div style={{
          background: 'rgba(255,255,255,0.75)', borderRadius: 10,
          border: '1px solid rgba(95,125,79,0.18)', padding: '12px 10px', marginBottom: 12,
        }}>
          <div style={{ fontSize: 10, fontFamily: 'Nunito', fontWeight: 700, color: 'rgba(51,48,42,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Example
          </div>
          <HandExample hand={hand}/>
          {hand.flowers > 0 && (
            <div style={{ fontSize: 10.5, fontFamily: 'Nunito', color: '#C95E83', fontWeight: 600, marginTop: 8 }}>
              ✿ Requires {hand.flowers} flowers set aside
            </div>
          )}
        </div>

        <div style={{ fontSize: 12, color: 'rgba(51,48,42,0.65)', fontFamily: 'Nunito', lineHeight: 1.5 }}>
          {hand.description}
        </div>
      </div>
    </div>
  );
}

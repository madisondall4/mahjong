import React, { useState } from 'react';
import { SUITS } from '../data/tiles.js';

const DEMO_TILES = [
  { suit: SUITS.BAM, value: 1, color: '#A4D65E' },
  { suit: SUITS.CRAK, value: 7, color: '#5E8C3E' },
  { suit: SUITS.DOT, value: 5, color: '#7FB3A4' },
  { suit: SUITS.WIND, value: 'East', color: '#2B3A2A' },
  { suit: SUITS.DRAGON, value: 'Red', color: '#5E8C3E' },
  { suit: SUITS.JOKER, value: 'joker', color: '#E2A03F' },
];

function FloatingTile({ tile, delay, x, y, size }) {
  const s = size || 44;
  const colors = {
    [SUITS.BAM]: '#A4D65E',
    [SUITS.CRAK]: '#5E8C3E',
    [SUITS.DOT]: '#7FB3A4',
    [SUITS.WIND]: '#2B3A2A',
    [SUITS.DRAGON]: '#5E8C3E',
    [SUITS.JOKER]: '#E2A03F',
    [SUITS.FLOWER]: '#E2A03F',
  };
  const labels = {
    [SUITS.BAM]: `${tile.value}B`,
    [SUITS.CRAK]: `${tile.value}C`,
    [SUITS.DOT]: `${tile.value}D`,
    [SUITS.WIND]: tile.value[0],
    [SUITS.DRAGON]: tile.value[0]+'D',
    [SUITS.JOKER]: '★',
    [SUITS.FLOWER]: `F${tile.value}`,
  };

  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      width: s,
      height: s * 1.3,
      background: 'linear-gradient(145deg, #ffffff 0%, #fbfdf6 60%, #f2f7ea 100%)',
      borderRadius: 5,
      boxShadow: '2px 2px 0 #dce8cc, 3px 3px 5px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: s * 0.28,
      fontWeight: 800,
      color: colors[tile.suit] || '#2B3A2A',
      fontFamily: 'Nunito, sans-serif',
      animation: `floatTile 4s ease-in-out ${delay}ms infinite alternate`,
      opacity: 0.35,
    }}>
      {labels[tile.suit]}
    </div>
  );
}

const BG_TILES = [
  { suit: SUITS.BAM, value: 3, x: 5, y: 10, delay: 0 },
  { suit: SUITS.CRAK, value: 7, x: 80, y: 5, delay: 500 },
  { suit: SUITS.DOT, value: 5, x: 15, y: 70, delay: 1000 },
  { suit: SUITS.WIND, value: 'East', x: 70, y: 65, delay: 200 },
  { suit: SUITS.DRAGON, value: 'Green', x: 88, y: 40, delay: 700 },
  { suit: SUITS.BAM, value: 6, x: 3, y: 40, delay: 300 },
  { suit: SUITS.CRAK, value: 2, x: 60, y: 80, delay: 900 },
  { suit: SUITS.DOT, value: 8, x: 40, y: 5, delay: 400 },
];

export default function HomeScreen({ onNewGame }) {
  const [showRules, setShowRules] = useState(false);

  return (
    <div style={{
      height: '100%',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: '#F4F1E4',
    }}>
      <style>{`
        @keyframes floatTile {
          0% { transform: translateY(0px) rotate(-8deg); }
          100% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pinkShimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Background floating tiles */}
      {BG_TILES.map((t, i) => (
        <FloatingTile key={i} tile={t} delay={t.delay} x={t.x} y={t.y}/>
      ))}

      {/* Decorative border frame */}
      <div style={{
        position: 'absolute', inset: 10,
        border: '6px solid transparent',
        borderRadius: 16,
        background: 'linear-gradient(#F4F1E4, #F4F1E4) padding-box, linear-gradient(135deg, #5E8C3E, #E2A03F, #5E8C3E) border-box',
        pointerEvents: 'none',
      }}/>

      {/* Main content */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
        padding: 32, zIndex: 1, animation: 'fadeInUp 0.6s ease-out',
      }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 4 }}>🀄</div>
          <h1 style={{
            margin: 0,
            fontFamily: 'Playfair Display, serif',
            fontSize: 32,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #5E8C3E, #E2A03F)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
          }}>
            American<br/>Mahjong
          </h1>
          <p style={{
            margin: '8px 0 0',
            fontFamily: 'Nunito, sans-serif',
            fontSize: 13,
            color: 'rgba(43,58,42,0.5)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Premium Mobile Experience
          </p>
        </div>

        {/* Decorative divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', maxWidth: 280 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(94,140,62,0.3))' }}/>
          <span style={{ color: '#5E8C3E', fontSize: 16 }}>✦</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(94,140,62,0.3))' }}/>
        </div>

        {/* Game info */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: '🎮', text: '1 vs 3 AI' },
            { icon: '🃏', text: '24 Hands' },
            { icon: '🎰', text: '160 Tiles' },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'rgba(43,58,42,0.06)', borderRadius: 10,
              padding: '8px 14px', border: '1px solid rgba(94,140,62,0.15)',
              minWidth: 70,
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 11, color: 'rgba(43,58,42,0.65)', fontFamily: 'Nunito', fontWeight: 600 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* New Game button */}
        <button
          onClick={onNewGame}
          style={{
            width: '100%', maxWidth: 280,
            padding: '16px 0',
            borderRadius: 14,
            border: 'none',
            background: 'linear-gradient(135deg, #5E8C3E 0%, #E2A03F 50%, #5E8C3E 100%)',
            backgroundSize: '200% auto',
            color: 'white',
            fontSize: 18,
            fontWeight: 800,
            fontFamily: 'Playfair Display, serif',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(94,140,62,0.4), 0 2px 0 #cc3a7e',
            letterSpacing: '0.04em',
            animation: 'pinkShimmer 2s linear infinite',
          }}
        >
          New Game
        </button>

        {/* Rules toggle */}
        <button
          onClick={() => setShowRules(v => !v)}
          style={{
            background: 'none', border: '1px solid rgba(94,140,62,0.25)',
            borderRadius: 8, padding: '8px 20px',
            color: 'rgba(43,58,42,0.55)', fontSize: 13,
            fontFamily: 'Nunito', cursor: 'pointer',
          }}
        >
          {showRules ? 'Hide Rules' : 'How to Play'}
        </button>

        {showRules && (
          <div style={{
            background: 'rgba(43,58,42,0.06)', border: '1px solid rgba(94,140,62,0.15)',
            borderRadius: 12, padding: 16, maxWidth: 320, fontSize: 12,
            color: 'rgba(43,58,42,0.75)', fontFamily: 'Nunito', lineHeight: 1.6,
          }}>
            <p style={{ margin: '0 0 8px', color: '#5E8C3E', fontWeight: 700, fontFamily: 'Playfair Display, serif', fontSize: 14 }}>American Mahjong Rules</p>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li>Tap a tile to select it, tap again to discard</li>
              <li>Charleston: pass 3 tiles in each direction</li>
              <li>Draw a tile each turn, then discard one</li>
              <li>Jokers substitute in pungs/kongs/quints, never pairs</li>
              <li>Match a hand on the card to declare Mahjong!</li>
              <li>Closed hands (🔒) must be self-drawn wins</li>
            </ul>
          </div>
        )}
      </div>

      {/* Version */}
      <div style={{
        position: 'absolute', bottom: 16,
        fontSize: 10, color: 'rgba(43,58,42,0.25)',
        fontFamily: 'Nunito',
      }}>
        American Mahjong v1.0
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { SUITS } from '../data/tiles.js';

const DEMO_TILES = [
  { suit: SUITS.BAM, value: 1, color: '#2d6a4f' },
  { suit: SUITS.CRAK, value: 7, color: '#c0392b' },
  { suit: SUITS.DOT, value: 5, color: '#1a5276' },
  { suit: SUITS.WIND, value: 'East', color: '#c9a84c' },
  { suit: SUITS.DRAGON, value: 'Red', color: '#c0392b' },
  { suit: SUITS.JOKER, value: 'joker', color: '#9b59b6' },
];

function FloatingTile({ tile, delay, x, y, size }) {
  const s = size || 44;
  const colors = {
    [SUITS.BAM]: '#2d6a4f',
    [SUITS.CRAK]: '#c0392b',
    [SUITS.DOT]: '#1a5276',
    [SUITS.WIND]: '#c9a84c',
    [SUITS.DRAGON]: '#c0392b',
    [SUITS.JOKER]: '#9b59b6',
    [SUITS.FLOWER]: '#e07b39',
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
      background: 'linear-gradient(145deg, #fdfaf3 0%, #f7f2e8 40%, #ede5d0 100%)',
      borderRadius: 5,
      boxShadow: '2px 2px 0 #c8b89a, 3px 3px 5px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: s * 0.28,
      fontWeight: 800,
      color: colors[tile.suit] || '#333',
      fontFamily: 'Nunito, sans-serif',
      animation: `floatTile 4s ease-in-out ${delay}ms infinite alternate`,
      opacity: 0.25,
      transform: `rotate(${(Math.random() - 0.5) * 20}deg)`,
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
    <div className="felt-texture" style={{
      height: '100%',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
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
      `}</style>

      {/* Background floating tiles */}
      {BG_TILES.map((t, i) => (
        <FloatingTile key={i} tile={t} delay={t.delay} x={t.x} y={t.y}/>
      ))}

      {/* Wood border frame */}
      <div style={{
        position: 'absolute', inset: 10,
        border: '6px solid transparent',
        borderRadius: 16,
        background: 'linear-gradient(#1a4731, #1a4731) padding-box, linear-gradient(135deg, #8B6914, #c9a84c, #8B6914) border-box',
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
            color: '#e8c96a',
            lineHeight: 1.1,
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}>
            American<br/>Mahjong
          </h1>
          <p style={{
            margin: '8px 0 0',
            fontFamily: 'Nunito, sans-serif',
            fontSize: 13,
            color: 'rgba(247,242,232,0.6)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Premium Mobile Experience
          </p>
        </div>

        {/* Decorative divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', maxWidth: 280 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.4))' }}/>
          <span style={{ color: '#c9a84c', fontSize: 16 }}>✦</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.4))' }}/>
        </div>

        {/* Game info */}
        <div style={{
          display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {[
            { icon: '🎮', text: '1 vs 3 AI' },
            { icon: '🃏', text: '24 Hands' },
            { icon: '🎰', text: '160 Tiles' },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'rgba(13,31,23,0.6)', borderRadius: 10,
              padding: '8px 14px', border: '1px solid rgba(201,168,76,0.15)',
              minWidth: 70,
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 11, color: 'rgba(247,242,232,0.7)', fontFamily: 'Nunito', fontWeight: 600 }}>{text}</span>
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
            background: 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #c9a84c 100%)',
            backgroundSize: '200% auto',
            color: '#0d1f17',
            fontSize: 18,
            fontWeight: 800,
            fontFamily: 'Playfair Display, serif',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(201,168,76,0.4), 0 2px 0 #8B6914',
            letterSpacing: '0.04em',
            animation: 'shimmer 2s linear infinite',
          }}
        >
          New Game
        </button>

        {/* Rules toggle */}
        <button
          onClick={() => setShowRules(v => !v)}
          style={{
            background: 'none', border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: 8, padding: '8px 20px',
            color: 'rgba(247,242,232,0.6)', fontSize: 13,
            fontFamily: 'Nunito', cursor: 'pointer',
          }}
        >
          {showRules ? 'Hide Rules' : 'How to Play'}
        </button>

        {showRules && (
          <div style={{
            background: 'rgba(13,31,23,0.9)', border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 12, padding: 16, maxWidth: 320, fontSize: 12,
            color: 'rgba(247,242,232,0.8)', fontFamily: 'Nunito', lineHeight: 1.6,
          }}>
            <p style={{ margin: '0 0 8px', color: '#e8c96a', fontWeight: 700, fontFamily: 'Playfair Display, serif', fontSize: 14 }}>American Mahjong Rules</p>
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
        fontSize: 10, color: 'rgba(247,242,232,0.25)',
        fontFamily: 'Nunito',
      }}>
        American Mahjong v1.0
      </div>
    </div>
  );
}

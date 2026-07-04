import React, { useState } from 'react';
import { SUITS } from '../data/tiles.js';
import { getDifficulty, setDifficulty, DIFFICULTIES } from '../utils/persistence.js';
import { getDailyChallenge, getStats } from '../utils/stats.js';
import { setCoachEnabled, isCoachEnabled } from '../utils/coach.js';
import { THEME_PRESETS, TILE_BACKS, applyTheme, getSavedTheme, getSavedTileBack, setTileBack } from '../theme/presets.js';
import { isSoundOn, setSoundOn } from '../utils/sound.js';

const DEMO_TILES = [
  { suit: SUITS.BAM, value: 1, color: 'var(--matcha)' },
  { suit: SUITS.CRAK, value: 7, color: 'var(--matcha)' },
  { suit: SUITS.DOT, value: 5, color: 'var(--sky)' },
  { suit: SUITS.WIND, value: 'East', color: 'var(--surface-deep)' },
  { suit: SUITS.DRAGON, value: 'Red', color: 'var(--matcha)' },
  { suit: SUITS.JOKER, value: 'joker', color: 'var(--rose)' },
];

function FloatingTile({ tile, delay, x, y, size }) {
  const s = size || 44;
  const colors = {
    [SUITS.BAM]: 'var(--matcha)',
    [SUITS.CRAK]: 'var(--matcha)',
    [SUITS.DOT]: 'var(--sky)',
    [SUITS.WIND]: 'var(--surface-deep)',
    [SUITS.DRAGON]: 'var(--matcha)',
    [SUITS.JOKER]: 'var(--rose)',
    [SUITS.FLOWER]: 'var(--rose)',
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
      color: colors[tile.suit] || 'var(--surface-deep)',
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

function formatTimeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const PHASE_LABELS = {
  charleston: 'Charleston',
  playing: 'In Play',
  declaration: 'Declaration',
  summary: 'Scoring',
};

const DIFF_OPTIONS = [
  { key: DIFFICULTIES.CHILL, label: 'Chill', desc: 'Relaxed AI, fewer calls' },
  { key: DIFFICULTIES.SPICY, label: 'Spicy', desc: 'Balanced challenge' },
  { key: DIFFICULTIES.RUTHLESS, label: 'Ruthless', desc: 'Tracks discards, no mercy' },
];

export default function HomeScreen({ onNewGame, onResumeGame, savedGameInfo, onOpenJournal }) {
  const [showRules, setShowRules] = useState(false);
  const [difficulty, setDiff] = useState(getDifficulty);
  const [mode, setMode] = useState('solo');
  const [theme, setTheme] = useState(getSavedTheme);
  const [tileBack, setTb] = useState(() => getSavedTileBack() || THEME_PRESETS[getSavedTheme()].tileBack);
  const [soundOn, setSound] = useState(isSoundOn);
  const [passNames, setPassNames] = useState(['', '', '', '']);
  const daily = getDailyChallenge();
  const stats = getStats();

  return (
    <div style={{
      height: '100%',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: 'var(--bg)',
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
        background: 'linear-gradient(var(--bg), var(--bg)) padding-box, linear-gradient(135deg, var(--matcha), var(--sage), var(--matcha)) border-box',
        pointerEvents: 'none',
      }}/>

      {/* Main content */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
        padding: 32, zIndex: 1, animation: 'fadeInUp 0.6s ease-out',
      }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'var(--matcha)', marginBottom: 10 }}>
            Pop &amp; Play
          </div>
          <h1 style={{
            margin: 0,
            fontFamily: 'Playfair Display, serif',
            fontSize: 46,
            fontWeight: 700,
            color: 'var(--matcha-deep)',
            lineHeight: 1.02,
          }}>
            American<br/>
            <span style={{ fontStyle: 'italic', fontWeight: 600, color: 'var(--rose)' }}>Mahjong</span>
          </h1>
          <p style={{
            margin: '12px 0 0',
            fontFamily: 'Nunito, sans-serif',
            fontSize: 12.5,
            color: 'rgba(var(--ink-rgb),0.5)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            A modern table for a timeless game
          </p>
        </div>

        {/* Decorative divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', maxWidth: 280 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(var(--matcha-rgb),0.3))' }}/>
          <span style={{ color: 'var(--matcha)', fontSize: 16 }}>✦</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(var(--matcha-rgb),0.3))' }}/>
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
              background: 'rgba(var(--deep-rgb),0.06)', borderRadius: 10,
              padding: '8px 14px', border: '1px solid rgba(var(--matcha-rgb),0.15)',
              minWidth: 70,
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 11, color: 'rgba(var(--deep-rgb),0.65)', fontFamily: 'Nunito', fontWeight: 600 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Mode selector */}
        <div style={{ width: '100%', maxWidth: 280 }}>
          <div style={{
            display: 'flex',
            background: 'rgba(var(--deep-rgb),0.06)',
            borderRadius: 999,
            border: '1px solid rgba(var(--matcha-rgb),0.15)',
            padding: 3,
          }}>
            {[
              { key: 'solo', label: '🤖 Solo vs AI' },
              { key: 'pass', label: '👥 Pass & Play' },
            ].map(opt => {
              const active = mode === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setMode(opt.key)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 999, border: 'none',
                    background: active ? 'var(--matcha-deep)' : 'transparent',
                    color: active ? 'white' : 'rgba(var(--deep-rgb),0.55)',
                    fontSize: 12, fontWeight: active ? 700 : 500,
                    fontFamily: 'Nunito, sans-serif', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {mode === 'pass' && (
            <>
              <div style={{ fontSize: 10, color: 'rgba(var(--deep-rgb),0.45)', fontFamily: 'Nunito', textAlign: 'center', marginTop: 4 }}>
                4 players share this device — hands stay private between turns
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
                {passNames.map((name, i) => (
                  <input
                    key={i}
                    value={name}
                    maxLength={12}
                    placeholder={`Player ${i + 1}`}
                    onChange={e => {
                      const next = [...passNames];
                      next[i] = e.target.value;
                      setPassNames(next);
                    }}
                    style={{
                      padding: '8px 10px', borderRadius: 8,
                      border: '1px solid rgba(var(--matcha-rgb),0.3)',
                      background: 'rgba(var(--paper-rgb),0.8)',
                      color: 'var(--ink)', fontSize: 12.5,
                      fontFamily: 'Nunito, sans-serif', fontWeight: 600,
                      outline: 'none', minWidth: 0,
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Difficulty selector */}
        <div style={{ width: '100%', maxWidth: 280, display: mode === 'pass' ? 'none' : 'block' }}>
          <div style={{
            fontSize: 10, color: 'rgba(var(--deep-rgb),0.5)', fontFamily: 'Nunito',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, textAlign: 'center',
          }}>
            AI Difficulty
          </div>
          <div style={{
            display: 'flex',
            background: 'rgba(var(--deep-rgb),0.06)',
            borderRadius: 999,
            border: '1px solid rgba(var(--matcha-rgb),0.15)',
            padding: 3,
          }}>
            {DIFF_OPTIONS.map(opt => {
              const active = difficulty === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => { setDiff(opt.key); setDifficulty(opt.key); }}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    borderRadius: 999,
                    border: 'none',
                    background: active ? 'var(--matcha)' : 'transparent',
                    color: active ? 'white' : 'rgba(var(--deep-rgb),0.55)',
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    fontFamily: 'Nunito, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div style={{
            fontSize: 10, color: 'rgba(var(--deep-rgb),0.4)', fontFamily: 'Nunito',
            textAlign: 'center', marginTop: 4,
          }}>
            {DIFF_OPTIONS.find(o => o.key === difficulty)?.desc}
          </div>
        </div>

        {/* Theme + tile back pickers */}
        <div style={{ width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {Object.entries(THEME_PRESETS).map(([key, preset]) => {
              const active = theme === key;
              return (
                <button
                  key={key}
                  onClick={() => { applyTheme(key); setTheme(key); setTb(getSavedTileBack() || preset.tileBack); }}
                  aria-label={preset.label}
                  title={preset.label}
                  style={{
                    width: 44, height: 44, borderRadius: 14, cursor: 'pointer',
                    border: active ? '2.5px solid var(--matcha)' : '1.5px solid rgba(var(--deep-rgb),0.2)',
                    background: `linear-gradient(135deg, ${preset.tokens.bg} 0%, ${preset.tokens.bg} 48%, ${preset.tokens.primary} 52%, ${preset.tokens.primary} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                    boxShadow: active ? '0 3px 10px rgba(var(--shadow-rgb),0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {preset.emoji}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 9.5, fontFamily: 'Nunito', fontWeight: 800, color: 'rgba(var(--deep-rgb),0.45)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Tile back
            </span>
            {Object.entries(TILE_BACKS).map(([key, tb]) => {
              const active = tileBack === key;
              return (
                <button
                  key={key}
                  onClick={() => { setTileBack(key); setTb(key); }}
                  aria-label={`${tb.label} tile back`}
                  title={tb.label}
                  style={{
                    width: 24, height: 32, borderRadius: 5, cursor: 'pointer',
                    border: active ? '2px solid var(--matcha)' : '1px solid rgba(var(--deep-rgb),0.2)',
                    background: `linear-gradient(150deg, ${tb.a} 0%, ${tb.b} 55%, ${tb.c} 100%)`,
                    boxShadow: active ? '0 2px 8px rgba(var(--shadow-rgb),0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Daily challenge strip */}
        <button
          onClick={onOpenJournal}
          style={{
            width: '100%', maxWidth: 280,
            display: 'flex', alignItems: 'center', gap: 8,
            background: daily.status ? 'rgba(var(--matcha-rgb),0.1)' : 'rgba(var(--rose-rgb),0.07)',
            border: `1px solid ${daily.status ? 'rgba(var(--matcha-rgb),0.35)' : 'rgba(var(--rose-rgb),0.28)'}`,
            borderRadius: 12, padding: '9px 12px', cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 17, flexShrink: 0 }}>{daily.status === 'gold' ? '⭐' : daily.status ? '✅' : '☀️'}</span>
          <span style={{ minWidth: 0, flex: 1 }}>
            <span style={{ display: 'block', fontSize: 10, fontFamily: 'Nunito', fontWeight: 800, color: daily.status ? 'var(--matcha)' : 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Daily Challenge{daily.streak > 0 ? ` · 🔥 ${daily.streak}` : ''}
            </span>
            <span style={{ display: 'block', fontSize: 11.5, fontFamily: 'Nunito', fontWeight: 600, color: 'rgba(var(--deep-rgb),0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {daily.status ? 'Done for today!' : 'Win a game'} · Featured: {daily.hand.name}
            </span>
          </span>
          <span style={{ color: 'rgba(var(--deep-rgb),0.35)', fontSize: 14, flexShrink: 0 }}>›</span>
        </button>

        {/* Resume Game button */}
        {onResumeGame && savedGameInfo && (
          <button
            onClick={onResumeGame}
            style={{
              width: '100%', maxWidth: 280,
              padding: '16px 0',
              borderRadius: 999,
              border: 'none',
              background: 'var(--matcha)',
              color: 'white',
              fontSize: 17,
              fontWeight: 700,
              fontFamily: 'Playfair Display, serif',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(var(--shadow-rgb),0.28)',
              letterSpacing: '0.03em',
              position: 'relative',
            }}
          >
            Resume Game
            <span style={{
              display: 'block',
              fontSize: 10,
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 600,
              opacity: 0.75,
              marginTop: 2,
              letterSpacing: '0.06em',
            }}>
              Round {savedGameInfo.roundNumber} · {PHASE_LABELS[savedGameInfo.phase] || savedGameInfo.phase} · {formatTimeAgo(savedGameInfo.timestamp)}
            </span>
          </button>
        )}

        {/* New Game button */}
        <button
          onClick={() => onNewGame(mode, passNames.map((n, i) => n.trim() || `Player ${i + 1}`))}
          style={{
            width: '100%', maxWidth: 280,
            padding: onResumeGame ? '12px 0' : '16px 0',
            borderRadius: 999,
            border: onResumeGame ? '1.5px solid rgba(var(--matcha-rgb),0.35)' : 'none',
            background: onResumeGame ? 'transparent' : 'var(--matcha)',
            color: onResumeGame ? 'var(--matcha)' : 'white',
            fontSize: onResumeGame ? 15 : 17,
            fontWeight: 700,
            fontFamily: 'Playfair Display, serif',
            cursor: 'pointer',
            boxShadow: onResumeGame ? 'none' : '0 8px 20px rgba(var(--shadow-rgb),0.28)',
            letterSpacing: '0.03em',
          }}
        >
          New Game
        </button>

        {/* Secondary actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowRules(v => !v)}
            style={{
              background: 'none', border: '1px solid rgba(var(--matcha-rgb),0.25)',
              borderRadius: 8, padding: '8px 16px',
              color: 'rgba(var(--deep-rgb),0.55)', fontSize: 13,
              fontFamily: 'Nunito', cursor: 'pointer',
            }}
          >
            {showRules ? 'Hide Rules' : 'How to Play'}
          </button>
          <button
            onClick={onOpenJournal}
            style={{
              background: 'none', border: '1px solid rgba(var(--matcha-rgb),0.25)',
              borderRadius: 8, padding: '8px 16px',
              color: 'rgba(var(--deep-rgb),0.55)', fontSize: 13,
              fontFamily: 'Nunito', cursor: 'pointer',
            }}
          >
            📖 Journal{stats.gamesPlayed > 0 ? ` · ${stats.wins}W` : ''}
          </button>
        </div>

        {showRules && (
          <div style={{
            background: 'rgba(var(--deep-rgb),0.06)', border: '1px solid rgba(var(--matcha-rgb),0.15)',
            borderRadius: 12, padding: 16, maxWidth: 320, fontSize: 12,
            color: 'rgba(var(--deep-rgb),0.75)', fontFamily: 'Nunito', lineHeight: 1.6,
          }}>
            <p style={{ margin: '0 0 8px', color: 'var(--matcha)', fontWeight: 700, fontFamily: 'Playfair Display, serif', fontSize: 14 }}>American Mahjong Rules</p>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li>Tap a tile to select it, tap again to discard</li>
              <li>Charleston: pass 3 tiles in each direction</li>
              <li>Draw a tile each turn, then discard one</li>
              <li>Jokers substitute in pungs/kongs/quints, never pairs</li>
              <li>Match a hand on the card to declare Mahjong!</li>
              <li>Closed hands (🔒) must be self-drawn wins</li>
            </ul>
            <button
              onClick={() => { setCoachEnabled(true); setShowRules(false); }}
              style={{
                marginTop: 10, width: '100%',
                background: isCoachEnabled() ? 'rgba(var(--matcha-rgb),0.12)' : 'var(--matcha)',
                border: '1px solid rgba(var(--matcha-rgb),0.35)',
                borderRadius: 8, padding: '8px 0',
                color: isCoachEnabled() ? 'var(--matcha)' : 'white',
                fontSize: 12, fontFamily: 'Nunito', fontWeight: 800, cursor: 'pointer',
              }}
            >
              {isCoachEnabled() ? '🌱 Coach tips are on for your next game' : '🌱 Replay coach tips in my next game'}
            </button>
          </div>
        )}
      </div>

      {/* Sound toggle */}
      <button
        onClick={() => { setSoundOn(!soundOn); setSound(!soundOn); }}
        aria-label={soundOn ? 'Mute sounds' : 'Unmute sounds'}
        style={{
          position: 'absolute', top: 24, right: 24, zIndex: 2,
          width: 38, height: 38, borderRadius: 999,
          background: 'rgba(var(--deep-rgb),0.06)',
          border: '1px solid rgba(var(--matcha-rgb),0.25)',
          fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {soundOn ? '🔊' : '🔇'}
      </button>

      {/* Version */}
      <div style={{
        position: 'absolute', bottom: 16,
        fontSize: 10, color: 'rgba(var(--deep-rgb),0.25)',
        fontFamily: 'Nunito',
      }}>
        American Mahjong v1.0
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { SUITS } from '../data/tiles.js';
import { getDifficulty, setDifficulty, DIFFICULTIES } from '../utils/persistence.js';
import { getDailyChallenge, getStats } from '../utils/stats.js';
import { setCoachEnabled, isCoachEnabled } from '../utils/coach.js';
import { THEME_PRESETS, TILE_BACKS, applyTheme, getSavedTheme, getSavedTileBack, setTileBack } from '../theme/presets.js';
import { isSoundOn, setSoundOn } from '../utils/sound.js';
import { getActiveCardKey, setActiveCardKey } from '../data/card.js';
import { hasCustomCard, getCompiledCustomCard } from '../logic/customCard.js';

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
    [SUITS.DRAGON]: tile.value[0] + 'D',
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
      opacity: 0.3,
      pointerEvents: 'none',
      zIndex: 1,
    }}>
      {labels[tile.suit]}
    </div>
  );
}

const BG_TILES = [
  { suit: SUITS.BAM, value: 3, x: 6, y: 8, delay: 0 },
  { suit: SUITS.CRAK, value: 7, x: 80, y: 6, delay: 500 },
  { suit: SUITS.DOT, value: 5, x: 12, y: 78, delay: 1000 },
  { suit: SUITS.DRAGON, value: 'Green', x: 82, y: 74, delay: 700 },
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

const pillTrackStyle = {
  display: 'flex',
  background: 'rgba(var(--deep-rgb),0.06)',
  borderRadius: 999,
  border: '1px solid rgba(var(--matcha-rgb),0.15)',
  padding: 3,
};

const sectionLabelStyle = {
  fontSize: 10,
  color: 'rgba(var(--deep-rgb),0.5)',
  fontFamily: 'Nunito',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  textAlign: 'center',
};

export default function HomeScreen({ onNewGame, onResumeGame, savedGameInfo, onOpenJournal, onOpenBuilder }) {
  const [showRules, setShowRules] = useState(false);
  const [showStyle, setShowStyle] = useState(false);
  const [difficulty, setDiff] = useState(getDifficulty);
  const [mode, setMode] = useState('solo');
  const [theme, setTheme] = useState(getSavedTheme);
  const [tileBack, setTb] = useState(() => getSavedTileBack() || THEME_PRESETS[getSavedTheme()].tileBack);
  const [soundOn, setSound] = useState(isSoundOn);
  const [passNames, setPassNames] = useState(['', '', '', '']);
  const [cardKey, setCardKey] = useState(getActiveCardKey);
  const daily = getDailyChallenge();
  const stats = getStats();

  return (
    <div style={{
      height: '100%',
      position: 'relative',
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
        zIndex: 0,
      }}/>

      {/* Sound toggle — pinned inside the frame, clear of the title */}
      <button
        onClick={() => { setSoundOn(!soundOn); setSound(!soundOn); }}
        aria-label={soundOn ? 'Mute sounds' : 'Unmute sounds'}
        style={{
          position: 'absolute', top: 26, right: 26, zIndex: 3,
          width: 38, height: 38, borderRadius: 999,
          background: 'rgba(var(--paper-rgb),0.85)',
          border: '1px solid rgba(var(--matcha-rgb),0.3)',
          fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {soundOn ? '🔊' : '🔇'}
      </button>

      {/* Scrollable content — centers when short, scrolls when tall */}
      <div className="no-scrollbar" style={{
        position: 'absolute', inset: 16,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 2,
      }}>
        <div style={{
          margin: 'auto',
          width: '100%',
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          padding: '36px 16px calc(24px + env(safe-area-inset-bottom, 0px))',
          animation: 'fadeInUp 0.6s ease-out',
        }}>
          {/* Hero */}
          <div style={{ textAlign: 'center' }}>
            <div className="eyebrow" style={{ color: 'var(--matcha)', marginBottom: 8 }}>
              Pop &amp; Play
            </div>
            <h1 style={{
              margin: 0,
              fontFamily: 'Playfair Display, serif',
              fontSize: 40,
              fontWeight: 700,
              color: 'var(--matcha-deep)',
              lineHeight: 1.05,
            }}>
              American<br/>
              <span style={{ fontStyle: 'italic', fontWeight: 600, color: 'var(--rose)' }}>Mahjong</span>
            </h1>
            <p style={{
              margin: '10px 0 0',
              fontFamily: 'Nunito, sans-serif',
              fontSize: 11.5,
              color: 'rgba(var(--ink-rgb),0.5)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              A modern table for a timeless game
            </p>
          </div>

          {/* Decorative divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', maxWidth: 260 }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(var(--matcha-rgb),0.3))' }}/>
            <span style={{ color: 'var(--matcha)', fontSize: 14 }}>✦</span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(var(--matcha-rgb),0.3))' }}/>
          </div>

          {/* Mode selector */}
          <div style={{ width: '100%' }}>
            <div style={pillTrackStyle}>
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
                      flex: 1, padding: '9px 0', borderRadius: 999, border: 'none',
                      background: active ? 'var(--matcha)' : 'transparent',
                      color: active ? 'white' : 'rgba(var(--deep-rgb),0.55)',
                      fontSize: 12.5, fontWeight: active ? 700 : 500,
                      fontFamily: 'Nunito, sans-serif', cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Solo: difficulty */}
            {mode === 'solo' && (
              <div style={{ marginTop: 10 }}>
                <div style={pillTrackStyle}>
                  {DIFF_OPTIONS.map(opt => {
                    const active = difficulty === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => { setDiff(opt.key); setDifficulty(opt.key); }}
                        style={{
                          flex: 1, padding: '8px 0', borderRadius: 999, border: 'none',
                          background: active ? 'var(--matcha)' : 'transparent',
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
                <div style={{ fontSize: 10.5, color: 'rgba(var(--deep-rgb),0.45)', fontFamily: 'Nunito', textAlign: 'center', marginTop: 5 }}>
                  {DIFF_OPTIONS.find(o => o.key === difficulty)?.desc}
                </div>
              </div>
            )}

            {/* Pass & Play: seat names */}
            {mode === 'pass' && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
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
                        padding: '9px 10px', borderRadius: 8,
                        border: '1px solid rgba(var(--matcha-rgb),0.3)',
                        background: 'rgba(var(--paper-rgb),0.8)',
                        color: 'var(--ink)', fontSize: 13,
                        fontFamily: 'Nunito, sans-serif', fontWeight: 600,
                        outline: 'none', minWidth: 0,
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 10.5, color: 'rgba(var(--deep-rgb),0.45)', fontFamily: 'Nunito', textAlign: 'center', marginTop: 5 }}>
                  4 players, one device — hands stay private between turns
                </div>
              </div>
            )}
          </div>

          {/* Resume Game */}
          {onResumeGame && savedGameInfo && (
            <button
              onClick={onResumeGame}
              style={{
                width: '100%',
                padding: '15px 0',
                borderRadius: 999,
                border: 'none',
                background: 'var(--matcha)',
                color: 'white',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: 'Playfair Display, serif',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(var(--shadow-rgb),0.28)',
                letterSpacing: '0.03em',
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

          {/* New Game */}
          <button
            onClick={() => onNewGame(mode, passNames.map((n, i) => n.trim() || `Player ${i + 1}`))}
            style={{
              width: '100%',
              padding: savedGameInfo && onResumeGame ? '12px 0' : '16px 0',
              borderRadius: 999,
              border: savedGameInfo && onResumeGame ? '1.5px solid rgba(var(--matcha-rgb),0.4)' : 'none',
              background: savedGameInfo && onResumeGame ? 'transparent' : 'var(--matcha)',
              color: savedGameInfo && onResumeGame ? 'var(--matcha)' : 'white',
              fontSize: savedGameInfo && onResumeGame ? 15 : 17,
              fontWeight: 700,
              fontFamily: 'Playfair Display, serif',
              cursor: 'pointer',
              boxShadow: savedGameInfo && onResumeGame ? 'none' : '0 8px 20px rgba(var(--shadow-rgb),0.28)',
              letterSpacing: '0.03em',
            }}
          >
            New Game
          </button>

          {/* Daily challenge */}
          <button
            onClick={onOpenJournal}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 8,
              background: daily.status ? 'rgba(var(--matcha-rgb),0.1)' : 'rgba(var(--rose-rgb),0.07)',
              border: `1px solid ${daily.status ? 'rgba(var(--matcha-rgb),0.35)' : 'rgba(var(--rose-rgb),0.28)'}`,
              borderRadius: 12, padding: '10px 12px', cursor: 'pointer', textAlign: 'left',
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

          {/* Secondary actions */}
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button
              onClick={() => { setShowRules(v => !v); setShowStyle(false); }}
              style={{
                flex: 1,
                background: showRules ? 'rgba(var(--matcha-rgb),0.1)' : 'none',
                border: '1px solid rgba(var(--matcha-rgb),0.25)',
                borderRadius: 10, padding: '10px 0',
                color: 'rgba(var(--deep-rgb),0.6)', fontSize: 12.5,
                fontFamily: 'Nunito', fontWeight: 700, cursor: 'pointer',
              }}
            >
              How to Play
            </button>
            <button
              onClick={onOpenJournal}
              style={{
                flex: 1,
                background: 'none', border: '1px solid rgba(var(--matcha-rgb),0.25)',
                borderRadius: 10, padding: '10px 0',
                color: 'rgba(var(--deep-rgb),0.6)', fontSize: 12.5,
                fontFamily: 'Nunito', fontWeight: 700, cursor: 'pointer',
              }}
            >
              📖 Journal{stats.gamesPlayed > 0 ? ` · ${stats.wins}W` : ''}
            </button>
            <button
              onClick={() => { setShowStyle(v => !v); setShowRules(false); }}
              style={{
                flex: 1,
                background: showStyle ? 'rgba(var(--matcha-rgb),0.1)' : 'none',
                border: '1px solid rgba(var(--matcha-rgb),0.25)',
                borderRadius: 10, padding: '10px 0',
                color: 'rgba(var(--deep-rgb),0.6)', fontSize: 12.5,
                fontFamily: 'Nunito', fontWeight: 700, cursor: 'pointer',
              }}
            >
              🎨 Style
            </button>
          </div>

          {/* Rules panel */}
          {showRules && (
            <div style={{
              width: '100%',
              background: 'rgba(var(--deep-rgb),0.06)', border: '1px solid rgba(var(--matcha-rgb),0.15)',
              borderRadius: 12, padding: 16, fontSize: 12,
              color: 'rgba(var(--deep-rgb),0.75)', fontFamily: 'Nunito', lineHeight: 1.6,
            }}>
              <p style={{ margin: '0 0 8px', color: 'var(--matcha)', fontWeight: 700, fontFamily: 'Playfair Display, serif', fontSize: 14 }}>American Mahjong Rules</p>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>Drag tiles to arrange your rack; drag one up (or double-tap) to discard</li>
                <li>Charleston: pass 3 tiles in each direction</li>
                <li>Call discards for pungs, kongs, and quints — melds go face-up</li>
                <li>Jokers fill groups of 3+, never pairs; swap real tiles for exposed jokers</li>
                <li>Match a hand on the card to declare Mahjong!</li>
                <li>Closed hands must be self-drawn, no exposures</li>
              </ul>
              <button
                onClick={() => { setCoachEnabled(true); setShowRules(false); }}
                style={{
                  marginTop: 10, width: '100%',
                  background: isCoachEnabled() ? 'rgba(var(--matcha-rgb),0.12)' : 'var(--matcha)',
                  border: '1px solid rgba(var(--matcha-rgb),0.35)',
                  borderRadius: 8, padding: '9px 0',
                  color: isCoachEnabled() ? 'var(--matcha)' : 'white',
                  fontSize: 12, fontFamily: 'Nunito', fontWeight: 800, cursor: 'pointer',
                }}
              >
                {isCoachEnabled() ? '🌱 Coach tips are on for your next game' : '🌱 Replay coach tips in my next game'}
              </button>
            </div>
          )}

          {/* Style panel: theme, tile back, card */}
          {showStyle && (
            <div style={{
              width: '100%',
              background: 'rgba(var(--deep-rgb),0.06)', border: '1px solid rgba(var(--matcha-rgb),0.15)',
              borderRadius: 12, padding: 14,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div>
                <div style={{ ...sectionLabelStyle, marginBottom: 8 }}>Theme</div>
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
                          width: 46, height: 46, borderRadius: 14, cursor: 'pointer',
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
              </div>

              <div>
                <div style={{ ...sectionLabelStyle, marginBottom: 8 }}>Tile Back</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                  {Object.entries(TILE_BACKS).map(([key, tb]) => {
                    const active = tileBack === key;
                    return (
                      <button
                        key={key}
                        onClick={() => { setTileBack(key); setTb(key); }}
                        aria-label={`${tb.label} tile back`}
                        title={tb.label}
                        style={{
                          width: 30, height: 40, borderRadius: 6, cursor: 'pointer',
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

              <div>
                <div style={{ ...sectionLabelStyle, marginBottom: 8 }}>Card</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ ...pillTrackStyle, flex: 1 }}>
                    <button
                      onClick={() => { setActiveCardKey('garden'); setCardKey('garden'); }}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 999, border: 'none',
                        background: cardKey === 'garden' ? 'var(--matcha)' : 'transparent',
                        color: cardKey === 'garden' ? 'white' : 'rgba(var(--deep-rgb),0.55)',
                        fontSize: 11.5, fontWeight: cardKey === 'garden' ? 700 : 500,
                        fontFamily: 'Nunito, sans-serif', cursor: 'pointer', transition: 'all 0.2s ease',
                      }}
                    >
                      🌿 Garden Card
                    </button>
                    <button
                      onClick={() => {
                        if (hasCustomCard()) { setActiveCardKey('custom'); setCardKey('custom'); }
                        else onOpenBuilder();
                      }}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 999, border: 'none',
                        background: cardKey === 'custom' ? 'var(--matcha)' : 'transparent',
                        color: cardKey === 'custom' ? 'white' : 'rgba(var(--deep-rgb),0.55)',
                        fontSize: 11.5, fontWeight: cardKey === 'custom' ? 700 : 500,
                        fontFamily: 'Nunito, sans-serif', cursor: 'pointer', transition: 'all 0.2s ease',
                      }}
                    >
                      ✏️ {hasCustomCard() ? (getCompiledCustomCard()?.meta.name || 'My Card') : 'My Card'}
                    </button>
                  </div>
                  {hasCustomCard() && (
                    <button
                      onClick={onOpenBuilder}
                      aria-label="Edit my card"
                      style={{
                        width: 36, height: 36, borderRadius: 999, flexShrink: 0,
                        background: 'rgba(var(--deep-rgb),0.06)', border: '1px solid rgba(var(--matcha-rgb),0.25)',
                        fontSize: 13, cursor: 'pointer',
                      }}
                    >
                      ✏️
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Version */}
          <div style={{
            fontSize: 10, color: 'rgba(var(--deep-rgb),0.3)',
            fontFamily: 'Nunito', marginTop: 4,
          }}>
            American Mahjong v1.1
          </div>
        </div>
      </div>
    </div>
  );
}

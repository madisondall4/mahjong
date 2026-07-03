import React, { useState } from 'react';
import { getStats, getJournal, getDailyChallenge } from '../utils/stats.js';
import { CARD_META, CATEGORIES } from '../data/card.js';
import { HandExample } from '../components/HandTiles.jsx';

const CATEGORY_COLORS = {
  [CATEGORIES.EVEN]: '#5F7D4F',
  [CATEGORIES.CONSEC]: '#D98A3D',
  [CATEGORIES.LIKE]: '#5E92B3',
  [CATEGORIES.WINDS]: '#C95E83',
  [CATEGORIES.SINGLES]: '#8E5BA6',
  [CATEGORIES.QUINTS]: '#B14A68',
};

function StatTile({ label, value, sub }) {
  return (
    <div style={{
      flex: 1, minWidth: 88,
      background: 'rgba(251,247,239,0.85)', border: '1px solid rgba(95,125,79,0.18)',
      borderRadius: 12, padding: '10px 8px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 21, fontWeight: 800, fontFamily: 'Playfair Display, serif', color: '#3C5236', lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 9.5, fontFamily: 'Nunito', fontWeight: 800, color: 'rgba(51,48,42,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 3 }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 10, fontFamily: 'Nunito', color: 'rgba(51,48,42,0.55)', marginTop: 1 }}>{sub}</div>
      )}
    </div>
  );
}

/**
 * Hand Journal + lifetime stats + daily challenge. Full-screen from Home.
 */
export default function JournalScreen({ onClose }) {
  const [expanded, setExpanded] = useState(null);
  const stats = getStats();
  const journal = getJournal();
  const daily = getDailyChallenge();

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
  const avgPoints = stats.wins > 0 ? Math.round(stats.totalWinPoints / stats.wins) : 0;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#F4EEE2', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px 12px',
        background: 'rgba(251,247,239,0.9)', borderBottom: '1px solid rgba(95,125,79,0.18)',
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontFamily: 'Playfair Display, serif', color: '#3C5236', fontWeight: 700 }}>
            Hand Journal
          </h1>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(51,48,42,0.5)', fontFamily: 'Nunito' }}>
            {CARD_META.name} · {CARD_META.edition}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(95,125,79,0.1)', border: '1px solid rgba(95,125,79,0.3)',
            borderRadius: 999, padding: '7px 16px',
            color: '#5F7D4F', fontSize: 13, fontFamily: 'Nunito', fontWeight: 800, cursor: 'pointer',
          }}
        >
          Done
        </button>
      </div>

      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 30px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Daily challenge */}
        <div style={{
          background: daily.status ? 'rgba(95,125,79,0.1)' : 'rgba(201,94,131,0.07)',
          border: `1.5px solid ${daily.status ? 'rgba(95,125,79,0.4)' : 'rgba(201,94,131,0.3)'}`,
          borderRadius: 14, padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontFamily: 'Nunito', fontWeight: 800, color: daily.status ? '#5F7D4F' : '#C95E83', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ☀️ Today&apos;s Challenge
            </span>
            {daily.streak > 0 && (
              <span style={{ fontSize: 12, fontFamily: 'Nunito', fontWeight: 800, color: '#D98A3D' }}>
                🔥 {daily.streak}-day streak
              </span>
            )}
          </div>
          <div style={{ fontSize: 14, fontFamily: 'Nunito', color: '#33302A', lineHeight: 1.45 }}>
            {daily.status === 'gold' ? (
              <><strong>Gold!</strong> You won with the featured hand — <strong>{daily.hand.name}</strong> ⭐</>
            ) : daily.status === 'win' ? (
              <>Challenge complete — you won today! Bonus: win with <strong>{daily.hand.name}</strong> for gold ⭐</>
            ) : (
              <>Win a game today to keep your streak. Featured hand: <strong>{daily.hand.name}</strong> ({daily.hand.points} pts) — win with it for gold ⭐</>
            )}
          </div>
        </div>

        {/* Lifetime stats */}
        <div>
          <div className="eyebrow" style={{ color: 'rgba(51,48,42,0.45)', marginBottom: 8 }}>Lifetime</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <StatTile label="Games" value={stats.gamesPlayed}/>
            <StatTile label="Win Rate" value={`${winRate}%`} sub={`${stats.wins}W · ${stats.losses}L · ${stats.draws}D`}/>
            <StatTile label="Streak" value={stats.currentStreak} sub={`best ${stats.bestStreak}`}/>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <StatTile label="Avg Win" value={avgPoints ? `${avgPoints}pts` : '—'}/>
            <StatTile
              label="Best Hand"
              value={stats.bestHand ? `${stats.bestHand.points}pts` : '—'}
              sub={stats.bestHand ? stats.bestHand.name : 'win a game!'}
            />
          </div>
        </div>

        {/* Collection */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div className="eyebrow" style={{ color: 'rgba(51,48,42,0.45)' }}>Collection</div>
            <div style={{ fontSize: 12, fontFamily: 'Nunito', fontWeight: 800, color: '#5F7D4F' }}>
              {journal.uniqueWon}/{journal.total} hands won
            </div>
          </div>
          <div style={{ height: 6, background: 'rgba(95,125,79,0.12)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{
              width: `${(journal.uniqueWon / journal.total) * 100}%`, height: '100%',
              background: 'linear-gradient(90deg, #5F7D4F, #C95E83)', borderRadius: 3,
            }}/>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {journal.entries.map(({ hand, count }) => {
              const col = CATEGORY_COLORS[hand.category] || '#5F7D4F';
              const won = count > 0;
              const isExpanded = expanded === hand.id;
              return (
                <button
                  key={hand.id}
                  onClick={() => setExpanded(isExpanded ? null : hand.id)}
                  style={{
                    background: won ? 'rgba(251,247,239,0.9)' : 'rgba(51,48,42,0.035)',
                    border: `1px solid ${won ? col + '55' : 'rgba(51,48,42,0.1)'}`,
                    borderRadius: 10, padding: '9px 12px', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{ fontSize: 15, flexShrink: 0 }}>{won ? '🏆' : '🔒'}</span>
                      <span style={{
                        fontSize: 13.5, fontFamily: 'Playfair Display, serif', fontWeight: 700,
                        color: won ? '#33302A' : 'rgba(51,48,42,0.45)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {hand.name}
                      </span>
                      <span style={{ fontSize: 10, fontFamily: 'Nunito', fontWeight: 700, color: col, flexShrink: 0 }}>
                        {hand.points}pts
                      </span>
                    </span>
                    <span style={{ fontSize: 11, fontFamily: 'Nunito', fontWeight: 700, color: won ? '#5F7D4F' : 'rgba(51,48,42,0.35)', flexShrink: 0 }}>
                      {won ? `×${count}` : hand.category}
                    </span>
                  </div>
                  {isExpanded && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed rgba(51,48,42,0.12)' }}>
                      <HandExample hand={hand}/>
                      <div style={{ fontSize: 11, fontFamily: 'Nunito', color: 'rgba(51,48,42,0.6)', lineHeight: 1.5, marginTop: 8 }}>
                        {hand.description}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

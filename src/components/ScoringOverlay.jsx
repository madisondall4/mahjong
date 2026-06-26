import React from 'react';

/**
 * Scoring overlay after a win
 * @param {Object} winResult - { winnerIdx, winnerName, hand, payments, scores, isWallExhausted }
 * @param {string[]} playerNames
 * @param {function} onPlayAgain
 * @param {boolean} visible
 */
export default function ScoringOverlay({ winResult, playerNames, onPlayAgain, visible }) {
  if (!visible || !winResult) return null;

  const { winnerIdx, winnerName, hand, payments, scores, isSelfDraw, throwerId, isWallExhausted } = winResult;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#FBF7EF',
        border: '2px solid rgba(95,125,79,0.25)',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: '0 8px 40px rgba(60,82,54,0.18)',
      }}>
        {isWallExhausted ? (
          <>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36 }}>🀄</div>
              <h2 style={{ margin: '8px 0 4px', fontFamily: 'Playfair Display, serif', color: '#5F7D4F', fontSize: 22 }}>
                Draw — Wall Exhausted
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(51,48,42,0.55)', fontFamily: 'Nunito' }}>
                No tiles remain. No points exchanged.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Winner */}
            <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(95,125,79,0.15)', paddingBottom: 14 }}>
              <div style={{ fontSize: 32 }}>🏆</div>
              <h2 style={{ margin: '6px 0 2px', fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#5F7D4F' }}>
                {winnerIdx === 0 ? 'You Win!' : `${winnerName} Wins!`}
              </h2>
              {hand && (
                <div style={{ fontSize: 15, color: '#33302A', fontFamily: 'Playfair Display, serif', marginTop: 2 }}>
                  {hand.name} — <span style={{ color: '#5F7D4F', fontWeight: 700 }}>{hand.points} pts</span>
                </div>
              )}
              <div style={{ fontSize: 12, color: 'rgba(51,48,42,0.5)', fontFamily: 'Nunito', marginTop: 4 }}>
                {isSelfDraw ? 'Self-drawn win' : `Called discard from ${throwerId !== null ? (playerNames[throwerId] || 'unknown') : '?'}`}
              </div>
            </div>

            {/* Payments */}
            {payments && payments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 11, color: 'rgba(51,48,42,0.45)', fontFamily: 'Nunito', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                  Payments
                </div>
                {payments.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 10px',
                    background: 'rgba(95,125,79,0.06)',
                    borderRadius: 6,
                    border: '1px solid rgba(95,125,79,0.12)',
                  }}>
                    <span style={{ fontSize: 13, fontFamily: 'Nunito', color: 'rgba(51,48,42,0.85)' }}>
                      {playerNames[p.from]} → {playerNames[p.to]}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#5F7D4F', fontFamily: 'Playfair Display, serif' }}>
                      {p.amount} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Score totals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 11, color: 'rgba(51,48,42,0.45)', fontFamily: 'Nunito', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
            Scores
          </div>
          {scores.map((s, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 0',
            }}>
              <span style={{ fontSize: 13, fontFamily: 'Nunito', color: i === winnerIdx && !isWallExhausted ? '#5F7D4F' : 'rgba(51,48,42,0.85)', fontWeight: i === winnerIdx && !isWallExhausted ? 700 : 400 }}>
                {playerNames[i]} {i === 0 ? '(You)' : ''}
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: s >= 0 ? '#5F7D4F' : '#C95E83', fontFamily: 'Playfair Display, serif' }}>
                {s >= 0 ? '+' : ''}{s}
              </span>
            </div>
          ))}
        </div>

        {/* Play Again */}
        <button
          onClick={onPlayAgain}
          style={{
            padding: '14px 0',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #5F7D4F, #C95E83)',
            color: 'white',
            fontSize: 16,
            fontWeight: 800,
            fontFamily: 'Playfair Display, serif',
            cursor: 'pointer',
            letterSpacing: '0.04em',
            marginTop: 4,
            boxShadow: '0 4px 16px rgba(95,125,79,0.35)',
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

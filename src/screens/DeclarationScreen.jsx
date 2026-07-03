import React, { useEffect, useMemo, useState } from 'react';
import MahjongTile from '../components/MahjongTile.jsx';

/**
 * Mahjong declaration screen - appears when someone wins
 */
export default function DeclarationScreen({ gameState, onContinue }) {
  const [burst, setBurst] = useState(false);
  // Decorative confetti positions: random once per mount, stable thereafter.
  /* eslint-disable react-hooks/purity -- intentional one-shot randomness for celebration sparkles */
  const sparkles = useMemo(() =>
    Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 1 + Math.random() * 2,
      delay: Math.random() * 1000,
    })), []);
  /* eslint-enable react-hooks/purity */

  const { winner, winningHand } = gameState;
  const winnerPlayer = winner !== null && winner !== undefined ? gameState.players[winner] : null;
  const isPass = gameState.mode === 'pass';
  // In pass-and-play every winner is a human at this device.
  const isHumanWin = isPass ? winnerPlayer !== null : winner === 0;

  useEffect(() => {
    setBurst(true);
    const t = setTimeout(() => setBurst(false), 1500);
    return () => clearTimeout(t);
  }, []);

  // Wall exhausted with no winner — a draw. Don't strand the player on a
  // blank screen; explain and continue to scoring.
  if (!winnerPlayer) {
    return (
      <div className="felt-texture" style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24,
      }}>
        <div style={{ fontSize: 56 }}>🀄</div>
        <h1 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--matcha-deep)', textAlign: 'center' }}>
          Wall Exhausted
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(var(--ink-rgb),0.6)', fontFamily: 'Nunito', textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
          No tiles remain and no one declared Mahjong. The round ends in a draw — no points change hands.
        </p>
        <button
          onClick={onContinue}
          style={{
            width: '100%', maxWidth: 300, padding: '14px 0', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, var(--matcha), var(--rose))', color: 'white',
            fontSize: 16, fontWeight: 800, fontFamily: 'Playfair Display, serif',
            cursor: 'pointer', letterSpacing: '0.04em', boxShadow: '0 4px 16px rgba(var(--matcha-rgb),0.35)',
          }}
        >
          See Scores
        </button>
      </div>
    );
  }

  return (
    <div className="felt-texture" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Burst effect */}
      {burst && (
        <div style={{
          position: 'absolute', inset: 0,
          background: isHumanWin
            ? 'radial-gradient(ellipse at center, rgba(var(--matcha-rgb),0.35) 0%, transparent 65%)'
            : 'radial-gradient(ellipse at center, rgba(var(--sky-rgb),0.15) 0%, transparent 65%)',
          animation: 'burstFade 1.5s ease-out forwards',
          pointerEvents: 'none',
          zIndex: 0,
        }}/>
      )}

      {/* Sparkles */}
      {isHumanWin && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {sparkles.map((s, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: s.left,
              top: s.top,
              width: 6, height: 6,
              background: i % 2 === 0 ? 'var(--matcha)' : 'var(--rose)',
              borderRadius: '50%',
              animation: `floatSparkle ${s.duration}s ease-out ${s.delay}ms forwards`,
              opacity: 0,
            }}/>
          ))}
        </div>
      )}

      <style>{`
        @keyframes floatSparkle {
          0% { opacity: 0; transform: scale(0) translateY(0); }
          20% { opacity: 1; transform: scale(1.5) translateY(-10px); }
          100% { opacity: 0; transform: scale(0.5) translateY(-60px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 20, padding: 24, maxWidth: 360, width: '100%',
        animation: 'slideUp 0.5s ease-out',
      }}>
        {/* Trophy / icon */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, lineHeight: 1 }}>{isHumanWin ? '🏆' : '🀄'}</div>
          <h1 style={{
            margin: '10px 0 4px',
            fontFamily: 'Playfair Display, serif',
            fontSize: isHumanWin ? 34 : 26,
            fontWeight: 700,
            color: isHumanWin ? 'var(--matcha)' : 'var(--matcha-deep)',
            textShadow: isHumanWin ? '0 0 30px rgba(var(--matcha-rgb),0.5)' : 'none',
            lineHeight: 1.1,
          }}>
            {isPass && winnerPlayer ? `${winnerPlayer.name} — Mahjong!` : isHumanWin ? 'Mahjong!' : `${winnerPlayer.name}\nDeclares Mahjong`}
          </h1>
          {winningHand && (
            <div style={{
              fontSize: 16, color: 'var(--matcha)', fontFamily: 'Playfair Display, serif',
              marginTop: 4,
            }}>
              {winningHand.name ? `${winningHand.name} · ` : ''}{winningHand.pattern}
            </div>
          )}
        </div>

        {/* Winning hand tiles */}
        {isHumanWin && winnerPlayer.hand.length > 0 && (
          <div style={{
            background: 'rgba(var(--paper-rgb),0.8)',
            border: '1px solid rgba(var(--matcha-rgb),0.2)',
            borderRadius: 12,
            padding: '12px 14px',
            width: '100%',
          }}>
            <div style={{ fontSize: 11, color: 'var(--matcha)', fontFamily: 'Nunito', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Winning Hand
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              {winnerPlayer.flowers.map(f => (
                <MahjongTile key={f.uid} tile={f} size="md" winning/>
              ))}
              {winnerPlayer.hand.map(t => (
                <MahjongTile key={t.uid} tile={t} size="md" winning/>
              ))}
            </div>
            {winningHand && (
              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--matcha)', fontFamily: 'Playfair Display, serif' }}>
                  {winningHand.points} points
                </span>
                {winningHand.closed && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'rgba(var(--ink-rgb),0.55)', fontFamily: 'Nunito', fontWeight: 700 }}>
                    (CLOSED)
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Continue button */}
        <button
          onClick={onContinue}
          style={{
            width: '100%',
            padding: '14px 0',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, var(--matcha), var(--rose))',
            color: 'white',
            fontSize: 16,
            fontWeight: 800,
            fontFamily: 'Playfair Display, serif',
            cursor: 'pointer',
            letterSpacing: '0.04em',
            boxShadow: '0 4px 16px rgba(var(--matcha-rgb),0.35)',
          }}
        >
          See Scores
        </button>
      </div>
    </div>
  );
}

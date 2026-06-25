import React, { useEffect, useState } from 'react';
import MahjongTile from '../components/MahjongTile.jsx';

/**
 * Mahjong declaration screen - appears when someone wins
 */
export default function DeclarationScreen({ gameState, onContinue }) {
  const [burst, setBurst] = useState(false);

  const { winner, winningHand } = gameState;
  const winnerPlayer = winner !== null ? gameState.players[winner] : null;
  const isHumanWin = winner === 0;

  useEffect(() => {
    setBurst(true);
    const t = setTimeout(() => setBurst(false), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!winnerPlayer) return null;

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
            ? 'radial-gradient(ellipse at center, rgba(94,140,62,0.35) 0%, transparent 65%)'
            : 'radial-gradient(ellipse at center, rgba(127,179,164,0.15) 0%, transparent 65%)',
          animation: 'burstFade 1.5s ease-out forwards',
          pointerEvents: 'none',
          zIndex: 0,
        }}/>
      )}

      {/* Sparkles */}
      {isHumanWin && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 6, height: 6,
              background: i % 2 === 0 ? '#5E8C3E' : '#E2A03F',
              borderRadius: '50%',
              animation: `floatSparkle ${1 + Math.random() * 2}s ease-out ${Math.random() * 1000}ms forwards`,
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
            color: isHumanWin ? '#5E8C3E' : 'rgba(255,255,255,0.92)',
            textShadow: isHumanWin ? '0 0 30px rgba(94,140,62,0.5)' : 'none',
            lineHeight: 1.1,
          }}>
            {isHumanWin ? 'Mahjong!' : `${winnerPlayer.name}\nDeclares Mahjong`}
          </h1>
          {winningHand && (
            <div style={{
              fontSize: 16, color: '#5E8C3E', fontFamily: 'Playfair Display, serif',
              marginTop: 4,
            }}>
              {winningHand.pattern}
            </div>
          )}
        </div>

        {/* Winning hand tiles */}
        {isHumanWin && winnerPlayer.hand.length > 0 && (
          <div style={{
            background: 'rgba(43,58,42,0.7)',
            border: '1px solid rgba(94,140,62,0.25)',
            borderRadius: 12,
            padding: '12px 14px',
            width: '100%',
          }}>
            <div style={{ fontSize: 11, color: '#5E8C3E', fontFamily: 'Nunito', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
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
                <span style={{ fontSize: 22, fontWeight: 800, color: '#5E8C3E', fontFamily: 'Playfair Display, serif' }}>
                  {winningHand.points} points
                </span>
                {winningHand.closed && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'Nunito', fontWeight: 700 }}>
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
            background: 'linear-gradient(135deg, #5E8C3E, #E2A03F)',
            color: 'white',
            fontSize: 16,
            fontWeight: 800,
            fontFamily: 'Playfair Display, serif',
            cursor: 'pointer',
            letterSpacing: '0.04em',
            boxShadow: '0 4px 16px rgba(94,140,62,0.35)',
          }}
        >
          See Scores
        </button>
      </div>
    </div>
  );
}

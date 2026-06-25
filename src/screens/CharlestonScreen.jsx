import React, { useState, useEffect } from 'react';
import CharlestonUI from '../components/CharlestonUI.jsx';
import CardReference from '../components/CardReference.jsx';

/**
 * Charleston phase screen
 */
export default function CharlestonScreen({
  gameState,
  onPass,
  onSkipSecondCharleston,
}) {
  const [cardOpen, setCardOpen] = useState(false);
  const [showIncoming, setShowIncoming] = useState(false);
  const [incomingTiles, setIncomingTiles] = useState(null);

  const player = gameState.players[0];
  const { charleston } = gameState;

  useEffect(() => {
    if (gameState.lastIncomingTiles && gameState.lastIncomingTiles.length > 0) {
      setIncomingTiles(gameState.lastIncomingTiles);
      setShowIncoming(true);
      const t = setTimeout(() => setShowIncoming(false), 2000);
      return () => clearTimeout(t);
    }
  }, [gameState.lastIncomingTiles]);

  return (
    <div className="felt-texture" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 16px',
        background: 'rgba(43,58,42,0.85)',
        borderBottom: '1px solid rgba(94,140,62,0.2)',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 13, fontFamily: 'Playfair Display, serif', color: '#5E8C3E', fontWeight: 700 }}>
            Charleston
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'Nunito' }}>
            Step {charleston.step + 1}/3 · Round {charleston.round}/2
          </div>
        </div>
        <button
          onClick={() => setCardOpen(true)}
          style={{
            background: 'rgba(127,179,164,0.15)', border: '1px solid rgba(127,179,164,0.35)',
            borderRadius: 8, padding: '6px 12px',
            color: '#7FB3A4', fontSize: 11, fontFamily: 'Nunito', fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          📋 Card
        </button>
      </div>

      {/* Skip second charleston option */}
      {charleston.round === 2 && charleston.step === 0 && (
        <div style={{
          padding: '8px 16px',
          background: 'rgba(226,160,63,0.07)',
          borderBottom: '1px solid rgba(226,160,63,0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'Nunito' }}>
            Optional 2nd Charleston
          </span>
          <button
            onClick={onSkipSecondCharleston}
            style={{
              background: 'rgba(226,160,63,0.2)', border: '1px solid rgba(226,160,63,0.4)',
              borderRadius: 6, padding: '4px 10px',
              color: '#E2A03F', fontSize: 11, fontFamily: 'Nunito', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Skip
          </button>
        </div>
      )}

      {/* Incoming tiles notification */}
      {showIncoming && incomingTiles && (
        <div style={{
          position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10,
          background: 'rgba(43,58,42,0.97)',
          border: '1px solid rgba(164,214,94,0.5)',
          borderRadius: 10,
          padding: '8px 16px',
          animation: 'fadeInUp 0.3s ease-out',
          textAlign: 'center',
          fontSize: 12,
          color: '#A4D65E',
          fontFamily: 'Nunito',
          fontWeight: 700,
        }}>
          Tiles received!
        </div>
      )}

      {/* Main Charleston UI */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <CharlestonUI
          hand={player.hand}
          flowers={player.flowers}
          charlestonRound={charleston.round}
          charlestonStep={charleston.step}
          onPass={onPass}
          waitingForAI={gameState.waitingForAI}
          incomingTiles={showIncoming ? incomingTiles : null}
        />
      </div>

      <CardReference isOpen={cardOpen} onClose={() => setCardOpen(false)}/>
    </div>
  );
}

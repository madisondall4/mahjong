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

  // When incomingTiles changes (after a pass completes), show them briefly
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
        background: 'rgba(13,31,23,0.7)',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 13, fontFamily: 'Playfair Display, serif', color: '#e8c96a', fontWeight: 700 }}>
            Charleston
          </div>
          <div style={{ fontSize: 10, color: 'rgba(247,242,232,0.5)', fontFamily: 'Nunito' }}>
            Step {charleston.step + 1}/3 · Round {charleston.round}/2
          </div>
        </div>
        <button
          onClick={() => setCardOpen(true)}
          style={{
            background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: 8, padding: '6px 12px',
            color: '#c9a84c', fontSize: 11, fontFamily: 'Nunito', fontWeight: 700,
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
          background: 'rgba(201,168,76,0.07)',
          borderBottom: '1px solid rgba(201,168,76,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, color: 'rgba(247,242,232,0.7)', fontFamily: 'Nunito' }}>
            Optional 2nd Charleston
          </span>
          <button
            onClick={onSkipSecondCharleston}
            style={{
              background: 'rgba(192,57,43,0.2)', border: '1px solid rgba(192,57,43,0.4)',
              borderRadius: 6, padding: '4px 10px',
              color: '#c0392b', fontSize: 11, fontFamily: 'Nunito', fontWeight: 700,
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
          background: 'rgba(13,31,23,0.95)',
          border: '1px solid rgba(201,168,76,0.4)',
          borderRadius: 10,
          padding: '8px 16px',
          animation: 'fadeInUp 0.3s ease-out',
          textAlign: 'center',
          fontSize: 12,
          color: '#c9a84c',
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

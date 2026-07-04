import React, { useState, useEffect } from 'react';
import CharlestonUI from '../components/CharlestonUI.jsx';
import CardReference from '../components/CardReference.jsx';
import Advisor from '../components/Advisor.jsx';
import CoachTips from '../components/CoachTips.jsx';

/**
 * Charleston phase screen
 */
export default function CharlestonScreen({
  gameState,
  onPass,
  onSkipSecondCharleston,
  viewerIdx = 0,
  viewerLabel = null,
}) {
  const [cardOpen, setCardOpen] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [toast, setToast] = useState(null); // transient "tiles received" banner

  const player = gameState.players[viewerIdx];
  const { charleston } = gameState;
  const viewerIncoming = viewerIdx === 0
    ? gameState.lastIncomingTiles
    : gameState.incomingByPlayer?.[viewerIdx];

  useEffect(() => {
    if (viewerIncoming && viewerIncoming.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- transient toast keyed to the incoming-tiles prop
      setToast(viewerIncoming);
      const t = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [viewerIncoming]);

  const showIncoming = !!toast;
  const incomingTiles = toast;

  return (
    <div className="felt-texture" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 16px',
        background: 'rgba(var(--paper-rgb),0.85)',
        borderBottom: '1px solid rgba(var(--matcha-rgb),0.2)',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 13, fontFamily: 'Playfair Display, serif', color: 'var(--matcha)', fontWeight: 700 }}>
            {viewerLabel ? `Charleston — ${viewerLabel}` : 'Charleston'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(var(--ink-rgb),0.5)', fontFamily: 'Nunito' }}>
            Step {charleston.step + 1}/3 · Round {charleston.round}/2
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setAdvisorOpen(true)}
            style={{
              background: 'rgba(var(--matcha-rgb),0.12)', border: '1px solid rgba(var(--matcha-rgb),0.35)',
              borderRadius: 8, padding: '6px 12px',
              color: 'var(--matcha)', fontSize: 11, fontFamily: 'Nunito', fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            💡 Hands
          </button>
          <button
            onClick={() => setCardOpen(true)}
            style={{
              background: 'rgba(var(--sky-rgb),0.15)', border: '1px solid rgba(var(--sky-rgb),0.35)',
              borderRadius: 8, padding: '6px 12px',
              color: 'var(--sky)', fontSize: 11, fontFamily: 'Nunito', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📋 Card
          </button>
        </div>
      </div>

      {/* Skip second charleston option */}
      {onSkipSecondCharleston && charleston.round === 2 && charleston.step === 0 && (
        <div style={{
          padding: '8px 16px',
          background: 'rgba(var(--rose-rgb),0.08)',
          borderBottom: '1px solid rgba(var(--rose-rgb),0.18)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, color: 'rgba(var(--ink-rgb),0.65)', fontFamily: 'Nunito' }}>
            Optional 2nd Charleston
          </span>
          <button
            onClick={onSkipSecondCharleston}
            style={{
              background: 'rgba(var(--rose-rgb),0.18)', border: '1px solid rgba(var(--rose-rgb),0.4)',
              borderRadius: 6, padding: '4px 10px',
              color: 'var(--rose)', fontSize: 11, fontFamily: 'Nunito', fontWeight: 700,
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
          background: 'var(--matcha)',
          border: '1px solid rgba(var(--matcha-rgb),0.5)',
          borderRadius: 999,
          padding: '8px 18px',
          animation: 'fadeInUp 0.3s ease-out',
          textAlign: 'center',
          fontSize: 12,
          color: 'white',
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
          charlestonRound={charleston.round}
          charlestonStep={charleston.step}
          onPass={onPass}
          waitingForAI={gameState.waitingForAI}
          incomingTiles={showIncoming ? incomingTiles : null}
        />
      </div>

      <CoachTips gameState={gameState}/>
      <CardReference isOpen={cardOpen} onClose={() => setCardOpen(false)}/>
      <Advisor
        isOpen={advisorOpen}
        onClose={() => setAdvisorOpen(false)}
        tiles={player.hand}
      />
    </div>
  );
}

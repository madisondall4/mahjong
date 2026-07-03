import React, { useState, useEffect } from 'react';
import PlayerHand from '../components/PlayerHand.jsx';
import OpponentSeat from '../components/OpponentSeat.jsx';
import DiscardPool from '../components/DiscardPool.jsx';
import WallCounter from '../components/WallCounter.jsx';
import CardReference from '../components/CardReference.jsx';
import Advisor from '../components/Advisor.jsx';
import CoachTips from '../components/CoachTips.jsx';
import MahjongTile from '../components/MahjongTile.jsx';

/**
 * Main game table screen
 */
export default function GameTable({
  gameState,
  onDiscard,
  onCallMahjong,
  onDeclareMahjong,
  viewerIdx = 0,
}) {
  const [cardOpen, setCardOpen] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [selectedUid, setSelectedUid] = useState(null);
  const [showMahjongBtn, setShowMahjongBtn] = useState(false);

  const humanPlayer = gameState.players[viewerIdx];
  const seatRight = gameState.players[(viewerIdx + 1) % 4];
  const seatTop = gameState.players[(viewerIdx + 2) % 4];
  const seatLeft = gameState.players[(viewerIdx + 3) % 4];
  const currentPlayer = gameState.currentPlayer;
  const isHumanTurn = currentPlayer === viewerIdx;
  const wallRemaining = gameState.wall.length - gameState.wallIndex;
  const canCall = gameState.canHumanCallMahjong || false;
  const thinkingPlayer = gameState.thinkingPlayer;

  useEffect(() => {
    if (isHumanTurn && gameState.humanCanDeclare) {
      setShowMahjongBtn(true);
    } else {
      setShowMahjongBtn(false);
    }
  }, [isHumanTurn, gameState.humanCanDeclare]);

  function handleTileClick(tile) {
    if (!isHumanTurn) return;
    if (selectedUid === tile.uid) {
      onDiscard(tile.uid);
      setSelectedUid(null);
    } else {
      setSelectedUid(tile.uid);
    }
  }

  return (
    <div className="felt-texture" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Pink-to-orange border */}
      <div style={{
        position: 'absolute', inset: 0,
        border: '6px solid transparent',
        borderRadius: 0,
        background: 'linear-gradient(var(--table), var(--table)) padding-box, linear-gradient(135deg, var(--matcha) 0%, var(--sage) 50%, var(--matcha) 100%) border-box',
        pointerEvents: 'none',
        zIndex: 1,
      }}/>

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 16px 6px',
        zIndex: 2, flexShrink: 0,
        background: 'rgba(var(--paper-rgb),0.78)',
        borderBottom: '1px solid rgba(var(--matcha-rgb),0.14)',
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <WallCounter remaining={wallRemaining} total={160}/>
          <div style={{
            fontSize: 11, color: isHumanTurn ? 'var(--matcha)' : 'rgba(var(--ink-rgb),0.5)',
            fontFamily: 'Nunito', fontWeight: 700,
            padding: '4px 8px', background: isHumanTurn ? 'rgba(var(--matcha-rgb),0.12)' : 'transparent',
            borderRadius: 6, border: isHumanTurn ? '1px solid rgba(var(--matcha-rgb),0.35)' : '1px solid transparent',
            transition: 'all 0.3s',
          }}>
            {isHumanTurn ? '► Your Turn' : `${gameState.players[currentPlayer]?.name}'s Turn`}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {showMahjongBtn && (
            <button
              onClick={() => onDeclareMahjong?.()}
              style={{
                background: 'linear-gradient(135deg, var(--matcha), var(--rose))',
                border: 'none', borderRadius: 8,
                padding: '6px 12px',
                color: 'white', fontSize: 12, fontWeight: 800,
                fontFamily: 'Playfair Display, serif', cursor: 'pointer',
                animation: 'pulseGlow 1s ease-in-out infinite',
                boxShadow: '0 0 12px rgba(var(--matcha-rgb),0.5)',
              }}
            >
              Mahjong!
            </button>
          )}
          <button
            onClick={() => setAdvisorOpen(true)}
            aria-label="What can I win?"
            style={{
              background: 'rgba(var(--matcha-rgb),0.12)', border: '1px solid rgba(var(--matcha-rgb),0.35)',
              borderRadius: 8, padding: '6px 10px',
              color: 'var(--matcha)', fontSize: 11, fontFamily: 'Nunito', fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            💡 Hands
          </button>
          <button
            onClick={() => setCardOpen(true)}
            aria-label="Card reference"
            style={{
              background: 'rgba(var(--sky-rgb),0.12)', border: '1px solid rgba(var(--sky-rgb),0.3)',
              borderRadius: 8, padding: '6px 10px',
              color: 'var(--sky)', fontSize: 11, fontFamily: 'Nunito', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📋
          </button>
        </div>
      </div>

      {/* Opponent seats — top */}
      <div style={{
        display: 'flex', justifyContent: 'center', padding: '4px 12px 2px',
        zIndex: 2, flexShrink: 0,
      }}>
        <OpponentSeat
          player={seatTop}
          position="top"
          isThinking={thinkingPlayer === seatTop.id}
          isCurrentTurn={currentPlayer === seatTop.id}
        />
      </div>

      {/* Middle row: left seat + discard pool + right seat */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'stretch',
        padding: '2px 6px', gap: 4, minHeight: 0, zIndex: 2,
      }}>
        {/* Left seat */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <OpponentSeat
            player={seatLeft}
            position="left"
            isThinking={thinkingPlayer === seatLeft.id}
            isCurrentTurn={currentPlayer === seatLeft.id}
          />
        </div>

        {/* Center: discard pool */}
        <div style={{
          flex: 1,
          background: 'rgba(255,255,255,0.42)',
          borderRadius: 14,
          border: '1px solid rgba(var(--matcha-rgb),0.14)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}>
          <DiscardPool
            discards={gameState.discardPile}
            lastDiscard={gameState.lastDiscard}
            onCallMahjong={onCallMahjong}
            canCall={canCall}
          />
        </div>

        {/* Right seat */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <OpponentSeat
            player={seatRight}
            position="right"
            isThinking={thinkingPlayer === seatRight.id}
            isCurrentTurn={currentPlayer === seatRight.id}
          />
        </div>
      </div>

      {/* Last drawn tile indicator */}
      {isHumanTurn && gameState.lastDrawnTile && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
          padding: '2px 0', zIndex: 2, flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, color: 'rgba(var(--ink-rgb),0.5)', fontFamily: 'Nunito' }}>Drew:</span>
          <MahjongTile tile={gameState.lastDrawnTile} size="sm" animateIn/>
        </div>
      )}

      {/* Human player hand */}
      <div style={{
        background: 'rgba(var(--paper-rgb),0.85)',
        borderTop: '1px solid rgba(var(--matcha-rgb),0.25)',
        zIndex: 2, flexShrink: 0,
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      }}>
        <PlayerHand
          tiles={humanPlayer.hand}
          flowers={humanPlayer.flowers}
          selectedUids={selectedUid !== null ? new Set([selectedUid]) : new Set()}
          onTileClick={handleTileClick}
          canDiscard={isHumanTurn && humanPlayer.hand.length > 13}
        />
        {selectedUid !== null && (
          <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(var(--ink-rgb),0.5)', fontFamily: 'Nunito', paddingBottom: 4 }}>
            Tap again to discard · tap another to swap
          </div>
        )}
      </div>

      <CoachTips gameState={gameState}/>
      <CardReference isOpen={cardOpen} onClose={() => setCardOpen(false)}/>
      <Advisor
        isOpen={advisorOpen}
        onClose={() => setAdvisorOpen(false)}
        tiles={humanPlayer.hand}
        flowerCount={humanPlayer.flowers.length}
      />
    </div>
  );
}

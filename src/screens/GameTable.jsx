import React, { useState, useEffect } from 'react';
import PlayerHand from '../components/PlayerHand.jsx';
import OpponentSeat from '../components/OpponentSeat.jsx';
import DiscardPool from '../components/DiscardPool.jsx';
import WallCounter from '../components/WallCounter.jsx';
import CardReference from '../components/CardReference.jsx';
import MahjongTile from '../components/MahjongTile.jsx';

/**
 * Main game table screen
 */
export default function GameTable({
  gameState,
  onDiscard,
  onCallMahjong,
  onDeclareMahjong,
}) {
  const [cardOpen, setCardOpen] = useState(false);
  const [selectedUid, setSelectedUid] = useState(null);
  const [showMahjongBtn, setShowMahjongBtn] = useState(false);

  const humanPlayer = gameState.players[0];
  const currentPlayer = gameState.currentPlayer;
  const isHumanTurn = currentPlayer === 0;
  const wallRemaining = gameState.wall.length - gameState.wallIndex;
  const canCall = gameState.canHumanCallMahjong || false;
  const thinkingPlayer = gameState.thinkingPlayer;

  // Check if human can declare mahjong on their own draw
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
      // Discard the selected tile
      onDiscard(tile.uid);
      setSelectedUid(null);
    } else {
      setSelectedUid(tile.uid);
    }
  }

  // Seat layout: human=bottom, South=right, West=top, North=left
  const seats = [
    { playerIdx: 2, position: 'top', label: 'West' },
    { playerIdx: 3, position: 'left', label: 'North' },
    { playerIdx: 1, position: 'right', label: 'South' },
  ];

  return (
    <div className="felt-texture" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Wood border */}
      <div style={{
        position: 'absolute', inset: 0,
        border: '8px solid transparent',
        borderRadius: 0,
        background: 'linear-gradient(#1a4731, #1a4731) padding-box, linear-gradient(135deg, #8B6914 0%, #c9a84c 30%, #8B6914 50%, #c9a84c 70%, #8B6914 100%) border-box',
        pointerEvents: 'none',
        zIndex: 1,
      }}/>

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 16px 6px',
        zIndex: 2, flexShrink: 0,
        background: 'rgba(13,31,23,0.5)',
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <WallCounter remaining={wallRemaining} total={160}/>
          <div style={{
            fontSize: 11, color: isHumanTurn ? '#e8c96a' : 'rgba(247,242,232,0.5)',
            fontFamily: 'Nunito', fontWeight: 700,
            padding: '4px 8px', background: isHumanTurn ? 'rgba(201,168,76,0.12)' : 'transparent',
            borderRadius: 6, border: isHumanTurn ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
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
                background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
                border: 'none', borderRadius: 8,
                padding: '6px 12px',
                color: '#0d1f17', fontSize: 12, fontWeight: 800,
                fontFamily: 'Playfair Display, serif', cursor: 'pointer',
                animation: 'pulseGlow 1s ease-in-out infinite',
              }}
            >
              Mahjong!
            </button>
          )}
          <button
            onClick={() => setCardOpen(true)}
            style={{
              background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 8, padding: '6px 10px',
              color: '#c9a84c', fontSize: 11, fontFamily: 'Nunito', fontWeight: 700,
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
          player={gameState.players[2]}
          position="top"
          isThinking={thinkingPlayer === 2}
          isCurrentTurn={currentPlayer === 2}
        />
      </div>

      {/* Middle row: left seat + discard pool + right seat */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'stretch',
        padding: '2px 6px', gap: 4, minHeight: 0, zIndex: 2,
      }}>
        {/* Left: North */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <OpponentSeat
            player={gameState.players[3]}
            position="left"
            isThinking={thinkingPlayer === 3}
            isCurrentTurn={currentPlayer === 3}
          />
        </div>

        {/* Center: discard pool */}
        <div style={{
          flex: 1,
          background: 'rgba(13,31,23,0.35)',
          borderRadius: 8,
          border: '1px solid rgba(201,168,76,0.08)',
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

        {/* Right: South */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <OpponentSeat
            player={gameState.players[1]}
            position="right"
            isThinking={thinkingPlayer === 1}
            isCurrentTurn={currentPlayer === 1}
          />
        </div>
      </div>

      {/* Last drawn tile indicator */}
      {isHumanTurn && gameState.lastDrawnTile && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
          padding: '2px 0', zIndex: 2, flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, color: 'rgba(247,242,232,0.5)', fontFamily: 'Nunito' }}>Drew:</span>
          <MahjongTile tile={gameState.lastDrawnTile} size="sm" animateIn/>
        </div>
      )}

      {/* Human player hand */}
      <div style={{
        background: 'rgba(13,31,23,0.6)',
        borderTop: '1px solid rgba(201,168,76,0.15)',
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
          <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(247,242,232,0.5)', fontFamily: 'Nunito', paddingBottom: 4 }}>
            Tap again to discard · tap another to swap
          </div>
        )}
      </div>

      <CardReference isOpen={cardOpen} onClose={() => setCardOpen(false)}/>
    </div>
  );
}

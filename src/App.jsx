import React, { useEffect, useRef, useCallback } from 'react';
import { GameProvider, useGame } from './context/GameContext.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import CharlestonScreen from './screens/CharlestonScreen.jsx';
import GameTable from './screens/GameTable.jsx';
import DeclarationScreen from './screens/DeclarationScreen.jsx';
import ScoringOverlay from './components/ScoringOverlay.jsx';

import {
  dealTiles,
  drawTile,
  discardTile,
  advanceTurn,
  applyCharlestonPass,
  skipSecondCharleston,
  isWallExhausted,
} from './logic/gameEngine.js';
import { loadGame, clearSavedGame, getSavedGameInfo } from './utils/persistence.js';
import {
  chooseTilesForCharleston,
  chooseTileToDiscard,
  shouldCallMahjong,
  canSelfDeclare,
  getThinkingDelay,
} from './logic/aiPlayer.js';
import { checkWin, canWinWithTile } from './logic/handMatcher.js';
import { calculatePayments, applyPayments } from './logic/scoring.js';

function AppInner() {
  const { state, setState, patchState, reset } = useGame();
  const aiTimerRef = useRef(null);
  const lastAiKey = useRef(null);
  const lastHumanDrawKey = useRef(null);

  // ── AI Turn Logic ──────────────────────────────────────────────────────────
  const runAiTurn = useCallback((gameState, playerIdx) => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);

    aiTimerRef.current = setTimeout(() => {
      // Check wall
      if (isWallExhausted(gameState)) {
        setState({ ...gameState, phase: 'declaration', wallExhausted: true, thinkingPlayer: null });
        return;
      }

      // Draw tile
      const { newState: afterDraw, drawnTile } = drawTile(gameState, playerIdx);

      if (!drawnTile) {
        setState({ ...afterDraw, phase: 'declaration', wallExhausted: true, thinkingPlayer: null });
        return;
      }

      const aiPlayer = afterDraw.players[playerIdx];

      // Check self-declare
      const winDef = canSelfDeclare(aiPlayer.hand, aiPlayer.flowers.length);
      if (winDef) {
        const payments = calculatePayments(playerIdx, null, winDef.points);
        const newScores = applyPayments(afterDraw.scores, payments);
        setState({
          ...afterDraw,
          phase: 'declaration',
          winner: playerIdx,
          winningHand: winDef,
          scores: newScores,
          _payments: payments,
          _throwerId: null,
          _isSelfDraw: true,
          thinkingPlayer: null,
        });
        return;
      }

      // Choose discard
      const discardUid = chooseTileToDiscard(aiPlayer.hand, aiPlayer.flowers);
      if (!discardUid) {
        setState({ ...afterDraw, thinkingPlayer: null });
        return;
      }

      let afterDiscard = discardTile(afterDraw, playerIdx, discardUid);

      // Check if human can call this discard
      const human = afterDiscard.players[0];
      const callResult = canWinWithTile(human.hand, afterDiscard.lastDiscard, human.flowers.length);
      afterDiscard = { ...afterDiscard, canHumanCallMahjong: callResult.matched, thinkingPlayer: null };

      if (callResult.matched) {
        setState(afterDiscard);
        return;
      }

      // Check if another AI can call
      let aiCalled = false;
      for (let i = 1; i < 4; i++) {
        if (i === playerIdx) continue;
        const aiP = afterDiscard.players[i];
        if (shouldCallMahjong(aiP.hand, afterDiscard.lastDiscard, aiP.flowers.length)) {
          const callerHand = [...aiP.hand, afterDiscard.lastDiscard];
          const winCheck = checkWin(callerHand, aiP.flowers.length, false);
          if (winCheck.matched) {
            const payments = calculatePayments(i, playerIdx, winCheck.handDef.points);
            const newScores = applyPayments(afterDiscard.scores, payments);
            setState({
              ...afterDiscard,
              phase: 'declaration',
              winner: i,
              winningHand: winCheck.handDef,
              scores: newScores,
              _payments: payments,
              _throwerId: afterDiscard.lastDiscardBy,
              _isSelfDraw: false,
              thinkingPlayer: null,
            });
            aiCalled = true;
            break;
          }
        }
      }

      if (!aiCalled) {
        const nextState = advanceTurn(afterDiscard);
        setState(nextState);
      }
    }, getThinkingDelay());
  }, [setState]);

  // Watch for AI turns
  useEffect(() => {
    if (state.phase !== 'playing') return;
    if (state.currentPlayer === 0) return;
    if (state.thinkingPlayer !== null) return;
    if (state.canHumanCallMahjong) return;

    const key = `ai-${state.currentPlayer}-${state.wallIndex}-${state.discardPile.length}`;
    if (lastAiKey.current === key) return;
    lastAiKey.current = key;

    const captured = { ...state };
    patchState({ thinkingPlayer: state.currentPlayer });
    runAiTurn(captured, state.currentPlayer);
  }, [state.phase, state.currentPlayer, state.thinkingPlayer, state.discardPile.length, state.canHumanCallMahjong]);

  // Auto-draw for human at start of turn
  useEffect(() => {
    if (state.phase !== 'playing') return;
    if (state.currentPlayer !== 0) return;
    if (state.lastDrawnTile) return;
    if (state.humanCanDeclare) return;
    if (state.canHumanCallMahjong) return;

    const key = `human-draw-${state.wallIndex}-${state.discardPile.length}`;
    if (lastHumanDrawKey.current === key) return;
    lastHumanDrawKey.current = key;

    if (isWallExhausted(state)) {
      setState({ ...state, phase: 'declaration', wallExhausted: true });
      return;
    }

    const { newState, drawnTile } = drawTile(state, 0);
    if (!drawnTile) {
      setState({ ...newState, phase: 'declaration', wallExhausted: true });
      return;
    }
    const human = newState.players[0];
    const winDef = canSelfDeclare(human.hand, human.flowers.length);
    setState({ ...newState, humanCanDeclare: !!winDef, _selfDeclareHand: winDef || null });
  }, [state.phase, state.currentPlayer, state.wallIndex, state.discardPile.length, state.lastDrawnTile, state.humanCanDeclare, state.canHumanCallMahjong]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleNewGame() {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    lastAiKey.current = null;
    lastHumanDrawKey.current = null;
    clearSavedGame();
    const newState = dealTiles(state);
    setState(newState);
  }

  function handleResumeGame() {
    const saved = loadGame();
    if (!saved) return;
    lastAiKey.current = null;
    lastHumanDrawKey.current = null;
    setState(saved);
  }

  function handleCharlestonPass(humanUids) {
    patchState({ waitingForAI: true });
    setTimeout(() => {
      const allPasses = [humanUids];
      for (let i = 1; i < 4; i++) {
        const player = state.players[i];
        const chosen = chooseTilesForCharleston(player.hand, player.flowers);
        allPasses.push(chosen);
      }
      const newState = applyCharlestonPass(state, allPasses);
      setState({ ...newState, waitingForAI: false });
    }, 700);
  }

  function handleSkipSecondCharleston() {
    setState(skipSecondCharleston(state));
  }

  function handleDiscard(tileUid) {
    if (state.currentPlayer !== 0) return;
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);

    let afterDiscard = discardTile(state, 0, tileUid);

    // Check if any AI can call
    let aiCalled = false;
    for (let i = 1; i < 4; i++) {
      const aiP = afterDiscard.players[i];
      if (shouldCallMahjong(aiP.hand, afterDiscard.lastDiscard, aiP.flowers.length)) {
        const callerHand = [...aiP.hand, afterDiscard.lastDiscard];
        const winCheck = checkWin(callerHand, aiP.flowers.length, false);
        if (winCheck.matched) {
          const payments = calculatePayments(i, afterDiscard.lastDiscardBy, winCheck.handDef.points);
          const newScores = applyPayments(afterDiscard.scores, payments);
          setState({
            ...afterDiscard,
            phase: 'declaration',
            winner: i,
            winningHand: winCheck.handDef,
            scores: newScores,
            _payments: payments,
            _throwerId: afterDiscard.lastDiscardBy,
            _isSelfDraw: false,
            thinkingPlayer: null,
          });
          aiCalled = true;
          break;
        }
      }
    }

    if (!aiCalled) {
      const nextState = advanceTurn(afterDiscard);
      lastAiKey.current = null;
      setState(nextState);
    }
  }

  function handleDeclareMahjong() {
    const human = state.players[0];
    const winDef = state._selfDeclareHand || canSelfDeclare(human.hand, human.flowers.length);
    if (!winDef) return;
    const payments = calculatePayments(0, null, winDef.points);
    const newScores = applyPayments(state.scores, payments);
    setState({
      ...state,
      phase: 'declaration',
      winner: 0,
      winningHand: winDef,
      scores: newScores,
      _payments: payments,
      _throwerId: null,
      _isSelfDraw: true,
    });
  }

  function handleCallMahjongOnDiscard() {
    const human = state.players[0];
    const tile = state.lastDiscard;
    if (!tile) return;

    const result = canWinWithTile(human.hand, tile, human.flowers.length);
    if (!result.matched) return;

    const hand14 = [...human.hand, tile];
    const winCheck = checkWin(hand14, human.flowers.length, false);
    if (!winCheck.matched) return;

    // Find thrower: the player who discarded
    const throwerId = state.lastDiscardBy !== undefined && state.lastDiscardBy !== 0 ? state.lastDiscardBy : null;

    const payments = calculatePayments(0, throwerId, winCheck.handDef.points);
    const newScores = applyPayments(state.scores, payments);
    setState({
      ...state,
      phase: 'declaration',
      winner: 0,
      winningHand: winCheck.handDef,
      players: state.players.map((p, i) =>
        i === 0 ? { ...p, hand: [...p.hand, tile] } : p
      ),
      scores: newScores,
      _payments: payments,
      _throwerId: throwerId,
      _isSelfDraw: false,
      canHumanCallMahjong: false,
    });
  }

  function handleContinueToSummary() {
    patchState({ phase: 'summary' });
  }

  function handlePlayAgain() {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    lastAiKey.current = null;
    lastHumanDrawKey.current = null;
    clearSavedGame();
    reset();
  }

  // ── Routing ────────────────────────────────────────────────────────────────

  const playerNames = state.players.map(p => p.name);

  const summaryData = {
    winnerIdx: state.winner,
    winnerName: state.winner !== null ? playerNames[state.winner] : null,
    hand: state.winningHand,
    payments: state._payments || [],
    scores: state.scores,
    isSelfDraw: state._isSelfDraw,
    throwerId: state._throwerId !== undefined ? state._throwerId : null,
    isWallExhausted: state.wallExhausted,
  };

  if (state.phase === 'home') {
    const savedInfo = getSavedGameInfo();
    return (
      <HomeScreen
        onNewGame={handleNewGame}
        onResumeGame={savedInfo ? handleResumeGame : null}
        savedGameInfo={savedInfo}
      />
    );
  }

  if (state.phase === 'charleston') {
    return (
      <CharlestonScreen
        gameState={state}
        onPass={handleCharlestonPass}
        onSkipSecondCharleston={handleSkipSecondCharleston}
      />
    );
  }

  if (state.phase === 'playing') {
    return (
      <GameTable
        gameState={state}
        onDiscard={handleDiscard}
        onCallMahjong={handleCallMahjongOnDiscard}
        onDeclareMahjong={handleDeclareMahjong}
      />
    );
  }

  if (state.phase === 'declaration') {
    return (
      <DeclarationScreen
        gameState={state}
        onContinue={handleContinueToSummary}
      />
    );
  }

  if (state.phase === 'summary') {
    return (
      <div style={{ position: 'relative', height: '100%' }}>
        <GameTable
          gameState={state}
          onDiscard={() => {}}
          onCallMahjong={() => {}}
          onDeclareMahjong={() => {}}
        />
        <ScoringOverlay
          winResult={summaryData}
          playerNames={playerNames}
          onPlayAgain={handlePlayAgain}
          visible={true}
        />
      </div>
    );
  }

  return <HomeScreen onNewGame={handleNewGame}/>;
}

export default function App() {
  return (
    <GameProvider>
      <AppInner/>
    </GameProvider>
  );
}

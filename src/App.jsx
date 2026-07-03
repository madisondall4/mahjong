import React, { useEffect, useRef, useCallback, useState } from 'react';
import { GameProvider, useGame } from './context/GameContext.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import CharlestonScreen from './screens/CharlestonScreen.jsx';
import GameTable from './screens/GameTable.jsx';
import DeclarationScreen from './screens/DeclarationScreen.jsx';
import JournalScreen from './screens/JournalScreen.jsx';
import PassHandoffScreen from './screens/PassHandoffScreen.jsx';
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
import { loadGame, clearSavedGame, getSavedGameInfo, getDifficulty } from './utils/persistence.js';
import { recordGameEnd } from './utils/stats.js';
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
  const [journalOpen, setJournalOpen] = useState(false);
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
      const diff = gameState.difficulty || 'spicy';

      // Check self-declare
      const winDef = canSelfDeclare(aiPlayer.hand, aiPlayer.flowers.length, diff);
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
      const discardUid = chooseTileToDiscard(aiPlayer.hand, aiPlayer.flowers, diff, afterDraw.discardPile);
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
        if (shouldCallMahjong(aiP.hand, afterDiscard.lastDiscard, aiP.flowers.length, diff)) {
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
    }, getThinkingDelay(gameState.difficulty));
  }, [setState]);

  // Watch for AI turns
  useEffect(() => {
    if (state.phase !== 'playing') return;
    if (state.mode === 'pass') return; // no AI in pass-and-play
    if (state.currentPlayer === 0) return;
    if (state.thinkingPlayer !== null) return;
    if (state.canHumanCallMahjong) return;

    const key = `ai-${state.currentPlayer}-${state.wallIndex}-${state.discardPile.length}`;
    if (lastAiKey.current === key) return;
    lastAiKey.current = key;

    const captured = { ...state };
    patchState({ thinkingPlayer: state.currentPlayer });
    runAiTurn(captured, state.currentPlayer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by turn signature; the full state object is captured intentionally
  }, [state.phase, state.mode, state.currentPlayer, state.thinkingPlayer, state.discardPile.length, state.canHumanCallMahjong]);

  // Auto-draw for human at start of turn
  useEffect(() => {
    if (state.phase !== 'playing') return;
    if (state.mode === 'pass') return; // pass-and-play draws on reveal
    if (state.currentPlayer !== 0) return;
    if (state.lastDrawnTile) return;
    if (state.humanCanDeclare) return;
    if (state.canHumanCallMahjong) return;

    const key = `human-draw-${state.wallIndex}-${state.discardPile.length}`;
    if (lastHumanDrawKey.current === key) return;
    lastHumanDrawKey.current = key;

    // East opens the game already holding 14 tiles: no draw — they discard
    // first. But a dealt-complete hand ("heavenly hand") must be declarable.
    if (state.players[0].hand.length >= 14) {
      const human = state.players[0];
      const winDef = canSelfDeclare(human.hand, human.flowers.length);
      if (winDef) {
        setState({ ...state, humanCanDeclare: true, _selfDeclareHand: winDef });
      }
      return;
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by draw signature (wallIndex + discard count); guarded by lastHumanDrawKey
  }, [state.phase, state.mode, state.currentPlayer, state.wallIndex, state.discardPile.length, state.lastDrawnTile, state.humanCanDeclare, state.canHumanCallMahjong]);

  // Record game results for stats/journal once per game (idempotent by gameId).
  // Solo only — pass-and-play wins belong to whoever held the device.
  useEffect(() => {
    if (state.phase !== 'declaration' && state.phase !== 'summary') return;
    if (state.mode === 'pass') return;
    if (!state.gameId) return;
    recordGameEnd({
      gameId: state.gameId,
      winnerIdx: state.winner,
      handDef: state.winningHand,
      wallExhausted: state.wallExhausted,
    });
  }, [state.phase, state.mode, state.gameId, state.winner, state.winningHand, state.wallExhausted]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleNewGame(mode = 'solo') {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    lastAiKey.current = null;
    lastHumanDrawKey.current = null;
    clearSavedGame();
    const players = mode === 'pass'
      ? ['Player 1', 'Player 2', 'Player 3', 'Player 4'].map((name, id) => ({
          id, name, isHuman: true, hand: [], flowers: [], score: 0,
        }))
      : ['You', 'South', 'West', 'North'].map((name, id) => ({
          id, name, isHuman: id === 0, hand: [], flowers: [], score: 0,
        }));
    const newState = dealTiles({ ...state, difficulty: getDifficulty(), mode, players });
    if (mode === 'pass') {
      newState._passStage = 'handoff';
      newState._passPicker = 0;
      newState._passPicks = [null, null, null, null];
    }
    setState(newState);
  }

  // ── Pass-and-play orchestration ────────────────────────────────────────────

  function handlePassCharlestonPick(uids) {
    const picks = [...(state._passPicks || [null, null, null, null])];
    picks[state._passPicker] = uids;
    if (state._passPicker < 3) {
      setState({ ...state, _passPicks: picks, _passPicker: state._passPicker + 1, _passStage: 'handoff' });
      return;
    }
    const afterPass = applyCharlestonPass(state, picks);
    setState({
      ...afterPass,
      _passPicks: [null, null, null, null],
      _passPicker: 0,
      _passStage: 'handoff',
    });
  }

  function handlePassSkipSecond() {
    setState({ ...skipSecondCharleston(state), _passStage: 'handoff', _passPicker: 0 });
  }

  function handlePassReveal() {
    const p = state.currentPlayer;
    const player = state.players[p];

    // East's opening turn: already 14 tiles — no draw, discard first.
    if (player.hand.length >= 14) {
      const win = checkWin(player.hand, player.flowers.length, true);
      setState({
        ...state,
        _passStage: 'act',
        humanCanDeclare: win.matched,
        _selfDeclareHand: win.matched ? win.handDef : null,
      });
      return;
    }

    if (isWallExhausted(state)) {
      setState({ ...state, phase: 'declaration', wallExhausted: true });
      return;
    }
    const { newState, drawnTile } = drawTile(state, p);
    if (!drawnTile) {
      setState({ ...newState, phase: 'declaration', wallExhausted: true });
      return;
    }
    const drawn = newState.players[p];
    const win = checkWin(drawn.hand, drawn.flowers.length, true);
    setState({
      ...newState,
      _passStage: 'act',
      humanCanDeclare: win.matched,
      _selfDeclareHand: win.matched ? win.handDef : null,
    });
  }

  function handlePassDiscard(tileUid) {
    const afterDiscard = discardTile(state, state.currentPlayer, tileUid);
    setState({ ...afterDiscard, _passStage: 'call', humanCanDeclare: false, _selfDeclareHand: null });
  }

  function handlePassCallContinue() {
    setState({ ...advanceTurn(state), _passStage: 'handoff' });
  }

  function handlePassCall(callerIdx) {
    const caller = state.players[callerIdx];
    const tile = state.lastDiscard;
    if (!tile) return false;
    const result = canWinWithTile(caller.hand, tile, caller.flowers.length);
    if (!result.matched) return false;

    const payments = calculatePayments(callerIdx, state.lastDiscardBy, result.handDef.points);
    const newScores = applyPayments(state.scores, payments);
    setState({
      ...state,
      phase: 'declaration',
      winner: callerIdx,
      winningHand: result.handDef,
      players: state.players.map((pl, i) =>
        i === callerIdx ? { ...pl, hand: [...pl.hand, tile] } : pl
      ),
      scores: newScores,
      _payments: payments,
      _throwerId: state.lastDiscardBy,
      _isSelfDraw: false,
    });
    return true;
  }

  function handlePassDeclare() {
    const p = state.currentPlayer;
    const player = state.players[p];
    const winDef = state._selfDeclareHand || checkWin(player.hand, player.flowers.length, true).handDef;
    if (!winDef) return;
    const payments = calculatePayments(p, null, winDef.points);
    const newScores = applyPayments(state.scores, payments);
    setState({
      ...state,
      phase: 'declaration',
      winner: p,
      winningHand: winDef,
      scores: newScores,
      _payments: payments,
      _throwerId: null,
      _isSelfDraw: true,
    });
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
      const diff = state.difficulty || 'spicy';
      const allPasses = [humanUids];
      for (let i = 1; i < 4; i++) {
        const player = state.players[i];
        const chosen = chooseTilesForCharleston(player.hand, player.flowers, diff);
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
    const diff = state.difficulty || 'spicy';
    let aiCalled = false;
    for (let i = 1; i < 4; i++) {
      const aiP = afterDiscard.players[i];
      if (shouldCallMahjong(aiP.hand, afterDiscard.lastDiscard, aiP.flowers.length, diff)) {
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

  const winnerPlayer = state.winner !== null ? state.players[state.winner] : null;
  const summaryData = {
    mode: state.mode,
    winnerIdx: state.winner,
    winnerName: state.winner !== null ? playerNames[state.winner] : null,
    hand: state.winningHand,
    tiles: winnerPlayer ? winnerPlayer.hand : [],
    flowers: winnerPlayer ? winnerPlayer.flowers : [],
    payments: state._payments || [],
    scores: state.scores,
    isSelfDraw: state._isSelfDraw,
    throwerId: state._throwerId !== undefined ? state._throwerId : null,
    isWallExhausted: state.wallExhausted,
  };

  if (state.phase === 'home') {
    if (journalOpen) {
      return <JournalScreen onClose={() => setJournalOpen(false)}/>;
    }
    const savedInfo = getSavedGameInfo();
    return (
      <HomeScreen
        onNewGame={handleNewGame}
        onResumeGame={savedInfo ? handleResumeGame : null}
        savedGameInfo={savedInfo}
        onOpenJournal={() => setJournalOpen(true)}
      />
    );
  }

  if (state.phase === 'charleston') {
    if (state.mode === 'pass') {
      const picker = state._passPicker || 0;
      if (state._passStage === 'handoff') {
        return (
          <PassHandoffScreen
            mode="handoff"
            toName={state.players[picker].name}
            subtitle={`Charleston · round ${state.charleston.round}, step ${state.charleston.step + 1} — pick 3 tiles to pass`}
            onReveal={() => patchState({ _passStage: 'act' })}
          />
        );
      }
      return (
        <CharlestonScreen
          gameState={state}
          viewerIdx={picker}
          viewerLabel={state.players[picker].name}
          onPass={handlePassCharlestonPick}
          onSkipSecondCharleston={picker === 0 ? handlePassSkipSecond : null}
        />
      );
    }
    return (
      <CharlestonScreen
        gameState={state}
        onPass={handleCharlestonPass}
        onSkipSecondCharleston={handleSkipSecondCharleston}
      />
    );
  }

  if (state.phase === 'playing') {
    if (state.mode === 'pass') {
      const p = state.currentPlayer;
      if (state._passStage === 'call' && state.lastDiscard) {
        const nextIdx = (p + 1) % 4;
        return (
          <PassHandoffScreen
            mode="call"
            lastDiscard={state.lastDiscard}
            discarderName={state.players[state.lastDiscardBy]?.name}
            discarderIdx={state.lastDiscardBy}
            players={state.players}
            toName={state.players[nextIdx].name}
            onContinue={handlePassCallContinue}
            onCallMahjong={handlePassCall}
          />
        );
      }
      if (state._passStage !== 'act') {
        return (
          <PassHandoffScreen
            mode="handoff"
            toName={state.players[p].name}
            subtitle={state.players[p].hand.length >= 14 ? 'You open — discard a tile' : 'Your turn — draw and discard'}
            onReveal={handlePassReveal}
          />
        );
      }
      return (
        <GameTable
          gameState={state}
          viewerIdx={p}
          onDiscard={handlePassDiscard}
          onCallMahjong={() => {}}
          onDeclareMahjong={handlePassDeclare}
        />
      );
    }
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

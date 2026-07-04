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
  legalExposures,
  exposeFromDiscard,
  effectiveHandCount,
} from './logic/gameEngine.js';
import { loadGame, clearSavedGame, getSavedGameInfo, getDifficulty } from './utils/persistence.js';
import { recordGameEnd } from './utils/stats.js';
import {
  chooseTilesForCharleston,
  chooseTileToDiscard,
  chooseExposure,
  shouldCallMahjong,
  canSelfDeclare,
  getThinkingDelay,
} from './logic/aiPlayer.js';
import { checkWin, canWinWithTile } from './logic/handMatcher.js';
import { calculatePayments, applyPayments } from './logic/scoring.js';
import { playClack, playDraw, playCallAlert, playSwoosh, playFanfare } from './utils/sound.js';

/** Game audio + haptics keyed off state transitions — one hook covers every mode. */
function useSoundEffects(state) {
  const prev = useRef({ discardUid: null, drawnUid: null, callOpen: false, phase: null, incoming: null });
  useEffect(() => {
    const p = prev.current;
    const discardUid = state.lastDiscard?.uid ?? null;
    const drawnUid = state.lastDrawnTile?.uid ?? null;
    const callOpen = !!(state.canHumanCallMahjong || (state.humanExposeOptions?.length > 0));
    if (state.phase === 'playing' && discardUid !== null && discardUid !== p.discardUid) playClack();
    if (state.phase === 'playing' && drawnUid !== null && drawnUid !== p.drawnUid && state.currentPlayer === 0 && state.mode !== 'pass') playDraw();
    if (callOpen && !p.callOpen) playCallAlert();
    if (state.phase === 'declaration' && p.phase !== 'declaration' && state.winner !== null) playFanfare();
    if (state.phase === 'charleston' && state.lastIncomingTiles && state.lastIncomingTiles !== p.incoming) playSwoosh();
    prev.current = { discardUid, drawnUid, callOpen, phase: state.phase, incoming: state.lastIncomingTiles };
  }, [state]);
}

function AppInner() {
  const { state, setState, patchState, reset } = useGame();
  const [journalOpen, setJournalOpen] = useState(false);
  const aiTimerRef = useRef(null);
  const lastAiKey = useRef(null);
  const lastHumanDrawKey = useRef(null);
  useSoundEffects(state);

  // ── Solo-mode turn resolution ─────────────────────────────────────────────
  //
  // After ANY discard: (1) offer the human a mahjong/exposure call with an
  // explicit Pass, (2) AI mahjong calls, (3) AI exposure calls (caller takes
  // the turn without drawing and must discard), (4) next player's turn.

  const declareWinner = useCallback((st, winnerIdx, winDef, throwerId) => {
    const payments = calculatePayments(winnerIdx, throwerId, winDef.points);
    const newScores = applyPayments(st.scores, payments);
    setState({
      ...st,
      phase: 'declaration',
      winner: winnerIdx,
      winningHand: winDef,
      scores: newScores,
      _payments: payments,
      _throwerId: throwerId,
      _isSelfDraw: throwerId === null,
      thinkingPlayer: null,
      canHumanCallMahjong: false,
      humanExposeOptions: null,
    });
  }, [setState]);

  const continueAfterHumanPass = useCallback((st, discarderIdx) => {
    const diff = st.difficulty || 'spicy';

    // AI mahjong calls (mahjong beats exposure)
    for (let i = 1; i < 4; i++) {
      if (i === discarderIdx) continue;
      const aiP = st.players[i];
      if (shouldCallMahjong(aiP.hand, st.lastDiscard, aiP.flowers.length, diff, aiP.exposures || [])) {
        const winCheck = canWinWithTile(aiP.hand, st.lastDiscard, aiP.flowers.length, aiP.exposures || []);
        if (winCheck.matched) {
          const claimed = {
            ...st,
            players: st.players.map((pl, j) => j === i ? { ...pl, hand: [...pl.hand, st.lastDiscard] } : pl),
            discardPile: st.discardPile.filter(t => t.uid !== st.lastDiscard.uid),
          };
          declareWinner(claimed, i, winCheck.handDef, st.lastDiscardBy);
          return;
        }
      }
    }

    // AI exposure calls, next-in-turn priority
    for (let k = 1; k < 4; k++) {
      const i = (discarderIdx + k) % 4;
      if (i === 0 || i === discarderIdx) continue;
      const aiP = st.players[i];
      const call = chooseExposure(aiP.hand, aiP.flowers, aiP.exposures || [], st.lastDiscard, diff);
      if (call) {
        const exposed = exposeFromDiscard(st, i, call.n, call.jokersUsed);
        setState({ ...exposed, thinkingPlayer: i, humanExposeOptions: null });
        // The caller now discards (no draw) after a thinking beat.
        if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
        aiTimerRef.current = setTimeout(() => {
          const caller = exposed.players[i];
          const uid = chooseTileToDiscard(caller.hand, caller.flowers, diff, exposed.discardPile, caller.exposures || []);
          if (!uid) { setState({ ...exposed, thinkingPlayer: null }); return; }
          const afterDiscard = { ...discardTile(exposed, i, uid), thinkingPlayer: null };
          resolveAfterDiscardRef.current(afterDiscard, i);
        }, getThinkingDelay(diff));
        return;
      }
    }

    setState({ ...advanceTurn(st), thinkingPlayer: null, humanExposeOptions: null });
  }, [setState, declareWinner]);

  const resolveAfterDiscard = useCallback((afterDiscard, discarderIdx) => {
    // Human gets first refusal (they aren't prompted on their own discard).
    if (discarderIdx !== 0) {
      const human = afterDiscard.players[0];
      const mahjong = canWinWithTile(
        human.hand, afterDiscard.lastDiscard, human.flowers.length, human.exposures || []
      ).matched;
      const exposeOpts = legalExposures(human, afterDiscard.lastDiscard);
      if (mahjong || exposeOpts.length > 0) {
        setState({
          ...afterDiscard,
          canHumanCallMahjong: mahjong,
          humanExposeOptions: exposeOpts,
          thinkingPlayer: null,
        });
        return; // waits for call / expose / pass
      }
    }
    continueAfterHumanPass({ ...afterDiscard, canHumanCallMahjong: false, humanExposeOptions: null }, discarderIdx);
  }, [setState, continueAfterHumanPass]);

  // Break the circular dependency between continueAfterHumanPass and
  // resolveAfterDiscard (an exposing AI's discard re-enters resolution).
  const resolveAfterDiscardRef = useRef(resolveAfterDiscard);
  useEffect(() => { resolveAfterDiscardRef.current = resolveAfterDiscard; }, [resolveAfterDiscard]);

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
      const winDef = canSelfDeclare(aiPlayer.hand, aiPlayer.flowers.length, diff, aiPlayer.exposures || []);
      if (winDef) {
        declareWinner(afterDraw, playerIdx, winDef, null);
        return;
      }

      // Choose discard
      const discardUid = chooseTileToDiscard(aiPlayer.hand, aiPlayer.flowers, diff, afterDraw.discardPile, aiPlayer.exposures || []);
      if (!discardUid) {
        setState({ ...afterDraw, thinkingPlayer: null });
        return;
      }

      const afterDiscard = { ...discardTile(afterDraw, playerIdx, discardUid), thinkingPlayer: null };
      resolveAfterDiscard(afterDiscard, playerIdx);
    }, getThinkingDelay(gameState.difficulty));
  }, [setState, declareWinner, resolveAfterDiscard]);

  // Watch for AI turns
  useEffect(() => {
    if (state.phase !== 'playing') return;
    if (state.mode === 'pass') return; // no AI in pass-and-play
    if (state.currentPlayer === 0) return;
    if (state.thinkingPlayer !== null) return;
    if (state.canHumanCallMahjong) return;
    if (state.humanExposeOptions && state.humanExposeOptions.length > 0) return;

    const meldCount = state.players.reduce((a, pl) => a + (pl.exposures?.length || 0), 0);
    const key = `ai-${state.currentPlayer}-${state.wallIndex}-${state.discardPile.length}-${meldCount}`;
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
    if (state.humanExposeOptions && state.humanExposeOptions.length > 0) return;

    const meldCount = state.players.reduce((a, pl) => a + (pl.exposures?.length || 0), 0);
    const key = `human-draw-${state.wallIndex}-${state.discardPile.length}-${meldCount}`;
    if (lastHumanDrawKey.current === key) return;
    lastHumanDrawKey.current = key;

    // Already holding a full position (East's opening 14, or just exposed a
    // meld): no draw — discard next. A complete position must be declarable.
    if (effectiveHandCount(state.players[0]) >= 14) {
      const human = state.players[0];
      const winDef = canSelfDeclare(human.hand, human.flowers.length, 'spicy', human.exposures || []);
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
    const winDef = canSelfDeclare(human.hand, human.flowers.length, 'spicy', human.exposures || []);
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

  function handleNewGame(mode = 'solo', passNames = null) {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    lastAiKey.current = null;
    lastHumanDrawKey.current = null;
    clearSavedGame();
    const players = mode === 'pass'
      ? (passNames || ['Player 1', 'Player 2', 'Player 3', 'Player 4']).map((name, id) => ({
          id, name, isHuman: true, hand: [], flowers: [], exposures: [], score: 0,
        }))
      : ['You', 'South', 'West', 'North'].map((name, id) => ({
          id, name, isHuman: id === 0, hand: [], flowers: [], exposures: [], score: 0,
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

    // Full position already (East's opening 14, or just exposed a meld):
    // no draw — discard next.
    if (effectiveHandCount(player) >= 14) {
      const win = checkWin(player.hand, player.flowers.length, true, player.exposures || []);
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
    const win = checkWin(drawn.hand, drawn.flowers.length, true, drawn.exposures || []);
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
    const result = canWinWithTile(caller.hand, tile, caller.flowers.length, caller.exposures || []);
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
      discardPile: state.discardPile.filter(t => t.uid !== tile.uid),
      scores: newScores,
      _payments: payments,
      _throwerId: state.lastDiscardBy,
      _isSelfDraw: false,
    });
    return true;
  }

  // Pass-and-play: a player claims the discard as an exposure. They take the
  // turn (handoff -> reveal -> discard, no draw).
  function handlePassExpose(callerIdx, option) {
    if (!state.lastDiscard) return false;
    const exposed = exposeFromDiscard(state, callerIdx, option.n, option.jokersUsed);
    if (exposed === state) return false;
    setState({ ...exposed, _passStage: 'handoff' });
    return true;
  }

  function handlePassDeclare() {
    const p = state.currentPlayer;
    const player = state.players[p];
    const winDef = state._selfDeclareHand || checkWin(player.hand, player.flowers.length, true, player.exposures || []).handDef;
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

    const afterDiscard = discardTile(state, 0, tileUid);
    lastAiKey.current = null;
    resolveAfterDiscard(afterDiscard, 0);
  }

  function handleDeclareMahjong() {
    const human = state.players[0];
    const winDef = state._selfDeclareHand
      || canSelfDeclare(human.hand, human.flowers.length, 'spicy', human.exposures || []);
    if (!winDef) return;
    declareWinner(state, 0, winDef, null);
  }

  function handleCallMahjongOnDiscard() {
    const human = state.players[0];
    const tile = state.lastDiscard;
    if (!tile) return;

    const winCheck = canWinWithTile(human.hand, tile, human.flowers.length, human.exposures || []);
    if (!winCheck.matched) return;

    const throwerId = state.lastDiscardBy !== undefined && state.lastDiscardBy !== 0 ? state.lastDiscardBy : null;
    const claimed = {
      ...state,
      players: state.players.map((p, i) =>
        i === 0 ? { ...p, hand: [...p.hand, tile] } : p
      ),
      discardPile: state.discardPile.filter(t => t.uid !== tile.uid),
    };
    declareWinner(claimed, 0, winCheck.handDef, throwerId);
  }

  // Human claims the discard as a face-up meld, then must discard.
  function handleHumanExpose(option) {
    if (!state.lastDiscard) return;
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    const exposed = exposeFromDiscard(state, 0, option.n, option.jokersUsed);
    lastHumanDrawKey.current = null;
    setState({ ...exposed, humanExposeOptions: null, canHumanCallMahjong: false });
  }

  // Human declines the call window — AI claims resolve, then play continues.
  function handlePassCallWindow() {
    continueAfterHumanPass(
      { ...state, canHumanCallMahjong: false, humanExposeOptions: null },
      state.lastDiscardBy
    );
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
    tiles: winnerPlayer
      ? [...(winnerPlayer.exposures || []).flatMap(e => e.tiles), ...winnerPlayer.hand]
      : [],
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
            key={state.lastDiscard.uid}
            mode="call"
            lastDiscard={state.lastDiscard}
            discarderName={state.players[state.lastDiscardBy]?.name}
            discarderIdx={state.lastDiscardBy}
            players={state.players}
            toName={state.players[nextIdx].name}
            onContinue={handlePassCallContinue}
            onCallMahjong={handlePassCall}
            getExposeOptions={(idx) => legalExposures(state.players[idx], state.lastDiscard)}
            onExpose={handlePassExpose}
          />
        );
      }
      if (state._passStage !== 'act') {
        return (
          <PassHandoffScreen
            mode="handoff"
            toName={state.players[p].name}
            subtitle={effectiveHandCount(state.players[p]) >= 14 ? (state.players[p].exposures?.length ? 'You called the tile — discard' : 'You open — discard a tile') : 'Your turn — draw and discard'}
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
        onExpose={handleHumanExpose}
        onPassCall={handlePassCallWindow}
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

import { buildWall, shuffle } from '../data/tiles.js';

// American mahjong plays the wall to the last tile — no dead wall.
export const WALL_MIN = 0;

export function createInitialState() {
  return {
    phase: 'home',
    mode: 'solo', // 'solo' (vs AI) | 'pass' (pass-and-play, 4 humans)
    wall: [],
    wallIndex: 0,
    players: [
      { id: 0, name: 'You', isHuman: true, hand: [], exposures: [], score: 0 },
      { id: 1, name: 'South', isHuman: false, hand: [], exposures: [], score: 0 },
      { id: 2, name: 'West', isHuman: false, hand: [], exposures: [], score: 0 },
      { id: 3, name: 'North', isHuman: false, hand: [], exposures: [], score: 0 },
    ],
    currentPlayer: 0,
    discardPile: [],
    lastDiscard: null,
    lastDrawnTile: null,
    charleston: {
      round: 1,
      step: 0,
      pendingPasses: [null, null, null, null],
      done: false,
      secondOffered: false,
    },
    winner: null,
    winningHand: null,
    roundNumber: 1,
    scores: [0, 0, 0, 0],
    gameOver: false,
    lastAction: null,
    calledDiscard: null,
    wallExhausted: false,
    humanCanDeclare: false,
    canHumanCallMahjong: false,
    thinkingPlayer: null,
    waitingForAI: false,
    lastIncomingTiles: null,
    difficulty: 'spicy',
  };
}

export function isWallExhausted(state) {
  return state.wallIndex >= state.wall.length - WALL_MIN;
}

// Draw one tile from wall (without handling flowers)
function drawRaw(wall, wallIndex) {
  if (wallIndex >= wall.length) return { tile: null, wallIndex };
  return { tile: wall[wallIndex], wallIndex: wallIndex + 1 };
}

export function dealTiles(state) {
  const wall = shuffle(buildWall());
  let wallIndex = 0;
  const players = state.players.map(p => ({ ...p, hand: [], exposures: [] }));

  // Deal: players 1-3 get 13, player 0 (East) gets 14. Flowers are ordinary
  // tiles — they stay in hand (real-card rules; F groups count in the 14).
  for (let i = 0; i < 4; i++) {
    const count = i === 0 ? 14 : 13;
    for (let j = 0; j < count; j++) {
      const { tile, wallIndex: wi } = drawRaw(wall, wallIndex);
      wallIndex = wi;
      if (!tile) break;
      players[i].hand.push(tile);
    }
  }

  return {
    ...state,
    gameId: `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    wall,
    wallIndex,
    players,
    phase: 'charleston',
    discardPile: [],
    lastDiscard: null,
    lastDrawnTile: null,
    winner: null,
    winningHand: null,
    wallExhausted: false,
    humanCanDeclare: false,
    canHumanCallMahjong: false,
    lastIncomingTiles: null,
    charleston: {
      round: 1,
      step: 0,
      pendingPasses: [null, null, null, null],
      done: false,
      secondOffered: false,
    },
  };
}

export function drawTile(state, playerIdx) {
  const wall = state.wall;
  let wallIndex = state.wallIndex;
  const player = { ...state.players[playerIdx], hand: [...state.players[playerIdx].hand] };

  let drawnTile = null;
  if (wallIndex < wall.length) {
    drawnTile = wall[wallIndex++];
    player.hand.push(drawnTile);
  }

  const newPlayers = state.players.map((p, i) => i === playerIdx ? player : p);

  return {
    newState: {
      ...state,
      wall,
      wallIndex,
      players: newPlayers,
      lastDrawnTile: drawnTile,
    },
    drawnTile,
  };
}

export function discardTile(state, playerIdx, tileUid) {
  const player = state.players[playerIdx];
  const tileIdx = player.hand.findIndex(t => t.uid === tileUid);
  if (tileIdx === -1) return state;

  const tile = player.hand[tileIdx];
  const newHand = player.hand.filter(t => t.uid !== tileUid);
  const newPlayers = state.players.map((p, i) =>
    i === playerIdx ? { ...p, hand: newHand } : p
  );

  return {
    ...state,
    players: newPlayers,
    discardPile: [...state.discardPile, tile],
    lastDiscard: tile,
    lastDiscardBy: playerIdx,
    lastDrawnTile: null,
    humanCanDeclare: false,
  };
}

export function advanceTurn(state) {
  const next = (state.currentPlayer + 1) % 4;
  return {
    ...state,
    currentPlayer: next,
    canHumanCallMahjong: false,
    lastDrawnTile: null,
  };
}

// ─── Exposures (calling a discard for pung/kong/quint) ──────────────────────

/** Total tiles a player effectively holds: concealed + exposed. */
export function exposedTileCount(player) {
  return (player.exposures || []).reduce((a, e) => a + e.tiles.length, 0);
}

export function effectiveHandCount(player) {
  return player.hand.length + exposedTileCount(player);
}

/**
 * Which meld sizes could this player legally expose on the given discard?
 * Jokers may fill any of the n-1 rack tiles; the minimum joker count is used.
 * @returns {Array<{n:number, jokersUsed:number}>}
 */
const sameClass = (a, b) =>
  a.suit === 'flower' ? b.suit === 'flower' : a.id === b.id;

export function legalExposures(player, tile) {
  if (!tile || tile.suit === 'joker') return [];
  const real = player.hand.filter(t => sameClass(t, tile)).length;
  const jokers = player.hand.filter(t => t.suit === 'joker').length;
  const out = [];
  for (const n of [3, 4, 5]) {
    const need = n - 1;
    const jokersUsed = Math.max(0, need - real);
    if (jokersUsed <= jokers) out.push({ n, jokersUsed });
  }
  return out;
}

/**
 * Claim the last discard as an exposure for `callerIdx`.
 * Removes the discard from the pile, moves n-1 rack tiles (jokers last) into
 * the face-up meld, and makes the caller the current player. The caller does
 * NOT draw — they must now discard.
 */
export function exposeFromDiscard(state, callerIdx, meldSize, jokersUsed = 0) {
  const tile = state.lastDiscard;
  if (!tile) return state;
  const caller = state.players[callerIdx];
  const realNeeded = meldSize - 1 - jokersUsed;

  const meldTiles = [tile];
  const remaining = [...caller.hand];
  let realTaken = 0;
  let jokersTaken = 0;
  for (let i = remaining.length - 1; i >= 0; i--) {
    const t = remaining[i];
    if (realTaken < realNeeded && sameClass(t, tile)) {
      meldTiles.push(t);
      remaining.splice(i, 1);
      realTaken++;
    } else if (jokersTaken < jokersUsed && t.suit === 'joker') {
      meldTiles.push(t);
      remaining.splice(i, 1);
      jokersTaken++;
    }
  }
  if (realTaken !== realNeeded || jokersTaken !== jokersUsed) return state; // illegal claim

  const exposure = { id: tile.suit === 'flower' ? 'flower' : tile.id, tiles: meldTiles };
  const newPlayers = state.players.map((p, i) =>
    i === callerIdx
      ? { ...p, hand: remaining, exposures: [...(p.exposures || []), exposure] }
      : p
  );

  return {
    ...state,
    players: newPlayers,
    discardPile: state.discardPile.filter(t => t.uid !== tile.uid),
    lastDiscard: null,
    calledDiscard: { tile, by: callerIdx, n: meldSize },
    currentPlayer: callerIdx,
    canHumanCallMahjong: false,
    lastDrawnTile: null,
  };
}

/**
 * Apply charleston pass
 * direction: 'right'(→), 'across', 'left'(←)
 * passTiles: array of 4 arrays of tile uids, one per player
 */
export function applyCharlestonPass(state, passTileUids) {
  // passTileUids: [player0UIDs, player1UIDs, player2UIDs, player3UIDs]
  const { charleston } = state;
  const round = charleston.round;
  const step = charleston.step;

  // Determine pass direction
  // Round 1: step0=right(0→1,1→2,2→3,3→0), step1=across(0↔2,1↔3), step2=left(0←1←2←3←0)
  // Round 2: step0=left, step1=across, step2=right
  let directions = [];
  if (round === 1) {
    if (step === 0) directions = [1, 2, 3, 0]; // pass right: player i gives to i+1
    else if (step === 1) directions = [2, 3, 0, 1]; // pass across
    else directions = [3, 0, 1, 2]; // pass left
  } else {
    if (step === 0) directions = [3, 0, 1, 2]; // pass left
    else if (step === 1) directions = [2, 3, 0, 1]; // pass across
    else directions = [1, 2, 3, 0]; // pass right
  }

  // Collect tiles each player is giving
  const givingTiles = passTileUids.map((uids, playerIdx) => {
    const player = state.players[playerIdx];
    return uids.map(uid => player.hand.find(t => t.uid === uid)).filter(Boolean);
  });

  // Build new hands
  const newPlayers = state.players.map((player, playerIdx) => {
    // Remove tiles being passed
    const removedUids = new Set(passTileUids[playerIdx]);
    let newHand = player.hand.filter(t => !removedUids.has(t.uid));

    // Add tiles received from the player passing TO this player
    // directions[i] = who receives from player i
    // So player playerIdx receives from the player where directions[sender] = playerIdx
    for (let sender = 0; sender < 4; sender++) {
      if (directions[sender] === playerIdx) {
        newHand = [...newHand, ...givingTiles[sender]];
      }
    }

    return { ...player, hand: newHand };
  });

  // Track what every seat received (pass-and-play shows each player theirs;
  // solo mode only surfaces player 0's).
  const incomingByPlayer = [[], [], [], []];
  for (let sender = 0; sender < 4; sender++) {
    incomingByPlayer[directions[sender]].push(...givingTiles[sender]);
  }
  const humanReceives = incomingByPlayer[0];

  // Advance step
  let newRound = round;
  let newStep = step + 1;
  let done = false;

  if (newStep > 2) {
    if (round === 1) {
      newRound = 2;
      newStep = 0;
      done = false; // offer second charleston
    } else {
      done = true;
    }
  }

  return {
    ...state,
    players: newPlayers,
    charleston: {
      ...charleston,
      round: newRound,
      step: newStep,
      done,
    },
    lastIncomingTiles: humanReceives,
    incomingByPlayer,
    phase: done ? 'playing' : 'charleston',
  };
}

export function skipSecondCharleston(state) {
  return {
    ...state,
    charleston: { ...state.charleston, done: true },
    phase: 'playing',
  };
}

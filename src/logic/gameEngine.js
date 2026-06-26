import { buildWall, shuffle, isFlower, isJoker } from '../data/tiles.js';

export const WALL_MIN = 14;

export function createInitialState() {
  return {
    phase: 'home',
    wall: [],
    wallIndex: 0,
    players: [
      { id: 0, name: 'You', isHuman: true, hand: [], flowers: [], score: 0 },
      { id: 1, name: 'South', isHuman: false, hand: [], flowers: [], score: 0 },
      { id: 2, name: 'West', isHuman: false, hand: [], flowers: [], score: 0 },
      { id: 3, name: 'North', isHuman: false, hand: [], flowers: [], score: 0 },
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

// Draw a tile for a player, automatically replacing flowers
function drawTileForPlayer(wall, wallIndex, player) {
  let wi = wallIndex;
  const newPlayer = { ...player, hand: [...player.hand], flowers: [...player.flowers] };

  const { tile, wallIndex: wi2 } = drawRaw(wall, wi);
  wi = wi2;
  if (!tile) return { player: newPlayer, wallIndex: wi, drawnTile: null };

  if (isFlower(tile)) {
    newPlayer.flowers.push(tile);
    // Draw replacement
    const res = drawTileForPlayer(wall, wi, newPlayer);
    return res;
  }

  newPlayer.hand.push(tile);
  return { player: newPlayer, wallIndex: wi, drawnTile: tile };
}

export function dealTiles(state) {
  const wall = shuffle(buildWall());
  let wallIndex = 0;
  const players = state.players.map(p => ({ ...p, hand: [], flowers: [] }));

  // Deal: players 1-3 get 13, player 0 (East) gets 14
  for (let i = 0; i < 4; i++) {
    const count = i === 0 ? 14 : 13;
    for (let j = 0; j < count; j++) {
      const { tile, wallIndex: wi } = drawRaw(wall, wallIndex);
      wallIndex = wi;
      if (!tile) break;
      if (isFlower(tile)) {
        players[i].flowers.push(tile);
        j--; // re-draw
      } else {
        players[i].hand.push(tile);
      }
    }
  }

  // Replace flowers (draw replacements for all flowers dealt)
  for (let i = 0; i < 4; i++) {
    // Already handled inline above
  }

  return {
    ...state,
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
  const player = { ...state.players[playerIdx], hand: [...state.players[playerIdx].hand], flowers: [...state.players[playerIdx].flowers] };

  let drawnTile = null;
  let isFlowerDraw = false;

  while (wallIndex < wall.length) {
    const tile = wall[wallIndex++];
    if (isFlower(tile)) {
      player.flowers.push(tile);
      isFlowerDraw = true;
    } else {
      player.hand.push(tile);
      drawnTile = tile;
      break;
    }
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

  // Human receives tiles from whoever passes to them
  const humanReceives = [];
  for (let sender = 0; sender < 4; sender++) {
    if (directions[sender] === 0) {
      humanReceives.push(...givingTiles[sender]);
    }
  }

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

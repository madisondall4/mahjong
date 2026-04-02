import React, { createContext, useContext, useReducer } from 'react';
import { createInitialState } from '../logic/gameEngine.js';

const GameContext = createContext(null);

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.state };
    case 'PATCH_STATE':
      return { ...state, ...action.patch };
    case 'RESET':
      return {
        ...createInitialState(),
        scores: state.scores,
        roundNumber: (state.roundNumber || 1) + 1,
      };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());

  function setState(newState) {
    dispatch({ type: 'SET_STATE', state: newState });
  }

  function patchState(patch) {
    dispatch({ type: 'PATCH_STATE', patch });
  }

  function reset() {
    dispatch({ type: 'RESET' });
  }

  return (
    <GameContext.Provider value={{ state, setState, patchState, reset }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

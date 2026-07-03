import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { createInitialState } from '../logic/gameEngine.js';
import { saveGame } from '../utils/persistence.js';

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
        difficulty: state.difficulty || 'spicy',
      };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
    if (state.phase !== 'home') {
      saveGame(state);
    }
  }, [state]);

  useEffect(() => {
    function onBeforeUnload() {
      if (stateRef.current.phase !== 'home') {
        saveGame(stateRef.current);
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

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

// eslint-disable-next-line react-refresh/only-export-components -- context + hook co-location is intentional
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

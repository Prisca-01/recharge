import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppSettings, Session } from '../types';
import {
  loadSettings, saveSettings,
  loadSessions, saveSession as persistSession, updateSessionMood,
  getTodayStats, computeStreak,
} from '../utils/storage';

interface AppContextState {
  settings: AppSettings;
  sessions: Session[];
  todayCount: number;
  todaySeconds: number;
  streak: number;
}

type AppAction =
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'ADD_SESSION'; payload: Session }
  | { type: 'UPDATE_MOOD'; payload: { id: string; mood: Session['mood']; note?: string } }
  | { type: 'RELOAD' };

interface AppContextValue extends AppContextState {
  updateSettings: (patch: Partial<AppSettings>) => void;
  addSession: (session: Session) => void;
  updateMood: (id: string, mood: Session['mood'], note?: string) => void;
}

function buildState(settings: AppSettings, sessions: Session[]): AppContextState {
  const { count, seconds } = getTodayStats(sessions);
  return {
    settings,
    sessions,
    todayCount: count,
    todaySeconds: seconds,
    streak: computeStreak(sessions),
  };
}

function reducer(state: AppContextState, action: AppAction): AppContextState {
  switch (action.type) {
    case 'UPDATE_SETTINGS': {
      const next = { ...state.settings, ...action.payload };
      saveSettings(next);
      return { ...state, settings: next };
    }
    case 'ADD_SESSION': {
      persistSession(action.payload);
      const sessions = [...state.sessions, action.payload];
      const { count, seconds } = getTodayStats(sessions);
      return {
        ...state,
        sessions,
        todayCount: count,
        todaySeconds: seconds,
        streak: computeStreak(sessions),
      };
    }
    case 'UPDATE_MOOD': {
      updateSessionMood(action.payload.id, action.payload.mood, action.payload.note);
      const sessions = state.sessions.map(s =>
        s.id === action.payload.id
          ? { ...s, mood: action.payload.mood, note: action.payload.note }
          : s
      );
      return { ...state, sessions };
    }
    case 'RELOAD': {
      return buildState(loadSettings(), loadSessions());
    }
    default:
      return state;
  }
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => buildState(loadSettings(), loadSessions())
  );

  // Sync settings to localStorage whenever they change
  useEffect(() => {
    saveSettings(state.settings);
  }, [state.settings]);

  const value: AppContextValue = {
    ...state,
    updateSettings: (patch) => dispatch({ type: 'UPDATE_SETTINGS', payload: patch }),
    addSession: (session) => dispatch({ type: 'ADD_SESSION', payload: session }),
    updateMood: (id, mood, note) => dispatch({ type: 'UPDATE_MOOD', payload: { id, mood, note } }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export type TimerMode = 'focus' | 'break';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'done';
export type MoodRating = 'great' | 'okay' | 'drained';

export interface Session {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime: number; // timestamp
  duration: number;  // seconds actually focused
  mode: 'focus';
  mood?: MoodRating;
  note?: string;
}

export interface DayStats {
  date: string;
  totalFocusSeconds: number;
  sessions: number;
}

export interface AppSettings {
  focusDuration: number;   // minutes
  shortBreak: number;      // minutes
  longBreak: number;       // minutes
  sessionsBeforeLongBreak: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  darkMode: boolean;
  ambientSounds: boolean;
  breakReminders: boolean;
}

export interface AppState {
  settings: AppSettings;
  sessions: Session[];
  todaySessions: number;
  todayFocusSeconds: number;
  currentStreak: number;
  completedSessionsToday: number;
}

export interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  secondsLeft: number;
  totalSeconds: number;
  sessionCount: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  focusDuration: 25,
  shortBreak: 5,
  longBreak: 20,
  sessionsBeforeLongBreak: 4,
  soundEnabled: true,
  notificationsEnabled: true,
  darkMode: true,
  ambientSounds: false,
  breakReminders: true,
};

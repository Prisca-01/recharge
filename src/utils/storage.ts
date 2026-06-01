import type { AppSettings, Session, DayStats } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const KEYS = {
  settings: 'recharge:settings',
  sessions: 'recharge:sessions',
  streak: 'recharge:streak',
} as const;

// ─── Settings ────────────────────────────────────────────────────────────────
export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.settings);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: AppSettings): void {
  localStorage.setItem(KEYS.settings, JSON.stringify(s));
}

// ─── Sessions ────────────────────────────────────────────────────────────────
export function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(KEYS.sessions);
    if (!raw) return [];
    return JSON.parse(raw) as Session[];
  } catch {
    return [];
  }
}

export function saveSession(session: Session): void {
  const sessions = loadSessions();
  sessions.push(session);
  // Keep only last 90 days worth
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const trimmed = sessions.filter(s => s.startTime > cutoff);
  localStorage.setItem(KEYS.sessions, JSON.stringify(trimmed));
}

export function updateSessionMood(id: string, mood: Session['mood'], note?: string): void {
  const sessions = loadSessions();
  const idx = sessions.findIndex(s => s.id === id);
  if (idx >= 0) {
    sessions[idx] = { ...sessions[idx], mood, note };
    localStorage.setItem(KEYS.sessions, JSON.stringify(sessions));
  }
}

// ─── Computed stats ──────────────────────────────────────────────────────────
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getTodayStats(sessions: Session[]): { count: number; seconds: number } {
  const today = getTodayString();
  const todays = sessions.filter(s => s.date === today);
  return {
    count: todays.length,
    seconds: todays.reduce((acc, s) => acc + s.duration, 0),
  };
}

export function getWeeklyStats(sessions: Session[]): DayStats[] {
  const days: DayStats[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split('T')[0];
    const daySessions = sessions.filter(s => s.date === date);
    days.push({
      date,
      totalFocusSeconds: daySessions.reduce((acc, s) => acc + s.duration, 0),
      sessions: daySessions.length,
    });
  }
  return days;
}

export function computeStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
  const today = getTodayString();
  let streak = 0;
  let cursor = new Date(today);
  for (const date of dates) {
    const cursorStr = cursor.toISOString().split('T')[0];
    if (date === cursorStr) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (date < cursorStr) {
      break;
    }
  }
  return streak;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
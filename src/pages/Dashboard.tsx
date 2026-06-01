import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useTimer } from '../hooks/useTimer';
import { ProgressRing } from '../components/ProgressRing/ProgressRing';
import { StatCard } from '../components/StatCard/StatCard';
import { BreakScreen } from '../components/BreakScreen/BreakScreen';
import { MoodModal } from '../components/MoodModal/MoodModal';
import { formatTime, formatDuration, generateId, getTodayString } from '../utils/storage';
import { playSessionComplete, playBreakComplete, sendNotification, requestNotificationPermission } from '../utils/sound';
import type { Session, MoodRating } from '../types';
import './Dashboard.css';

const FOCUS_OPTIONS = [25, 45, 60];
const BREAK_OPTIONS = [5, 10, 15];

const TimerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9.5 3h5"/>
  </svg>
);
const FlameIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ResetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
  </svg>
);
const SkipIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
  </svg>
);

export default function Dashboard() {
  const { settings, todayCount, todaySeconds, streak, addSession, updateMood } = useApp();
  const [pendingSession, setPendingSession] = useState<Session | null>(null);
  const [showMood, setShowMood] = useState(false);
  const [customFocus, setCustomFocus] = useState<number | null>(null);
  const [customBreak, setCustomBreak] = useState<number | null>(null);
  const [focusOption, setFocusOption] = useState<number>(settings.focusDuration);
  const [breakOption, setBreakOption] = useState<number>(settings.shortBreak);

  const effectiveFocus = customFocus ?? focusOption;
  const effectiveBreak = customBreak ?? breakOption;

  const handleFocusComplete = useCallback((secondsFocused: number) => {
    const session: Session = {
      id: generateId(),
      date: getTodayString(),
      startTime: Date.now() - secondsFocused * 1000,
      duration: secondsFocused,
      mode: 'focus',
    };
    addSession(session);
    setPendingSession(session);
    setShowMood(true);

    if (settings.soundEnabled) playSessionComplete();
    if (settings.notificationsEnabled) {
      requestNotificationPermission().then(() => {
        sendNotification('Focus session complete! 🎉', 'Great work. Time for a break.');
      });
    }
  }, [settings, addSession]);

  const handleBreakComplete = useCallback(() => {
    if (settings.soundEnabled) playBreakComplete();
    if (settings.notificationsEnabled) {
      sendNotification('Break over!', 'Ready to get back into focus?');
    }
  }, [settings]);

  const timer = useTimer({
    focusMinutes: effectiveFocus,
    breakMinutes: effectiveBreak,
    onFocusComplete: handleFocusComplete,
    onBreakComplete: handleBreakComplete,
    soundEnabled: settings.soundEnabled,
  });

  const handleMoodSave = (mood: MoodRating, note: string) => {
    if (pendingSession) updateMood(pendingSession.id, mood, note);
    setPendingSession(null);
    setShowMood(false);
  };
  const handleMoodSkip = () => {
    setPendingSession(null);
    setShowMood(false);
  };

  const isOverworked = todaySeconds >= 3 * 3600;

  // Break mode — show break screen
  if (timer.mode === 'break' && timer.status === 'running') {
    return (
      <>
        <BreakScreen
          secondsLeft={timer.secondsLeft}
          totalSeconds={timer.totalSeconds}
          breakMinutes={effectiveBreak}
          onSkip={timer.skipBreak}
        />
        {showMood && pendingSession && (
          <MoodModal
            sessionId={pendingSession.id}
            sessionMinutes={Math.round(pendingSession.duration / 60)}
            sessionNumber={todayCount}
            onSave={handleMoodSave}
            onSkip={handleMoodSkip}
          />
        )}
      </>
    );
  }

  const isRunning = timer.status === 'running';
  const isPaused = timer.status === 'paused';

  return (
    <div className="dashboard fade-in">
      <div className="page-glow" />

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">Good {getGreeting()}</h1>
          {streak > 0 && (
            <p className="dashboard-streak">
              You're on a <strong>{streak}-day streak.</strong> Keep it up!
            </p>
          )}
        </div>
        {isRunning && (
          <div className="focus-status-badge">
            <span className="pulse-dot" />
            Focus mode active
          </div>
        )}
      </div>

      {isOverworked && (
        <div className="overwork-warning fade-in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          You've focused for over 3 hours today. Consider taking a longer break to avoid burnout.
        </div>
      )}

      <div className="dashboard-body">
        {/* Timer section */}
        <div className="timer-section">
          {/* Duration selectors */}
          <div className="duration-selectors">
            <div className="duration-group">
              <span className="duration-group-label">FOCUS</span>
              <div className="duration-pills">
                {FOCUS_OPTIONS.map(m => (
                  <button
                    key={m}
                    className={`duration-pill ${focusOption === m && !customFocus ? 'active' : ''}`}
                    onClick={() => { setFocusOption(m); setCustomFocus(null); timer.reset(); }}
                    disabled={isRunning}
                  >{m}m</button>
                ))}
                <input
                  type="number"
                  className={`duration-custom ${customFocus ? 'active' : ''}`}
                  placeholder="Custom"
                  min={1} max={180}
                  value={customFocus ?? ''}
                  onChange={e => { const v = parseInt(e.target.value); if (v > 0) { setCustomFocus(v); timer.reset(); } else setCustomFocus(null); }}
                  disabled={isRunning}
                />
              </div>
            </div>
            <div className="duration-group">
              <span className="duration-group-label">BREAK</span>
              <div className="duration-pills">
                {BREAK_OPTIONS.map(m => (
                  <button
                    key={m}
                    className={`duration-pill ${breakOption === m && !customBreak ? 'active' : ''}`}
                    onClick={() => { setBreakOption(m); setCustomBreak(null); }}
                    disabled={isRunning}
                  >{m}m</button>
                ))}
                <input
                  type="number"
                  className={`duration-custom ${customBreak ? 'active' : ''}`}
                  placeholder="Custom"
                  min={1} max={60}
                  value={customBreak ?? ''}
                  onChange={e => { const v = parseInt(e.target.value); if (v > 0) setCustomBreak(v); else setCustomBreak(null); }}
                  disabled={isRunning}
                />
              </div>
            </div>
          </div>

          {/* Timer ring */}
          <div className="timer-ring-wrap">
            <ProgressRing progress={timer.progress} size={280} strokeWidth={6} mode={timer.mode}>
              <div className="timer-inner">
                <span className="timer-mode-label">Focus Session</span>
                <span className="timer-digits">{formatTime(timer.secondsLeft)}</span>
                <span className="timer-sub">
                  {isRunning ? 'Deep work in progress' : isPaused ? 'Paused' : 'Ready to focus'}
                </span>
              </div>
            </ProgressRing>
          </div>

          {/* Controls */}
          <div className="timer-controls">
            <button
              className="ctrl-btn ctrl-secondary"
              onClick={timer.reset}
              aria-label="Reset"
              title="Reset"
            >
              <ResetIcon />
            </button>

            {isRunning ? (
              <button className="ctrl-btn ctrl-primary" onClick={timer.pause}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
                Pause
              </button>
            ) : (
              <button className="ctrl-btn ctrl-primary" onClick={timer.start}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                {isPaused ? 'Resume' : 'Start Focus'}
              </button>
            )}

            <button
              className="ctrl-btn ctrl-secondary"
              onClick={timer.skipBreak}
              aria-label="Skip"
              title="Skip to next"
              disabled={timer.status === 'idle'}
            >
              <SkipIcon />
            </button>
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="dashboard-sidebar">
          <div className="stat-cards-grid">
            <StatCard
              icon={<FlameIcon />}
              value={String(streak)}
              label="Day streak"
              badge={streak > 0 ? `${streak}🔥` : undefined}
              badgeVariant="positive"
            />
            <StatCard
              icon={<TimerIcon />}
              value={formatDuration(todaySeconds)}
              label="Focus today"
              badge={todaySeconds > 0 ? '+' + Math.round(todaySeconds / 60) + 'm' : undefined}
              badgeVariant="positive"
            />
            <StatCard
              icon={<CheckIcon />}
              value={String(todayCount)}
              label="Sessions done"
            />
          </div>

          <div className="next-break-card card">
            <h3 className="next-break-title">Next Break</h3>
            <div className="next-break-bar">
              <div
                className="next-break-fill"
                style={{ width: isRunning ? `${timer.progress * 100}%` : '0%' }}
              />
            </div>
            <span className="next-break-meta">
              {isRunning
                ? `~${Math.ceil(timer.secondsLeft / 60)}m away`
                : `${effectiveBreak}m break after focus`}
            </span>
          </div>

          <div className="focus-tip card">
            <h3 className="focus-tip-title">Focus Tip</h3>
            <p className="focus-tip-text">{TIPS[timer.sessionCount % TIPS.length]}</p>
          </div>
        </div>
      </div>

      {showMood && pendingSession && (
        <MoodModal
          sessionId={pendingSession.id}
          sessionMinutes={Math.round(pendingSession.duration / 60)}
          sessionNumber={todayCount}
          onSave={handleMoodSave}
          onSkip={handleMoodSkip}
        />
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const TIPS = [
  'Working in 25-min sprints improves retention by 40% compared to marathon sessions.',
  'Close unused tabs before starting a focus session to reduce cognitive load.',
  'Your best focus hours are typically 90 minutes after waking up.',
  'Put your phone face-down or in another room to cut distractions by 60%.',
  'A brief walk during breaks boosts creative thinking by up to 81%.',
  'Hydration directly affects focus. Keep water within reach.',
];

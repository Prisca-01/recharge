import { useState } from 'react';
import type { MoodRating } from '../../types';
import './MoodModal.css';

interface MoodModalProps {
  sessionId: string;
  sessionMinutes: number;
  sessionNumber: number;
  todayMinutes: number;      // pass from context so coach has full picture
  onSave: (mood: MoodRating, note: string) => void;
  onSkip: () => void;
}

const moods: { value: MoodRating; emoji: string; label: string }[] = [
  { value: 'great',   emoji: '✨', label: 'Great' },
  { value: 'okay',    emoji: '😌', label: 'Okay' },
  { value: 'drained', emoji: '😮‍💨', label: 'Drained' },
];

type Screen = 'form' | 'loading' | 'coach';

export function MoodModal({
  sessionMinutes,
  sessionNumber,
  todayMinutes,
  onSave,
  onSkip,
}: MoodModalProps) {
  const [selected, setSelected]     = useState<MoodRating | null>(null);
  const [note, setNote]             = useState('');
  const [screen, setScreen]         = useState<Screen>('form');
  const [coachMessage, setCoachMessage] = useState('');
  const [coachError, setCoachError] = useState(false);

  const handleSave = async () => {
    if (!selected) return;

    // 1. Persist the session data immediately
    onSave(selected, note);

    // 2. Switch to loading screen and fetch coach message
    setScreen('loading');

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionDuration: sessionMinutes,
          sessionCount: sessionNumber,
          todayMinutes,
          mood: selected,
        }),
      });

      if (!res.ok) throw new Error('Non-200 response');

      const data = await res.json();
      setCoachMessage(data.message ?? '');
      setScreen('coach');
    } catch {
      setCoachError(true);
      setScreen('coach');
    }
  };

  const ordinal = (n: number) => {
    if (n === 1) return '1st';
    if (n === 2) return '2nd';
    if (n === 3) return '3rd';
    return `${n}th`;
  };

  return (
    <div className="mood-overlay">
      <div className="mood-modal scale-in">

        {/* ── FORM SCREEN ── */}
        {screen === 'form' && (
          <>
            <button className="mood-close" onClick={onSkip} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            <div className="mood-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.75">
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  fill="var(--color-primary)" stroke="none"
                />
              </svg>
            </div>

            <h2 className="mood-title">Session Complete!</h2>
            <p className="mood-meta">
              {sessionMinutes} min · Deep work · {ordinal(sessionNumber)} session today
            </p>

            <div className="mood-question">HOW ARE YOU FEELING?</div>

            <div className="mood-options">
              {moods.map(m => (
                <button
                  key={m.value}
                  className={`mood-option ${selected === m.value ? 'selected' : ''}`}
                  onClick={() => setSelected(m.value)}
                >
                  <span className="mood-emoji">{m.emoji}</span>
                  <span className="mood-label">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="mood-note-section">
              <label className="mood-note-label">OPTIONAL NOTE</label>
              <textarea
                className="mood-note-input"
                placeholder="How did the session go? Any distractions?"
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className="mood-actions">
              <button className="mood-skip-btn" onClick={onSkip}>Skip</button>
              <button
                className={`mood-save-btn ${selected ? 'enabled' : ''}`}
                onClick={handleSave}
                disabled={!selected}
              >
                Save &amp; Continue
              </button>
            </div>
          </>
        )}

        {/* ── LOADING SCREEN ── */}
        {screen === 'loading' && (
          <div className="coach-loading">
            <div className="coach-spinner" />
            <p className="coach-loading-text">Your coach is thinking…</p>
          </div>
        )}

        {/* ── COACH MESSAGE SCREEN ── */}
        {screen === 'coach' && (
          <div className="coach-screen scale-in">
            <div className="coach-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.75">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                  fill="var(--color-primary)" stroke="none"/>
              </svg>
            </div>

            <p className="coach-eyebrow">FOCUS COACH</p>
            <h2 className="coach-title">
              {coachError ? 'Keep it up!' : 'Here\'s your insight'}
            </h2>

            <div className="coach-message-bubble">
              {coachError
                ? "Coach is unavailable right now, but you just completed a solid session. Take a proper break — you've earned it."
                : coachMessage}
            </div>

            <button className="mood-save-btn enabled coach-cta" onClick={onSkip}>
              Start Break →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
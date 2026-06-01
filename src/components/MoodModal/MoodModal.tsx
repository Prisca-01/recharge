import { useState } from 'react';
import type { MoodRating } from '../../types';
import './MoodModal.css';

interface MoodModalProps {
  sessionId: string;
  sessionMinutes: number;
  sessionNumber: number;
  onSave: (mood: MoodRating, note: string) => void;
  onSkip: () => void;
}

const moods: { value: MoodRating; emoji: string; label: string }[] = [
  { value: 'great', emoji: '✨', label: 'Great' },
  { value: 'okay',  emoji: '😌', label: 'Okay' },
  { value: 'drained', emoji: '😮‍💨', label: 'Drained' },
];

export function MoodModal({ sessionMinutes, sessionNumber, onSave, onSkip }: MoodModalProps) {
  const [selected, setSelected] = useState<MoodRating | null>(null);
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (!selected) return;
    onSave(selected, note);
  };

  return (
    <div className="mood-overlay">
      <div className="mood-modal scale-in">
        <button className="mood-close" onClick={onSkip} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <div className="mood-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="var(--color-primary)" stroke="none"/>
          </svg>
        </div>

        <h2 className="mood-title">Session Complete!</h2>
        <p className="mood-meta">
          {sessionMinutes} min · Deep work · {sessionNumber}{sessionNumber === 1 ? 'st' : sessionNumber === 2 ? 'nd' : sessionNumber === 3 ? 'rd' : 'th'} session today
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
      </div>
    </div>
  );
}

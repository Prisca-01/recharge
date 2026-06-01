import { formatTime } from '../../utils/storage';
import './BreakScreen.css';

interface BreakScreenProps {
  secondsLeft: number;
  totalSeconds: number;
  breakMinutes: number;
  onSkip: () => void;
}

export function BreakScreen({ secondsLeft, totalSeconds, breakMinutes, onSkip }: BreakScreenProps) {
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 1;
  const barWidth = `${(1 - progress) * 100}%`;

  return (
    <div className="break-screen fade-in">
      <div className="break-badge badge badge-break">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
          <path d="M12 8v4l3 3"/>
        </svg>
        Break time
      </div>

      <h1 className="break-heading">
        Time to <span className="break-heading-accent">Recharge</span>
      </h1>
      <p className="break-subtext">Step away, breathe, and let your mind rest.</p>

      <div className="break-timer-circle">
        <div className="break-timer-label">BREAK ENDS IN</div>
        <div className="break-timer-time">{formatTime(secondsLeft)}</div>
        <div className="break-timer-meta">of {breakMinutes} min break</div>
      </div>

      <div className="break-progress-bar">
        <div className="break-progress-fill" style={{ width: barWidth }} />
      </div>

      <div className="break-tip card">
        <div className="break-tip-title">Try a breathing exercise</div>
        <div className="break-tip-text">Inhale 4s · Hold 4s · Exhale 6s</div>
      </div>

      <button className="break-skip" onClick={onSkip}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="5 4 15 12 5 20 5 4"/>
          <line x1="19" y1="5" x2="19" y2="19"/>
        </svg>
        Skip break
      </button>
    </div>
  );
}

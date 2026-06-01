import './ProgressRing.css';

interface ProgressRingProps {
  progress: number;      // 0–1
  size?: number;
  strokeWidth?: number;
  mode?: 'focus' | 'break';
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 280,
  strokeWidth = 6,
  mode = 'focus',
  children,
}: ProgressRingProps) {
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  return (
    <div className="progress-ring-container" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="progress-ring-svg"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--color-surface-overlay)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={mode === 'focus' ? 'var(--color-primary)' : 'var(--color-break)'}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="progress-ring-arc"
          style={{
            filter: mode === 'focus'
              ? 'drop-shadow(0 0 8px rgba(139,92,246,0.5))'
              : 'drop-shadow(0 0 8px rgba(45,212,191,0.5))',
          }}
        />
      </svg>
      <div className="progress-ring-content">
        {children}
      </div>
    </div>
  );
}

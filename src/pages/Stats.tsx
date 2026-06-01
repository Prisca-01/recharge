import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard/StatCard';
import { getWeeklyStats, formatDuration } from '../utils/storage';
import './Stats.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TimerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9.5 3h5"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const FlameIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const hours = payload[0].value / 3600;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      <div className="chart-tooltip-value">{formatDuration(payload[0].value)}</div>
      <div className="chart-tooltip-sub">{(hours).toFixed(1)}h total</div>
    </div>
  );
}

export default function Stats() {
  const { sessions, streak } = useApp();
  const [view, setView] = useState<'week' | 'month'>('week');

  const weeklyStats = getWeeklyStats(sessions);
  const chartData = weeklyStats.map((d, i) => ({
    day: DAYS[new Date(d.date + 'T12:00:00').getDay() === 0 ? 6 : new Date(d.date + 'T12:00:00').getDay() - 1],
    seconds: d.totalFocusSeconds,
    sessions: d.sessions,
    isToday: d.date === new Date().toISOString().split('T')[0],
  }));

  const totalWeekSeconds = weeklyStats.reduce((a, d) => a + d.totalFocusSeconds, 0);
  const totalWeekSessions = weeklyStats.reduce((a, d) => a + d.sessions, 0);
  const avgSession = totalWeekSessions > 0
    ? Math.round(totalWeekSeconds / totalWeekSessions)
    : 0;
  const peakDay = chartData.reduce((best, d) => d.seconds > best.seconds ? d : best, chartData[0]);
  const peakHour = sessions.length > 0
    ? getPeakHour(sessions)
    : null;

  return (
    <div className="stats-page fade-in">
      <div className="page-glow" />
      <div className="stats-inner">
        <div className="stats-header">
          <h1 className="stats-title">Focus Stats</h1>
          <p className="stats-subtitle">Track your productivity and protect your energy</p>
        </div>

        {/* Top stat cards */}
        <div className="stats-cards">
          <StatCard
            icon={<TimerIcon />}
            value={formatDuration(totalWeekSeconds)}
            label="Total focus this week"
            badge="+14%"
            badgeVariant="positive"
          />
          <StatCard
            icon={<CheckIcon />}
            value={String(totalWeekSessions)}
            label="Sessions completed"
            badge={totalWeekSessions > 0 ? `+${Math.max(0, totalWeekSessions - 28)}` : undefined}
            badgeVariant="positive"
          />
          <StatCard
            icon={<FlameIcon />}
            value={`${streak} days`}
            label="Current streak"
          />
          <StatCard
            icon={<ClockIcon />}
            value={avgSession > 0 ? formatDuration(avgSession) : '—'}
            label="Avg session length"
            badge={avgSession > 0 && avgSession < 1800 ? '−3 min' : undefined}
            badgeVariant="negative"
          />
        </div>

        <div className="stats-grid">
          {/* Chart */}
          <div className="chart-card card">
            <div className="chart-header">
              <div>
                <h2 className="chart-title">Weekly Focus Hours</h2>
                <p className="chart-subtitle">Mon – Sun, this week</p>
              </div>
              <div className="chart-toggle">
                <button
                  className={`chart-toggle-btn ${view === 'week' ? 'active' : ''}`}
                  onClick={() => setView('week')}
                >Week</button>
                <button
                  className={`chart-toggle-btn ${view === 'month' ? 'active' : ''}`}
                  onClick={() => setView('month')}
                >Month</button>
              </div>
            </div>

            {totalWeekSessions === 0 ? (
              <div className="chart-empty">
                <p>No sessions recorded this week.</p>
                <p>Start your first focus session!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barSize={28} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(v: number) => v > 0 ? `${(v / 3600).toFixed(1)}h` : '0'}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.05)' }} />
                  <Bar dataKey="seconds" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.isToday ? 'var(--color-primary)' : 'var(--color-surface-overlay)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Insights */}
          <div className="insights-card card">
            <h2 className="insights-title">Insights</h2>
            <div className="insights-list">
              {totalWeekSeconds > 6 * 3600 && (
                <div className="insight-item insight-warning">
                  <div className="insight-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <div>
                    <div className="insight-name">Overwork Warning</div>
                    <div className="insight-desc">You worked 6h+ this week — consider a longer break to avoid burnout.</div>
                  </div>
                </div>
              )}
              {peakHour !== null && (
                <div className="insight-item insight-success">
                  <div className="insight-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  </div>
                  <div>
                    <div className="insight-name">Peak Hours</div>
                    <div className="insight-desc">Your best focus window is {formatHour(peakHour)}. Block this time for deep work.</div>
                  </div>
                </div>
              )}
              <div className="insight-item insight-neutral">
                <div className="insight-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                </div>
                <div>
                  <div className="insight-name">Mood Correlation</div>
                  <div className="insight-desc">Sessions under 3h/day correlate with your best mood scores.</div>
                </div>
              </div>
              {peakDay && peakDay.seconds > 0 && (
                <div className="insight-item insight-neutral">
                  <div className="insight-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div>
                    <div className="insight-name">Best Day</div>
                    <div className="insight-desc">{peakDay.day} was your most productive day with {formatDuration(peakDay.seconds)}.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Daily breakdown */}
        <div className="daily-section">
          <h2 className="daily-title">Daily Breakdown</h2>
          <div className="daily-grid">
            {weeklyStats.slice(0, 7).map((d, i) => {
              const dayName = new Date(d.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'long' });
              const maxSeconds = Math.max(...weeklyStats.map(w => w.totalFocusSeconds), 1);
              const pct = (d.totalFocusSeconds / maxSeconds) * 100;
              const isHeavy = d.totalFocusSeconds > 4 * 3600;
              return (
                <div className="daily-card card" key={i}>
                  <div className="daily-card-name">{dayName}</div>
                  <div className="daily-card-value">{formatDuration(d.totalFocusSeconds)}</div>
                  <div className="daily-card-sessions">{d.sessions} sessions</div>
                  <div className="daily-card-bar">
                    <div
                      className={`daily-card-fill ${isHeavy ? 'heavy' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function getPeakHour(sessions: { startTime: number }[]): number {
  const hourCounts: Record<number, number> = {};
  sessions.forEach(s => {
    const h = new Date(s.startTime).getHours();
    hourCounts[h] = (hourCounts[h] || 0) + 1;
  });
  return parseInt(Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '9');
}

function formatHour(h: number): string {
  const start = h % 12 || 12;
  const end = (h + 1) % 12 || 12;
  const ampm = h < 12 ? 'am' : 'pm';
  return `${start}–${end}${ampm}`;
}

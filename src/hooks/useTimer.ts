import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimerMode, TimerStatus } from '../types';
import { formatTime } from '../utils/storage';

interface UseTimerOptions {
  focusMinutes: number;
  breakMinutes: number;
  onFocusComplete: (secondsFocused: number) => void;
  onBreakComplete: () => void;
  soundEnabled: boolean;
}

interface UseTimerReturn {
  mode: TimerMode;
  status: TimerStatus;
  secondsLeft: number;
  totalSeconds: number;
  sessionCount: number;
  progress: number; // 0–1
  start: () => void;
  pause: () => void;
  reset: () => void;
  skipBreak: () => void;
  setFocusDuration: (minutes: number) => void;
  setBreakDuration: (minutes: number) => void;
}

export function useTimer({
  focusMinutes,
  breakMinutes,
  onFocusComplete,
  onBreakComplete,
  soundEnabled,
}: UseTimerOptions): UseTimerReturn {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [focusDur, setFocusDur] = useState(focusMinutes * 60);
  const [breakDur, setBreakDur] = useState(breakMinutes * 60);
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60);
  const [totalSeconds, setTotalSeconds] = useState(focusMinutes * 60);
  const [sessionCount, setSessionCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const focusStartSecondsRef = useRef<number>(0);

  // Tab title update
  useEffect(() => {
    if (status === 'running') {
      const label = mode === 'focus' ? 'Focus' : 'Break';
      document.title = `${formatTime(secondsLeft)} · ${label} | Recharge`;
    } else {
      document.title = 'Recharge';
    }
  }, [secondsLeft, status, mode]);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleComplete = useCallback(() => {
    clearTimer();
    setStatus('done');

    if (mode === 'focus') {
      const elapsed = focusStartSecondsRef.current - secondsLeft;
      onFocusComplete(elapsed > 0 ? elapsed : focusDur);
      setSessionCount(c => c + 1);
      // Transition to break
      setTimeout(() => {
        setMode('break');
        setSecondsLeft(breakDur);
        setTotalSeconds(breakDur);
        setStatus('running');
        startInterval(breakDur, 'break');
      }, 300);
    } else {
      onBreakComplete();
      setMode('focus');
      setSecondsLeft(focusDur);
      setTotalSeconds(focusDur);
      setStatus('idle');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, focusDur, breakDur, secondsLeft, soundEnabled]);

  const startInterval = useCallback((startSeconds: number, currentMode: TimerMode) => {
    clearTimer();
    let remaining = startSeconds;
    startTimeRef.current = Date.now();
    if (currentMode === 'focus') focusStartSecondsRef.current = startSeconds;

    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearTimer();
        setStatus('done');
        if (currentMode === 'focus') {
          onFocusComplete(startSeconds);
          setSessionCount(c => c + 1);
          setTimeout(() => {
            setMode('break');
            setSecondsLeft(breakDur);
            setTotalSeconds(breakDur);
            setStatus('running');
            startInterval(breakDur, 'break');
          }, 300);
        } else {
          onBreakComplete();
          setMode('focus');
          setSecondsLeft(focusDur);
          setTotalSeconds(focusDur);
          setStatus('idle');
        }
      }
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusDur, breakDur]);

  const start = useCallback(() => {
    if (status === 'running') return;
    setStatus('running');
    startInterval(secondsLeft, mode);
  }, [status, secondsLeft, mode, startInterval]);

  const pause = useCallback(() => {
    if (status !== 'running') return;
    clearTimer();
    setStatus('paused');
  }, [status]);

  const reset = useCallback(() => {
    clearTimer();
    setMode('focus');
    setStatus('idle');
    setSecondsLeft(focusDur);
    setTotalSeconds(focusDur);
  }, [focusDur]);

  const skipBreak = useCallback(() => {
    clearTimer();
    setMode('focus');
    setStatus('idle');
    setSecondsLeft(focusDur);
    setTotalSeconds(focusDur);
  }, [focusDur]);

  const setFocusDuration = useCallback((minutes: number) => {
    const secs = minutes * 60;
    setFocusDur(secs);
    if (mode === 'focus' && status === 'idle') {
      setSecondsLeft(secs);
      setTotalSeconds(secs);
    }
  }, [mode, status]);

  const setBreakDuration = useCallback((minutes: number) => {
    const secs = minutes * 60;
    setBreakDur(secs);
    if (mode === 'break' && status === 'idle') {
      setSecondsLeft(secs);
      setTotalSeconds(secs);
    }
  }, [mode, status]);

  // Sync when props change externally
  useEffect(() => {
    if (status === 'idle') {
      const secs = focusMinutes * 60;
      setFocusDur(secs);
      setSecondsLeft(secs);
      setTotalSeconds(secs);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMinutes]);

  useEffect(() => {
    setBreakDur(breakMinutes * 60);
  }, [breakMinutes]);

  useEffect(() => () => clearTimer(), []);

  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;

  return {
    mode, status, secondsLeft, totalSeconds, sessionCount, progress,
    start, pause, reset, skipBreak, setFocusDuration, setBreakDuration,
  };
}

'use client';

import { useState, useEffect } from 'react';

interface TimerState {
  startedAt: number | null;
  durationMs: number | null;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Separate component keyed by startedAt so React remounts it on each new timer,
// resetting localRemaining to null without any synchronous setState in effects.
function CountdownDisplay({
  startedAt,
  durationMs,
  onReset,
}: {
  startedAt: number;
  durationMs: number;
  onReset: () => void;
}) {
  const [localRemaining, setLocalRemaining] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setLocalRemaining(durationMs - (Date.now() - startedAt));
    }, 250);
    return () => clearInterval(id);
  }, [startedAt, durationMs]);

  const isExpired = localRemaining !== null && localRemaining <= 0;

  if (isExpired) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="text-4xl font-bold text-red-500 animate-pulse">⏰ Time&apos;s up!</div>
        <button
          onClick={onReset}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium"
        >
          Reset
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="text-6xl font-mono tabular-nums font-bold tracking-tight">
        {localRemaining !== null ? formatTime(localRemaining) : '--:--'}
      </div>
      <button
        onClick={onReset}
        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium"
      >
        Reset
      </button>
    </div>
  );
}

export function CountdownTimer() {
  const [timerState, setTimerState] = useState<TimerState>({ startedAt: null, durationMs: null });
  const [showForm, setShowForm] = useState(false);
  const [inputMinutes, setInputMinutes] = useState('');
  const [inputSeconds, setInputSeconds] = useState('');
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch('/api/countdown-timer');
        const data = (await res.json()) as TimerState;
        setTimerState(data);
      } catch {
        // network error, keep current state
      }
    }
    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, []);

  async function handleStart() {
    const mins = parseInt(inputMinutes || '0', 10);
    const secs = parseInt(inputSeconds || '0', 10);

    if (isNaN(mins) || isNaN(secs) || mins < 0 || mins > 99 || secs < 0 || secs > 59) {
      setInputError('Enter a valid time (0–99 minutes, 0–59 seconds).');
      return;
    }
    const durationMs = (mins * 60 + secs) * 1000;
    if (durationMs < 1000) {
      setInputError('Duration must be at least 1 second.');
      return;
    }

    try {
      const res = await fetch('/api/countdown-timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMs }),
      });
      const data = (await res.json()) as TimerState;
      setTimerState(data);
      setShowForm(false);
      setInputMinutes('');
      setInputSeconds('');
      setInputError('');
    } catch {
      setInputError('Failed to start timer. Please try again.');
    }
  }

  async function handleReset() {
    try {
      const res = await fetch('/api/countdown-timer', { method: 'DELETE' });
      const data = (await res.json()) as TimerState;
      setTimerState(data);
    } catch {
      // ignore
    }
  }

  if (timerState.startedAt !== null && timerState.durationMs !== null) {
    return (
      <CountdownDisplay
        key={timerState.startedAt}
        startedAt={timerState.startedAt}
        durationMs={timerState.durationMs}
        onReset={handleReset}
      />
    );
  }

  if (showForm) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={99}
            value={inputMinutes}
            onChange={(e) => setInputMinutes(e.target.value)}
            placeholder="MM"
            className="w-16 border rounded px-2 py-1 text-center font-mono text-lg"
            aria-label="Minutes"
          />
          <span className="text-xl font-mono font-bold">:</span>
          <input
            type="number"
            min={0}
            max={59}
            value={inputSeconds}
            onChange={(e) => setInputSeconds(e.target.value)}
            placeholder="SS"
            className="w-16 border rounded px-2 py-1 text-center font-mono text-lg"
            aria-label="Seconds"
          />
        </div>
        {inputError && <p className="text-red-500 text-sm">{inputError}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleStart}
            className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium"
          >
            Start
          </button>
          <button
            onClick={() => {
              setShowForm(false);
              setInputError('');
            }}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-6">
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium"
      >
        + Countdown
      </button>
    </div>
  );
}

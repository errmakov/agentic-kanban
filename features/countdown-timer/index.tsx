'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

type CountdownState = {
  status: 'idle' | 'running' | 'done';
  durationSeconds: number;
  startedAt: number;
};

const IDLE: CountdownState = { status: 'idle', durationSeconds: 0, startedAt: 0 };

export function formatMMSS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function remainingFrom(state: CountdownState): number {
  return state.durationSeconds - Math.floor((Date.now() - state.startedAt) / 1000);
}

export function CountdownTimer() {
  const [serverState, setServerState] = useState<CountdownState>(IDLE);
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [inputMinutes, setInputMinutes] = useState('05');
  const [inputSeconds, setInputSeconds] = useState('00');

  const applyState = useCallback((state: CountdownState) => {
    setServerState(state);
    if (state.status === 'running') {
      setDisplaySeconds(Math.max(0, remainingFrom(state)));
    } else if (state.status === 'done') {
      setDisplaySeconds(0);
    }
  }, []);

  // Poll the shared state every 5s to pick up other visitors' changes.
  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch('/api/countdown');
        if (!res.ok) return;
        const state: CountdownState = await res.json();
        if (active) applyState(state);
      } catch {
        // ignore transient network errors; next poll retries
      }
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [applyState]);

  // Smooth local tick while running; recomputes from the server start timestamp.
  useEffect(() => {
    if (serverState.status !== 'running') return;
    const tick = () => {
      const remaining = remainingFrom(serverState);
      if (remaining <= 0) {
        setDisplaySeconds(0);
        setServerState((prev) =>
          prev.status === 'running' ? { ...prev, status: 'done' } : prev,
        );
      } else {
        setDisplaySeconds(remaining);
      }
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [serverState]);

  const minutesNum = Number(inputMinutes) || 0;
  const secondsNum = Number(inputSeconds) || 0;
  const totalSeconds = minutesNum * 60 + secondsNum;

  const start = async () => {
    if (totalSeconds < 1) return;
    const res = await fetch('/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', durationSeconds: totalSeconds }),
    });
    if (!res.ok) return;
    const state: CountdownState = await res.json();
    applyState(state);
    setShowForm(false);
  };

  const reset = async (reopenForm: boolean) => {
    const res = await fetch('/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    });
    if (!res.ok) return;
    const state: CountdownState = await res.json();
    applyState(state);
    setShowForm(reopenForm);
  };

  if (serverState.status === 'running') {
    return (
      <section className="flex flex-col items-center gap-3 py-6" aria-label="Shared countdown">
        <span
          className="font-mono text-6xl font-bold tabular-nums"
          aria-live="polite"
        >
          {formatMMSS(displaySeconds)}
        </span>
        <button
          type="button"
          onClick={() => reset(false)}
          className="text-sm text-[var(--muted)] underline underline-offset-4 hover:opacity-80"
        >
          Reset
        </button>
      </section>
    );
  }

  if (serverState.status === 'done') {
    return (
      <section className="flex flex-col items-center gap-3 py-6" aria-label="Shared countdown">
        <h2 className="text-4xl font-bold">Time&apos;s up!</h2>
        <button
          type="button"
          onClick={() => reset(true)}
          className="rounded-md border border-[var(--foreground)] px-4 py-2 text-sm font-medium hover:opacity-80"
        >
          New Countdown
        </button>
      </section>
    );
  }

  if (showForm) {
    return (
      <section className="flex flex-col items-center gap-3 py-6" aria-label="Shared countdown">
        <div className="flex items-end gap-2">
          <label className="flex flex-col items-center text-xs text-[var(--muted)]">
            Min
            <input
              type="number"
              min={0}
              max={99}
              value={inputMinutes}
              onChange={(e) => setInputMinutes(e.target.value)}
              className="w-16 rounded-md border border-[var(--muted)] bg-transparent px-2 py-1 text-center text-lg"
              aria-label="Minutes"
            />
          </label>
          <span className="pb-1 text-2xl">:</span>
          <label className="flex flex-col items-center text-xs text-[var(--muted)]">
            Sec
            <input
              type="number"
              min={0}
              max={59}
              value={inputSeconds}
              onChange={(e) => setInputSeconds(e.target.value)}
              className="w-16 rounded-md border border-[var(--muted)] bg-transparent px-2 py-1 text-center text-lg"
              aria-label="Seconds"
            />
          </label>
          <button
            type="button"
            onClick={start}
            disabled={totalSeconds < 1}
            className="rounded-md border border-[var(--foreground)] px-4 py-2 text-sm font-medium hover:opacity-80 disabled:opacity-40"
          >
            Start
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-sm text-[var(--muted)] underline underline-offset-4 hover:opacity-80"
        >
          Cancel
        </button>
      </section>
    );
  }

  return (
    <section className="flex justify-center py-6" aria-label="Shared countdown">
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="rounded-md border border-[var(--foreground)] px-4 py-2 text-sm font-medium hover:opacity-80"
      >
        + Countdown
      </button>
    </section>
  );
}

const feature: Feature = {
  id: 'countdown-timer',
  slot: 'main',
  order: 50,
  Component: CountdownTimer,
};

export default feature;

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Feature } from '@/features/types';

type Status = 'idle' | 'running' | 'finished';

type CountdownState = {
  status: Status;
  endsAt: string | null;
  totalSeconds: number;
};

const MAX_SECONDS = 5999; // 99:59

function remainingFrom(state: CountdownState): number {
  if (state.status !== 'running' || !state.endsAt) return 0;
  const ms = new Date(state.endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 1000));
}

function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function CountdownTimer() {
  const [state, setState] = useState<CountdownState>({
    status: 'idle',
    endsAt: null,
    totalSeconds: 0,
  });
  const [remaining, setRemaining] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const lastSyncRef = useRef(0);

  const sync = useCallback(() => {
    lastSyncRef.current = Date.now();
    return fetch('/api/countdown', { cache: 'no-store' })
      .then((res) => res.json() as Promise<CountdownState>)
      .then((next) => {
        setState(next);
        setRemaining(remainingFrom(next));
      });
  }, []);

  useEffect(() => {
    void sync();
  }, [sync]);

  useEffect(() => {
    if (state.status !== 'running') return;

    const id = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          void sync();
          return 0;
        }
        return next;
      });
      if (Date.now() - lastSyncRef.current >= 5000) void sync();
    }, 1000);

    return () => clearInterval(id);
  }, [state.status, sync]);

  const totalInput = minutes * 60 + seconds;
  const canStart = totalInput > 0 && totalInput <= MAX_SECONDS;

  async function start() {
    await fetch('/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', durationSeconds: totalInput }),
    });
    await sync();
  }

  async function reset() {
    await fetch('/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    });
    setMinutes(0);
    setSeconds(0);
    await sync();
  }

  return (
    <section aria-labelledby="countdown-heading" className="space-y-4">
      <h2 id="countdown-heading" className="text-lg font-semibold">
        Shared countdown
      </h2>

      {state.status === 'idle' && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <label htmlFor="countdown-minutes" className="text-sm text-neutral-600">
              Minutes
            </label>
            <input
              id="countdown-minutes"
              type="number"
              min={0}
              max={99}
              value={minutes}
              onChange={(e) =>
                setMinutes(Math.max(0, Math.min(99, Number(e.target.value) || 0)))
              }
              className="w-20 rounded border border-neutral-300 px-2 py-1"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="countdown-seconds" className="text-sm text-neutral-600">
              Seconds
            </label>
            <input
              id="countdown-seconds"
              type="number"
              min={0}
              max={59}
              value={seconds}
              onChange={(e) =>
                setSeconds(Math.max(0, Math.min(59, Number(e.target.value) || 0)))
              }
              className="w-20 rounded border border-neutral-300 px-2 py-1"
            />
          </div>
          <button
            type="button"
            onClick={start}
            disabled={!canStart}
            className="rounded bg-neutral-900 px-4 py-2 font-medium text-white disabled:opacity-40"
          >
            Start
          </button>
        </div>
      )}

      {state.status === 'running' && (
        <div className="flex flex-wrap items-center gap-4">
          <span
            aria-live="polite"
            className="font-mono text-5xl font-bold tabular-nums"
          >
            {formatMMSS(remaining)}
          </span>
          <button
            type="button"
            onClick={reset}
            className="rounded border border-neutral-300 px-4 py-2 font-medium"
          >
            Reset
          </button>
        </div>
      )}

      {state.status === 'finished' && (
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-3xl font-bold text-red-600">Time&apos;s up!</span>
          <button
            type="button"
            onClick={reset}
            className="rounded border border-neutral-300 px-4 py-2 font-medium"
          >
            Reset
          </button>
        </div>
      )}
    </section>
  );
}

const feature: Feature = {
  id: 'countdown-timer',
  slot: 'main',
  order: 10,
  Component: CountdownTimer,
};

export default feature;

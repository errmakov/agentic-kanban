'use client';

import { useEffect, useState } from 'react';

type Status = 'idle' | 'running' | 'finished';

interface CountdownState {
  status: Status;
  durationMs: number;
  startedAt: number;
}

function remainingMs(state: CountdownState): number {
  return Math.max(0, state.startedAt + state.durationMs - Date.now());
}

function formatMs(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export function CountdownTimer() {
  const [state, setState] = useState<CountdownState>({
    status: 'idle',
    durationMs: 0,
    startedAt: 0,
  });
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [, setTick] = useState(0);

  function refresh() {
    return fetch('/api/countdown', { cache: 'no-store' })
      .then((res) => res.json())
      .then((next: CountdownState) => setState(next));
  }

  useEffect(() => {
    refresh();
    const poll = setInterval(refresh, 1000);
    const tick = setInterval(() => setTick((t) => t + 1), 250);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);

  async function start() {
    const durationMs = (minutes * 60 + seconds) * 1000;
    if (durationMs <= 0) return;
    await fetch('/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', durationMs }),
    });
    await refresh();
  }

  async function reset() {
    await fetch('/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    });
    setMinutes(0);
    setSeconds(0);
    await refresh();
  }

  const totalSeconds = minutes * 60 + seconds;
  const remaining = remainingMs(state);
  const showFinished = state.status === 'finished' || (state.status === 'running' && remaining <= 0);

  return (
    <section className="flex flex-col items-center gap-4 rounded-lg border border-[var(--border)] p-6">
      <h2 className="text-lg font-semibold">⏱ Countdown</h2>

      {state.status === 'running' && !showFinished ? (
        <div className="flex flex-col items-center gap-4">
          <span
            className="font-mono text-6xl font-bold tabular-nums"
            aria-label="time remaining"
          >
            {formatMs(remaining)}
          </span>
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)]"
          >
            Reset
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {showFinished && (
            <p className="text-2xl font-bold text-red-500" role="status">
              ⏰ Time&apos;s up!
            </p>
          )}
          <div className="flex items-end gap-2">
            <label className="flex flex-col items-center text-xs font-medium">
              Min
              <input
                type="number"
                min={0}
                max={99}
                value={minutes}
                onChange={(e) =>
                  setMinutes(Math.min(99, Math.max(0, Math.floor(Number(e.target.value) || 0))))
                }
                className="w-20 rounded-md border border-[var(--border)] bg-transparent px-2 py-1 text-center text-2xl font-mono tabular-nums"
                aria-label="minutes"
              />
            </label>
            <span className="pb-1 text-2xl font-bold">:</span>
            <label className="flex flex-col items-center text-xs font-medium">
              Sec
              <input
                type="number"
                min={0}
                max={59}
                value={seconds}
                onChange={(e) =>
                  setSeconds(Math.min(59, Math.max(0, Math.floor(Number(e.target.value) || 0))))
                }
                className="w-20 rounded-md border border-[var(--border)] bg-transparent px-2 py-1 text-center text-2xl font-mono tabular-nums"
                aria-label="seconds"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={start}
            disabled={totalSeconds <= 0}
            className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] disabled:opacity-40"
          >
            Start
          </button>
        </div>
      )}
    </section>
  );
}

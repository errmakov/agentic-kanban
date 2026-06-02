'use client';

import { useCallback, useEffect, useState } from 'react';

type CountdownState = {
  status: 'idle' | 'running' | 'finished';
  endsAt: number | null;
};

function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const mm = Math.floor(safe / 60);
  const ss = safe % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function remainingSeconds(endsAt: number | null): number {
  if (endsAt === null) return 0;
  return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
}

export function CountdownTimer() {
  const [state, setState] = useState<CountdownState>({ status: 'idle', endsAt: null });
  const [remaining, setRemaining] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [minutes, setMinutes] = useState('5');
  const [seconds, setSeconds] = useState('0');
  const [error, setError] = useState<string | null>(null);

  const applyState = useCallback((next: CountdownState) => {
    setState(next);
    setRemaining(next.status === 'running' ? remainingSeconds(next.endsAt) : 0);
  }, []);

  // Poll the server every second so all visitors stay in sync.
  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch('/api/countdown', { cache: 'no-store' });
        if (!res.ok) return;
        const next = (await res.json()) as CountdownState;
        if (active) applyState(next);
      } catch {
        // transient network errors are ignored; the next tick retries
      }
    };
    poll();
    const id = setInterval(poll, 1000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [applyState]);

  // Local tick for a smooth display between polls while running.
  useEffect(() => {
    if (state.status !== 'running') return;
    const id = setInterval(() => {
      setRemaining(remainingSeconds(state.endsAt));
    }, 1000);
    return () => clearInterval(id);
  }, [state.status, state.endsAt]);

  const handleStart = async () => {
    const mm = Number(minutes);
    const ss = Number(seconds);
    if (!Number.isInteger(mm) || !Number.isInteger(ss) || mm < 0 || mm > 99 || ss < 0 || ss > 59) {
      setError('Enter minutes 0–99 and seconds 0–59.');
      return;
    }
    const durationSeconds = mm * 60 + ss;
    if (durationSeconds < 1) {
      setError('Set a time greater than 00:00.');
      return;
    }
    setError(null);
    try {
      const res = await fetch('/api/countdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', durationSeconds }),
      });
      if (!res.ok) {
        setError('Could not start the countdown.');
        return;
      }
      applyState((await res.json()) as CountdownState);
      setFormOpen(false);
    } catch {
      setError('Could not start the countdown.');
    }
  };

  const handleReset = async () => {
    try {
      const res = await fetch('/api/countdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      if (!res.ok) return;
      applyState((await res.json()) as CountdownState);
    } catch {
      // ignore; the poll will reconcile
    }
  };

  return (
    <div className="space-y-3">
      {state.status === 'idle' && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setFormOpen((open) => !open)}
            aria-expanded={formOpen}
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
          >
            + Countdown
          </button>
          <div className={formOpen ? 'block space-y-2' : 'hidden'}>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-sm">
                <span className="sr-only">Minutes</span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  aria-label="Minutes"
                  className="w-16 rounded border border-neutral-300 px-2 py-1 text-right"
                />
              </label>
              <span aria-hidden="true" className="font-semibold">
                :
              </span>
              <label className="flex items-center gap-1 text-sm">
                <span className="sr-only">Seconds</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  aria-label="Seconds"
                  className="w-16 rounded border border-neutral-300 px-2 py-1 text-right"
                />
              </label>
              <button
                type="button"
                onClick={handleStart}
                className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
              >
                Start
              </button>
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>
      )}

      {state.status === 'running' && (
        <div className="space-y-2">
          <time className="block text-5xl font-bold tabular-nums" aria-live="polite">
            {formatTime(remaining)}
          </time>
          <button
            type="button"
            onClick={handleReset}
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
          >
            Reset
          </button>
        </div>
      )}

      {state.status === 'finished' && (
        <div className="space-y-2">
          <p className="text-3xl font-bold text-red-600" role="status">
            Time&apos;s up!
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

type TimerStatus = 'idle' | 'running' | 'expired';
type ViewState = 'loading' | 'idle' | 'setup' | 'running' | 'expired';

type ServerState = {
  endsAt: number | null;
  status: TimerStatus;
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${pad(mins)}:${pad(secs)}`;
}

export function CountdownTimer() {
  const [view, setView] = useState<ViewState>('loading');
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');

  const tickCountRef = useRef(0);

  function applyServerState(state: ServerState) {
    setEndsAt(state.endsAt);
    if (state.status === 'running') {
      setNow(Date.now());
      setView('running');
    } else if (state.status === 'expired') {
      setView('expired');
    } else {
      setView('idle');
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch('/api/timer')
      .then((res) => res.json())
      .then((state: ServerState) => {
        if (!cancelled) applyServerState(state);
      })
      .catch(() => {
        if (!cancelled) setView('idle');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (view !== 'running') return;
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (endsAt !== null && current >= endsAt) {
        setView('expired');
        return;
      }
      tickCountRef.current += 1;
      if (tickCountRef.current >= 5) {
        tickCountRef.current = 0;
        fetch('/api/timer')
          .then((res) => res.json())
          .then((state: ServerState) => applyServerState(state))
          .catch(() => {});
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [view, endsAt]);

  const mm = Number(minutes) || 0;
  const ss = Number(seconds) || 0;
  const durationMs = (mm * 60 + ss) * 1000;
  const secondsOutOfRange = ss > 59;
  const canStart = durationMs > 0 && !secondsOutOfRange;

  async function handleStart() {
    if (!canStart) return;
    const res = await fetch('/api/timer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', durationMs }),
    });
    const state: ServerState = await res.json();
    tickCountRef.current = 0;
    applyServerState(state);
  }

  async function handleReset() {
    const res = await fetch('/api/timer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    });
    const state: ServerState = await res.json();
    setMinutes('0');
    setSeconds('0');
    applyServerState(state);
  }

  return (
    <section aria-labelledby="countdown-heading" className="space-y-4">
      <h2 id="countdown-heading" className="text-lg font-semibold">
        Countdown
      </h2>

      {view === 'idle' && (
        <button
          type="button"
          onClick={() => setView('setup')}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          + Countdown
        </button>
      )}

      {view === 'setup' && (
        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <label className="flex flex-col text-sm text-neutral-600">
              Minutes
              <input
                type="number"
                min={0}
                max={99}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                aria-label="Minutes"
                className="w-20 rounded-md border border-neutral-300 px-2 py-1 text-lg"
              />
            </label>
            <span className="pb-2 text-lg font-semibold">:</span>
            <label className="flex flex-col text-sm text-neutral-600">
              Seconds
              <input
                type="number"
                min={0}
                max={59}
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                aria-label="Seconds"
                className="w-20 rounded-md border border-neutral-300 px-2 py-1 text-lg"
              />
            </label>
          </div>
          {secondsOutOfRange && (
            <p className="text-sm text-red-600">Seconds must be between 0 and 59.</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-40"
            >
              Start
            </button>
            <button
              type="button"
              onClick={() => setView('idle')}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {view === 'running' && endsAt !== null && (
        <div className="space-y-3">
          <p className="font-mono text-5xl font-bold tabular-nums" aria-live="polite">
            {formatRemaining(endsAt - now)}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
          >
            Reset
          </button>
        </div>
      )}

      {view === 'expired' && (
        <div className="space-y-3">
          <p className="text-5xl font-bold text-red-600">Time&apos;s up!</p>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
          >
            Reset
          </button>
        </div>
      )}
    </section>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import type { Feature } from '@/features/types';

type CountdownState =
  | { state: 'idle' }
  | { state: 'running'; endsAt: number }
  | { state: 'finished' };

function formatMs(ms: number): string {
  const clamped = Math.max(0, ms);
  const mm = String(Math.floor(clamped / 60000)).padStart(2, '0');
  const ss = String(Math.floor((clamped % 60000) / 1000)).padStart(2, '0');
  return `${mm}:${ss}`;
}

function Countdown() {
  const [server, setServer] = useState<CountdownState>({ state: 'idle' });
  const [displayMs, setDisplayMs] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');

  const endsAtRef = useRef<number | null>(null);

  async function poll() {
    try {
      const res = await fetch('/api/countdown', { cache: 'no-store' });
      const next = (await res.json()) as CountdownState;
      setServer(next);
      endsAtRef.current = next.state === 'running' ? next.endsAt : null;
      if (next.state === 'running') {
        setDisplayMs(Math.max(0, next.endsAt - Date.now()));
      }
    } catch {
      // transient network error — next poll will recover
    }
  }

  useEffect(() => {
    // poll() only setStates after an awaited fetch, so this is async, not a sync cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    poll();
    const pollId = setInterval(poll, 1000);
    const tickId = setInterval(() => {
      if (endsAtRef.current !== null) {
        setDisplayMs(Math.max(0, endsAtRef.current - Date.now()));
      }
    }, 100);
    return () => {
      clearInterval(pollId);
      clearInterval(tickId);
    };
  }, []);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    const mm = Number(minutes) || 0;
    const ss = Number(seconds) || 0;
    const durationMs = (mm * 60 + ss) * 1000;
    if (durationMs < 1000 || durationMs > 5_999_000) return;
    await fetch('/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', durationMs }),
    });
    setShowForm(false);
    setMinutes('');
    setSeconds('');
    await poll();
  }

  async function reset() {
    await fetch('/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    });
    await poll();
  }

  if (server.state === 'finished') {
    return (
      <section className="flex flex-col items-center gap-4 py-6">
        <p className="text-5xl font-bold tracking-tight text-[var(--accent,#ef4444)]">
          Time&apos;s up!
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-current px-4 py-2 text-sm font-medium"
        >
          Reset
        </button>
      </section>
    );
  }

  if (server.state === 'running') {
    return (
      <section className="flex flex-col items-center gap-4 py-6">
        <p
          aria-label="time remaining"
          className="font-mono text-6xl font-bold tabular-nums tracking-tight"
        >
          {formatMs(displayMs)}
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-current px-4 py-2 text-sm font-medium"
        >
          Reset
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center gap-4 py-6">
      {showForm ? (
        <form onSubmit={start} className="flex items-end gap-2">
          <label className="flex flex-col text-xs font-medium">
            Min
            <input
              type="number"
              min={0}
              max={99}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-16 rounded-md border border-current bg-transparent px-2 py-1 text-lg"
              aria-label="minutes"
            />
          </label>
          <span className="pb-2 text-lg font-bold">:</span>
          <label className="flex flex-col text-xs font-medium">
            Sec
            <input
              type="number"
              min={0}
              max={59}
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              className="w-16 rounded-md border border-current bg-transparent px-2 py-1 text-lg"
              aria-label="seconds"
            />
          </label>
          <button
            type="submit"
            className="rounded-md border border-current px-4 py-2 text-sm font-medium"
          >
            Start
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-2 py-2 text-sm underline"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-md border border-current px-4 py-2 text-sm font-medium"
        >
          +Countdown
        </button>
      )}
    </section>
  );
}

const feature: Feature = {
  id: 'countdown',
  slot: 'main',
  order: 50,
  Component: Countdown,
};

export default feature;

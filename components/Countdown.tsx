'use client';

import { useEffect, useRef, useState } from 'react';

type CountdownState = {
  status: 'idle' | 'running' | 'done';
  endsAt: number | null;
  durationMs: number;
};

type UiState = 'idle' | 'setup' | 'running' | 'done';

function format(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function Countdown() {
  const [ui, setUi] = useState<UiState>('idle');
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const endsAtRef = useRef<number | null>(null);

  const applyState = (state: CountdownState) => {
    endsAtRef.current = state.endsAt;
    setEndsAt(state.endsAt);
    if (state.status === 'running') {
      setUi('running');
    } else if (state.status === 'done') {
      setUi('done');
    } else {
      setUi('idle');
    }
  };

  // Hydrate from the shared server state on mount.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/countdown')
      .then((res) => res.json())
      .then((state: CountdownState) => {
        if (!cancelled) applyState(state);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Local 1s tick + 3s shared-state poll while running.
  useEffect(() => {
    if (ui !== 'running') return;
    const tick = setInterval(() => {
      const current = endsAtRef.current;
      const nextNow = Date.now();
      setNow(nextNow);
      if (current !== null && current - nextNow <= 0) {
        setUi('done');
      }
    }, 1000);
    const poll = setInterval(() => {
      fetch('/api/countdown')
        .then((res) => res.json())
        .then((state: CountdownState) => applyState(state))
        .catch(() => {});
    }, 3000);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [ui]);

  const start = async () => {
    const res = await fetch('/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', minutes, seconds }),
    });
    if (res.ok) {
      const state: CountdownState = await res.json();
      setNow(Date.now());
      applyState(state);
    }
  };

  const reset = async () => {
    const res = await fetch('/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    });
    if (res.ok) {
      const state: CountdownState = await res.json();
      setMinutes(0);
      setSeconds(0);
      applyState(state);
    }
  };

  if (ui === 'idle') {
    return (
      <button
        type="button"
        onClick={() => setUi('setup')}
        className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
      >
        +Countdown
      </button>
    );
  }

  if (ui === 'setup') {
    const total = minutes * 60 + seconds;
    return (
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-sm">
          <span className="sr-only">Minutes</span>
          <input
            type="number"
            min={0}
            max={99}
            value={minutes}
            aria-label="Minutes"
            onChange={(e) => setMinutes(Math.max(0, Math.min(99, Number(e.target.value))))}
            className="w-16 rounded border border-neutral-300 px-2 py-1"
          />
        </label>
        <span aria-hidden>:</span>
        <label className="flex items-center gap-1 text-sm">
          <span className="sr-only">Seconds</span>
          <input
            type="number"
            min={0}
            max={59}
            value={seconds}
            aria-label="Seconds"
            onChange={(e) => setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
            className="w-16 rounded border border-neutral-300 px-2 py-1"
          />
        </label>
        <button
          type="button"
          onClick={start}
          disabled={total <= 0}
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
        >
          Start
        </button>
        <button
          type="button"
          onClick={() => setUi('idle')}
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (ui === 'done') {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-red-600" role="status">
          Time&apos;s up
        </span>
        <button
          type="button"
          onClick={reset}
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm"
        >
          Reset
        </button>
      </div>
    );
  }

  // running
  const remaining = endsAt !== null ? endsAt - now : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-2xl font-bold tabular-nums" role="timer">
        {format(remaining)}
      </span>
      <button
        type="button"
        onClick={reset}
        className="rounded border border-neutral-300 px-3 py-1.5 text-sm"
      >
        Reset
      </button>
    </div>
  );
}

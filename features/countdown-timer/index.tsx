'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

type State = { startedAt: number | null; durationSeconds: number };

const IDLE: State = { startedAt: null, durationSeconds: 0 };

/** Milliseconds remaining, clamped to 0. */
function remainingMs(state: State, now: number): number {
  if (state.startedAt === null) return 0;
  return Math.max(0, state.startedAt + state.durationSeconds * 1000 - now);
}

/** Format milliseconds as MM:SS. */
function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Parse an MM:SS string to total seconds, or null if invalid (0 or overflow). */
function parseDuration(value: string): number | null {
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(value.trim());
  if (!match) return null;
  const m = Number(match[1]);
  const s = Number(match[2]);
  const total = m * 60 + s;
  if (total < 1 || total > 5999) return null;
  return total;
}

function CountdownTimer() {
  const [state, setState] = useState<State>(IDLE);
  const [now, setNow] = useState<number>(() => Date.now());
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    function poll() {
      fetch('/api/countdown')
        .then((res) => res.json())
        .then((data: State) => {
          if (active) setState(data);
        })
        .catch(() => {});
    }
    poll();
    const pollId = setInterval(poll, 2000);
    const tickId = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      active = false;
      clearInterval(pollId);
      clearInterval(tickId);
    };
  }, []);

  const remaining = remainingMs(state, now);
  const status: 'idle' | 'running' | 'done' =
    state.startedAt === null ? 'idle' : remaining > 0 ? 'running' : 'done';

  async function start(event: React.FormEvent) {
    event.preventDefault();
    const durationSeconds = parseDuration(inputValue);
    if (durationSeconds === null) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/countdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationSeconds }),
      });
      if (!res.ok) throw new Error('request failed');
      const data: State = await res.json();
      setState(data);
      setNow(Date.now());
      setInputValue('');
    } catch {
      // leave state as-is; the next poll will re-sync
    } finally {
      setIsSubmitting(false);
    }
  }

  async function reset() {
    try {
      const res = await fetch('/api/countdown', { method: 'DELETE' });
      if (!res.ok) throw new Error('request failed');
      const data: State = await res.json();
      setState(data);
    } catch {
      // leave state as-is; the next poll will re-sync
    }
  }

  return (
    <section
      aria-label="Shared countdown timer"
      className="flex flex-col items-center gap-4"
    >
      {status === 'idle' && (
        <form onSubmit={start} className="flex flex-col items-center gap-3">
          <label htmlFor="countdown-input" className="text-sm font-medium">
            Start a shared countdown (MM:SS, up to 99:59)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="countdown-input"
              type="text"
              inputMode="numeric"
              placeholder="MM:SS"
              pattern="[0-9]{1,2}:[0-5][0-9]"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-24 rounded-md border border-black/10 px-3 py-2 text-center font-mono text-lg dark:border-white/15 dark:bg-transparent"
            />
            <button
              type="submit"
              disabled={isSubmitting || parseDuration(inputValue) === null}
              className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15"
            >
              + Countdown
            </button>
          </div>
        </form>
      )}

      {status === 'running' && (
        <div className="flex flex-col items-center gap-3">
          <span
            aria-label="Time remaining"
            className="font-mono text-6xl font-bold tabular-nums"
          >
            {formatMs(remaining)}
          </span>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-black/10 px-3 py-1 text-xs font-medium transition-transform hover:scale-105 active:scale-95 dark:border-white/15"
          >
            Reset
          </button>
        </div>
      )}

      {status === 'done' && (
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl font-bold">Time&apos;s up!</span>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-black/10 px-3 py-1 text-xs font-medium transition-transform hover:scale-105 active:scale-95 dark:border-white/15"
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
  order: 50,
  Component: CountdownTimer,
};

export default feature;

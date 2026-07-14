'use client';
import { useEffect, useRef, useState } from 'react';
import type { Feature } from '@/features/types';

interface CountdownState {
  endsAt: string | null;
  totalSeconds: number;
}

function format(seconds: number): string {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

/** Seconds left until `endsAt` (0 if null or in the past). */
function remainingFrom(endsAt: string | null): number {
  return endsAt === null ? 0 : Math.max(0, Math.round((new Date(endsAt).getTime() - Date.now()) / 1000));
}

/** Parse an MM:SS string into total seconds, or null if invalid. */
function parseInput(value: string): number | null {
  const parts = value.split(':');
  if (parts.length !== 2) return null;
  const [m, s] = parts;
  if (!/^\d+$/.test(m) || !/^\d+$/.test(s)) return null;
  const minutes = Number(m);
  const secs = Number(s);
  if (minutes > 99 || secs > 59) return null;
  const total = minutes * 60 + secs;
  if (total < 1 || total > 5999) return null;
  return total;
}

export function CountdownTimer() {
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [input, setInput] = useState('');
  const endsAtRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const sync = async () => {
      try {
        const res = await fetch('/api/countdown', { cache: 'no-store' });
        const state = (await res.json()) as CountdownState;
        if (!active) return;
        endsAtRef.current = state.endsAt;
        setEndsAt(state.endsAt);
        setRemaining(remainingFrom(state.endsAt));
      } catch {
        // network hiccup — keep last known state; next tick retries
      }
    };
    void sync();
    const syncId = setInterval(() => void sync(), 5000);
    const tickId = setInterval(() => {
      setRemaining(remainingFrom(endsAtRef.current));
    }, 1000);
    return () => {
      active = false;
      clearInterval(syncId);
      clearInterval(tickId);
    };
  }, []);

  const start = async () => {
    const totalSeconds = parseInput(input);
    if (totalSeconds === null) return;
    const res = await fetch('/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totalSeconds }),
    });
    if (!res.ok) return;
    const state = (await res.json()) as CountdownState;
    endsAtRef.current = state.endsAt;
    setEndsAt(state.endsAt);
    setRemaining(remainingFrom(state.endsAt));
    setInput('');
  };

  const stop = async () => {
    await fetch('/api/countdown', { method: 'DELETE' });
    endsAtRef.current = null;
    setEndsAt(null);
    setRemaining(0);
  };

  return (
    <section className="flex flex-col items-center gap-3 py-4" aria-label="Shared countdown timer">
      {endsAt === null ? (
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void start();
          }}
        >
          <label className="sr-only" htmlFor="countdown-input">
            Countdown duration (MM:SS)
          </label>
          <input
            id="countdown-input"
            type="text"
            inputMode="numeric"
            placeholder="MM:SS"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-24 rounded border border-neutral-300 bg-transparent px-3 py-2 text-center font-mono text-lg"
          />
          <button
            type="submit"
            disabled={parseInput(input) === null}
            className="rounded bg-neutral-900 px-4 py-2 font-medium text-white disabled:opacity-40"
          >
            Start
          </button>
        </form>
      ) : remaining > 0 ? (
        <>
          <span className="font-mono text-6xl font-bold tabular-nums" aria-live="polite">
            {format(remaining)}
          </span>
          <button
            type="button"
            onClick={() => void stop()}
            className="rounded border border-neutral-300 px-4 py-2 font-medium"
          >
            Stop
          </button>
        </>
      ) : (
        <>
          <span className="text-4xl font-bold" role="status">
            ⏰ Time&apos;s up!
          </span>
          <button
            type="button"
            onClick={() => void stop()}
            className="rounded bg-neutral-900 px-4 py-2 font-medium text-white"
          >
            Reset
          </button>
        </>
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

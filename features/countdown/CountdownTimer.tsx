'use client';

import { useEffect, useState } from 'react';

type CountdownState =
  | { status: 'idle' }
  | { status: 'running'; durationSeconds: number; startedAt: string };

function remainingSeconds(state: CountdownState): number {
  if (state.status !== 'running') return 0;
  const endsAt = new Date(state.startedAt).getTime() + state.durationSeconds * 1000;
  return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
}

function formatMMSS(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Parse a `MM:SS` string. Returns total seconds, or null if invalid. */
function parseDuration(input: string): number | null {
  const parts = input.trim().split(':');
  if (parts.length !== 2) return null;
  const [mm, ss] = parts;
  if (!/^\d{1,2}$/.test(mm) || !/^\d{1,2}$/.test(ss)) return null;
  const minutes = Number(mm);
  const seconds = Number(ss);
  if (minutes > 99 || seconds > 59) return null;
  const total = minutes * 60 + seconds;
  if (total < 1) return null;
  return total;
}

export function CountdownTimer() {
  const [state, setState] = useState<CountdownState>({ status: 'idle' });
  const [remaining, setRemaining] = useState(0);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load initial state, then poll the server to stay in sync with other visitors.
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/countdown', { cache: 'no-store' });
        const data = (await res.json()) as CountdownState;
        if (!active) return;
        setState(data);
        setRemaining(remainingSeconds(data));
      } catch {
        // network hiccup — keep showing the last known state
      }
    };
    load();
    const id = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // Local 1-second tick while running.
  useEffect(() => {
    if (state.status !== 'running') return;
    const id = setInterval(() => setRemaining(remainingSeconds(state)), 1000);
    return () => clearInterval(id);
  }, [state]);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    const durationSeconds = parseDuration(input);
    if (durationSeconds === null) {
      setError('Enter a time as MM:SS (up to 99:59).');
      return;
    }
    setError(null);
    const res = await fetch('/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', durationSeconds }),
    });
    const data = (await res.json()) as CountdownState;
    setState(data);
    setRemaining(remainingSeconds(data));
  }

  async function handleReset() {
    const res = await fetch('/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    });
    const data = (await res.json()) as CountdownState;
    setState(data);
    setRemaining(remainingSeconds(data));
    setInput('');
  }

  if (state.status === 'running' && remaining === 0) {
    return (
      <section className="flex flex-col items-center gap-4 py-8">
        <p className="text-5xl font-mono tabular-nums font-bold text-red-500">
          Time&apos;s up!
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Reset
        </button>
      </section>
    );
  }

  if (state.status === 'running') {
    return (
      <section className="flex flex-col items-center gap-4 py-8">
        <p className="text-5xl font-mono tabular-nums font-bold" aria-label="Time remaining">
          {formatMMSS(remaining)}
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium"
        >
          Reset
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center gap-3 py-8">
      <form onSubmit={handleStart} className="flex items-center gap-2">
        <label htmlFor="countdown-input" className="sr-only">
          Countdown duration in minutes and seconds
        </label>
        <input
          id="countdown-input"
          type="text"
          inputMode="numeric"
          placeholder="MM:SS"
          maxLength={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-24 rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-center font-mono tabular-nums"
        />
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          + Countdown
        </button>
      </form>
      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </section>
  );
}

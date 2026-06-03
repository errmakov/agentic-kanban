'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

const MAX_DURATION_MS = 5_999_000; // 99:59 cap

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function CountdownTimer() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [open, setOpen] = useState(false);
  const [mins, setMins] = useState('5');
  const [secs, setSecs] = useState('00');

  // Poll the shared timer state every second; the tick also drives the display.
  useEffect(() => {
    let active = true;
    const sync = async () => {
      try {
        const res = await fetch('/api/countdown-timer');
        const data = (await res.json()) as { endsAt: number | null };
        if (active) setEndsAt(data.endsAt);
      } catch {
        // transient fetch failure — keep last known state
      }
    };
    sync();
    const id = setInterval(() => {
      setNow(Date.now());
      sync();
    }, 1000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const durationMs = ((parseInt(mins, 10) || 0) * 60 + (parseInt(secs, 10) || 0)) * 1000;
  const canStart = durationMs >= 1000 && durationMs <= MAX_DURATION_MS;

  const start = async () => {
    if (!canStart) return;
    const res = await fetch('/api/countdown-timer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ durationMs }),
    });
    const data = (await res.json()) as { endsAt: number | null };
    setEndsAt(data.endsAt);
    setOpen(false);
  };

  const reset = async () => {
    await fetch('/api/countdown-timer', { method: 'DELETE' });
    setEndsAt(null);
    setOpen(false);
  };

  const status: 'idle' | 'running' | 'finished' =
    endsAt === null ? 'idle' : endsAt > now ? 'running' : 'finished';

  if (status === 'running') {
    return (
      <section aria-label="Shared countdown" className="flex flex-col items-center gap-3">
        <div
          className="font-mono text-6xl font-bold tabular-nums"
          aria-live="polite"
        >
          {formatRemaining((endsAt as number) - now)}
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-neutral-300 px-3 py-1 text-sm font-medium hover:bg-neutral-100"
        >
          Cancel
        </button>
      </section>
    );
  }

  if (status === 'finished') {
    return (
      <section aria-label="Shared countdown" className="flex flex-col items-center gap-3">
        <div className="text-4xl font-bold text-red-600" role="status">
          ⏰ Time&apos;s up!
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-neutral-300 px-3 py-1 text-sm font-medium hover:bg-neutral-100"
        >
          Reset
        </button>
      </section>
    );
  }

  if (!open) {
    return (
      <section aria-label="Shared countdown" className="flex justify-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          + Countdown
        </button>
      </section>
    );
  }

  return (
    <section aria-label="Shared countdown" className="flex flex-col items-center gap-3">
      <div className="flex items-end gap-2">
        <label className="flex flex-col text-xs text-neutral-600">
          Minutes
          <input
            type="number"
            min={0}
            max={99}
            value={mins}
            onChange={(e) => setMins(e.target.value)}
            className="w-20 rounded-md border border-neutral-300 px-2 py-1 text-center font-mono text-lg"
          />
        </label>
        <span className="pb-2 text-lg font-bold">:</span>
        <label className="flex flex-col text-xs text-neutral-600">
          Seconds
          <input
            type="number"
            min={0}
            max={59}
            value={secs}
            onChange={(e) => setSecs(e.target.value)}
            className="w-20 rounded-md border border-neutral-300 px-2 py-1 text-center font-mono text-lg"
          />
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={start}
          disabled={!canStart}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Start
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Cancel
        </button>
      </div>
    </section>
  );
}

const feature: Feature = {
  id: 'countdown-timer',
  slot: 'main',
  order: 110,
  Component: CountdownTimer,
};

export default feature;

'use client';

import { useEffect, useState } from 'react';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function CountdownTimer() {
  const [endTime, setEndTime] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [showForm, setShowForm] = useState(false);
  const [inputMinutes, setInputMinutes] = useState('5');
  const [inputSeconds, setInputSeconds] = useState('00');

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch('/api/countdown');
        const data = (await res.json()) as { endTime: number | null };
        if (!cancelled) {
          setEndTime(data.endTime);
          setNow(Date.now());
          if (data.endTime !== null) setShowForm(false);
        }
      } catch {
        // ignore transient fetch errors; next tick retries
      }
    }

    poll();
    const interval = setInterval(poll, 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  async function start() {
    const minutes = Number(inputMinutes);
    const seconds = Number(inputSeconds);
    const res = await fetch('/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes, seconds }),
    });
    if (res.ok) {
      const data = (await res.json()) as { endTime: number | null };
      setEndTime(data.endTime);
      setNow(Date.now());
      setShowForm(false);
    }
  }

  async function reset() {
    await fetch('/api/countdown', { method: 'DELETE' });
    setEndTime(null);
    setShowForm(false);
  }

  const isRunning = endTime !== null && endTime > now;
  const isExpired = endTime !== null && endTime <= now;
  const remaining = isRunning ? Math.max(0, Math.ceil((endTime - now) / 1000)) : 0;

  return (
    <section aria-labelledby="countdown-heading" className="mt-8 space-y-4">
      <h2 id="countdown-heading" className="text-lg font-semibold">
        Countdown
      </h2>

      {isRunning && (
        <p
          aria-live="polite"
          className="font-mono text-5xl font-bold tabular-nums"
        >
          {pad(Math.floor(remaining / 60))}:{pad(remaining % 60)}
        </p>
      )}

      {isExpired && (
        <div className="space-y-3">
          <p
            aria-live="assertive"
            className="text-3xl font-bold text-red-600 motion-safe:animate-pulse"
          >
            Time&apos;s up!
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded border border-current px-3 py-1 text-sm font-medium"
          >
            Start new
          </button>
        </div>
      )}

      {endTime === null && !showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded border border-current px-3 py-1 text-sm font-medium"
        >
          +Countdown
        </button>
      )}

      {endTime === null && showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            start();
          }}
          className="flex items-end gap-3"
        >
          <label className="flex flex-col text-sm">
            <span>Minutes</span>
            <input
              type="number"
              min="0"
              max="99"
              required
              value={inputMinutes}
              onChange={(e) => setInputMinutes(e.target.value)}
              className="w-20 rounded border border-current px-2 py-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            <span>Seconds</span>
            <input
              type="number"
              min="0"
              max="59"
              required
              value={inputSeconds}
              onChange={(e) => setInputSeconds(e.target.value)}
              className="w-20 rounded border border-current px-2 py-1"
            />
          </label>
          <button
            type="submit"
            className="rounded border border-current px-3 py-1 text-sm font-medium"
          >
            Start
          </button>
        </form>
      )}
    </section>
  );
}

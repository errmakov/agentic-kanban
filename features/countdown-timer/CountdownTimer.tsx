'use client';
import { useState, useEffect, useRef } from 'react';

type Status = 'idle' | 'running' | 'done';

function formatTime(seconds: number): string {
  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

function computeState(endsAt: string | null): { remaining: number; status: Status } {
  if (!endsAt) return { remaining: 0, status: 'idle' };
  const r = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
  return { remaining: r, status: r > 0 ? 'running' : 'done' };
}

export function CountdownTimer() {
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [mm, setMm] = useState(5);
  const [ss, setSs] = useState(0);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function poll() {
      const res = await fetch('/api/countdown');
      const data = (await res.json()) as { endsAt: string | null };
      const ea = data.endsAt;
      setEndsAt(ea);
      const { remaining: r, status: s } = computeState(ea);
      setRemaining(r);
      setStatus(s);
    }
    poll();
    pollRef.current = setInterval(poll, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (!endsAt) return;

    tickRef.current = setInterval(() => {
      const { remaining: r, status: s } = computeState(endsAt);
      setRemaining(r);
      setStatus(s);
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [endsAt]);

  async function handleStart() {
    const total = mm * 60 + ss;
    const res = await fetch('/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', seconds: total }),
    });
    const data = (await res.json()) as { endsAt: string | null };
    const ea = data.endsAt;
    setEndsAt(ea);
    const { remaining: r, status: s } = computeState(ea);
    setRemaining(r);
    setStatus(s);
  }

  async function handleReset() {
    const res = await fetch('/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    });
    const data = (await res.json()) as { endsAt: string | null };
    const ea = data.endsAt;
    setEndsAt(ea);
    const { remaining: r, status: s } = computeState(ea);
    setRemaining(r);
    setStatus(s);
  }

  const startDisabled = mm * 60 + ss < 1 || mm * 60 + ss > 5999;

  return (
    <section className="flex flex-col items-center gap-4 py-6">
      {status === 'idle' && (
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-lg font-semibold">Countdown Timer</h2>
          <div className="flex items-center gap-2">
            <label className="flex flex-col items-center gap-1 text-sm">
              Minutes
              <input
                type="number"
                min={0}
                max={99}
                value={mm}
                onChange={e => setMm(Math.min(99, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-16 text-center border rounded p-1 font-mono text-xl"
              />
            </label>
            <span className="font-mono text-2xl mt-5">:</span>
            <label className="flex flex-col items-center gap-1 text-sm">
              Seconds
              <input
                type="number"
                min={0}
                max={59}
                value={ss}
                onChange={e => setSs(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-16 text-center border rounded p-1 font-mono text-xl"
              />
            </label>
          </div>
          <button
            onClick={handleStart}
            disabled={startDisabled}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            Start Countdown
          </button>
        </div>
      )}

      {status === 'running' && (
        <div className="flex flex-col items-center gap-4">
          <div role="timer" aria-live="polite" className="font-mono text-6xl font-bold tabular-nums">
            {formatTime(remaining)}
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>
      )}

      {status === 'done' && (
        <div className="flex flex-col items-center gap-4">
          <p aria-live="assertive" className="text-4xl font-bold text-red-600">
            Time&apos;s up!
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>
      )}
    </section>
  );
}

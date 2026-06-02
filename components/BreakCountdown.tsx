'use client';

import { useEffect, useState } from 'react';

function format(ms: number): string {
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

export function BreakCountdown() {
  const [breakAt, setBreakAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/break')
      .then((res) => res.json())
      .then((data: { breakAt: string | null }) => {
        if (cancelled || !data.breakAt) return;
        const at = Date.parse(data.breakAt);
        if (Number.isNaN(at)) return;
        setBreakAt(at);
        setRemaining(at - Date.now());
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (breakAt === null) return;
    const tick = () => setRemaining(breakAt - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [breakAt]);

  if (breakAt === null || remaining === null) return null;

  return (
    <section aria-label="Countdown to next break" className="mt-8 text-neutral-600">
      {remaining <= 0 ? (
        <p className="text-lg font-semibold">Break time!</p>
      ) : (
        <p>
          Next break in{' '}
          <span className="font-mono text-lg font-semibold tabular-nums">
            {format(remaining)}
          </span>
        </p>
      )}
    </section>
  );
}

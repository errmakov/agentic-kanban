'use client';

import { useSyncExternalStore } from 'react';

// Edit this before each session: the breaks scheduled for today, in order.
const BREAK_SCHEDULE: { label: string; time: string }[] = [
  { label: 'Morning break', time: '10:30' },
  { label: 'Lunch', time: '12:30' },
  { label: 'Afternoon break', time: '15:00' },
];

type NextBreak = { label: string; secondsLeft: number } | null;

function formatSeconds(total: number): string {
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return total >= 3600 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

function nextBreak(): NextBreak {
  const now = new Date();
  for (const { label, time } of BREAK_SCHEDULE) {
    const [hours, minutes] = time.split(':').map(Number);
    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);
    const secondsLeft = Math.ceil((target.getTime() - now.getTime()) / 1000);
    if (secondsLeft > 0) {
      return { label, secondsLeft };
    }
  }
  return null;
}

function subscribe(onChange: () => void): () => void {
  const interval = setInterval(onChange, 1000);
  return () => clearInterval(interval);
}

// Cache the snapshot so getSnapshot returns a stable reference until the
// countdown actually changes — useSyncExternalStore compares with Object.is.
let cached: NextBreak = null;
let cachedKey = '';

function getSnapshot(): NextBreak {
  const next = nextBreak();
  const key = next ? `${next.label}:${next.secondsLeft}` : 'none';
  if (key !== cachedKey) {
    cachedKey = key;
    cached = next;
  }
  return cached;
}

export function BreakCountdown() {
  const next = useSyncExternalStore(subscribe, getSnapshot, () => null);

  return (
    <section
      aria-labelledby="break-countdown-heading"
      className="rounded-lg border border-neutral-200 p-4"
    >
      <h3
        id="break-countdown-heading"
        className="text-sm font-semibold text-neutral-500"
      >
        Next break
      </h3>
      {next ? (
        <p className="text-neutral-600">
          <span className="font-medium text-[var(--foreground)]">{next.label}</span>{' '}
          in{' '}
          <span className="font-mono tabular-nums text-2xl font-bold text-[var(--foreground)]">
            {formatSeconds(next.secondsLeft)}
          </span>
        </p>
      ) : (
        <p className="text-neutral-600">No more breaks today</p>
      )}
    </section>
  );
}

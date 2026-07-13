'use client';

import { useSyncExternalStore } from 'react';
import type { Feature } from '@/features/types';

/**
 * Hardcoded workshop-day schedule. `start` must be a full ISO-8601 datetime
 * string so `new Date(start)` parses unambiguously. Kept pre-sorted by start.
 */
type Session = { start: string; title: string };

const SCHEDULE: Session[] = [
  { start: '2026-07-13T09:00:00', title: 'Opening Keynote' },
  { start: '2026-07-13T10:30:00', title: 'Building Live on Stage' },
  { start: '2026-07-13T12:00:00', title: 'Lunch & Networking' },
  { start: '2026-07-13T13:30:00', title: 'Agent Pipelines in Practice' },
  { start: '2026-07-13T15:00:00', title: 'Closing Panel' },
];

/**
 * Pick the session to display: the last one whose start time has already
 * passed, or — before the first session — the first upcoming session.
 */
export function currentSessionTitle(now: Date, schedule: Session[] = SCHEDULE): string {
  const time = now.getTime();
  for (let i = schedule.length - 1; i >= 0; i--) {
    if (new Date(schedule[i].start).getTime() <= time) {
      return schedule[i].title;
    }
  }
  return schedule[0].title;
}

/**
 * Read the wall-clock time from the browser as an external store. The server
 * snapshot is 0 (banner renders blank) so the first client render matches the
 * SSR markup; the interval then advances the clock every minute.
 */
let clockMs = 0;

function subscribeToClock(onChange: () => void): () => void {
  clockMs = Date.now();
  onChange();
  const id = setInterval(() => {
    clockMs = Date.now();
    onChange();
  }, 60_000);
  return () => clearInterval(id);
}

export function NowSpeakingBanner() {
  const nowMs = useSyncExternalStore(
    subscribeToClock,
    () => clockMs,
    () => 0,
  );

  return (
    <section
      role="status"
      aria-live="polite"
      className="w-full bg-indigo-600 px-4 py-3 text-center text-white"
    >
      {nowMs > 0 && (
        <span className="text-lg">
          <span className="font-bold uppercase tracking-wide">Now Speaking:</span>{' '}
          <span className="font-medium">{currentSessionTitle(new Date(nowMs))}</span>
        </span>
      )}
    </section>
  );
}

const feature: Feature = {
  id: 'now-speaking',
  slot: 'main',
  order: 1,
  Component: NowSpeakingBanner,
};

export default feature;

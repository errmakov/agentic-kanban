'use client';

import { useSyncExternalStore } from 'react';
import type { Feature } from '@/features/types';

type Session = { startISO: string; title: string };

// Local ISO strings (no trailing 'Z') so they parse as venue wall-clock time.
const SCHEDULE: Session[] = [
  { startISO: '2026-07-14T09:00:00', title: 'Opening Keynote' },
  { startISO: '2026-07-14T10:00:00', title: 'Build Session 1 — The Pull System' },
  { startISO: '2026-07-14T11:30:00', title: 'Build Session 2 — Agents on Stage' },
  { startISO: '2026-07-14T13:00:00', title: 'Lunch Break' },
  { startISO: '2026-07-14T14:00:00', title: 'Build Session 3 — Shipping Live' },
  { startISO: '2026-07-14T15:30:00', title: 'Q&A and Wrap-up' },
];

const sorted = [...SCHEDULE].sort((a, b) => a.startISO.localeCompare(b.startISO));

/** Pick the last session whose start time has passed; before the first, the first session. */
export function getCurrentSession(now: Date): { session: Session; upNext: boolean } | null {
  if (sorted.length === 0) return null;
  const nowMs = now.getTime();
  let current: Session | null = null;
  for (const session of sorted) {
    if (new Date(session.startISO).getTime() <= nowMs) current = session;
    else break;
  }
  if (current) return { session: current, upNext: false };
  return { session: sorted[0], upNext: true };
}

// Client-only clock, bucketed to the minute so the snapshot stays stable between ticks
// (useSyncExternalStore requires a cached snapshot). The banner only needs minute cadence.
let clockCache: number | null = null;
function getClockSnapshot(): number {
  const t = Date.now();
  if (clockCache === null || Math.floor(t / 60_000) !== Math.floor(clockCache / 60_000)) {
    clockCache = t;
  }
  return clockCache;
}
function subscribe(onChange: () => void): () => void {
  const id = setInterval(onChange, 1000 * 60);
  return () => clearInterval(id);
}

export function NowSpeaking() {
  // null on the server / first hydration pass → renders nothing (no hydration mismatch),
  // then re-renders with the real client time once mounted.
  const nowMs = useSyncExternalStore(subscribe, getClockSnapshot, () => null);
  if (nowMs === null) return null;

  const result = getCurrentSession(new Date(nowMs));
  if (!result) return null;

  return (
    <section
      aria-label="Now speaking"
      className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        {result.upNext ? 'Up next' : 'Now speaking'}
      </p>
      <p className="text-lg font-bold">{result.session.title}</p>
    </section>
  );
}

const feature: Feature = {
  id: 'now-speaking',
  slot: 'main',
  order: 0,
  Component: NowSpeaking,
};
export default feature;

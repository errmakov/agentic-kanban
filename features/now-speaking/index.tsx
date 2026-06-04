'use client';

import { useState, useEffect } from 'react';
import type { Feature } from '@/features/types';

const SCHEDULE = [
  { start: '09:00', title: 'Opening Keynote: The Agentic Future' },
  { start: '10:00', title: 'Building with Claude: Live Demo' },
  { start: '11:15', title: 'Kanban Pipelines for AI Agents' },
  { start: '12:30', title: 'Lunch Break' },
  { start: '14:00', title: 'Testing Strategies for LLM Apps' },
  { start: '15:30', title: 'Closing Panel: Ship It Live' },
];

export function getCurrentSession(
  schedule: typeof SCHEDULE,
  now: Date,
): { title: string; upcoming: boolean } | null {
  if (schedule.length === 0) return null;

  const toDate = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
  };

  const sorted = [...schedule].sort(
    (a, b) => toDate(a.start).getTime() - toDate(b.start).getTime(),
  );

  const past = sorted.filter((s) => toDate(s.start) <= now);
  if (past.length > 0) {
    return { title: past[past.length - 1].title, upcoming: false };
  }

  return { title: sorted[0].title, upcoming: true };
}

export function NowSpeaking() {
  const [session, setSession] = useState<{ title: string; upcoming: boolean } | null>(null);

  useEffect(() => {
    const update = () => setSession(getCurrentSession(SCHEDULE, new Date()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!session) return null;

  return (
    <div className="rounded-lg bg-neutral-100 px-6 py-4 flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
        {session.upcoming ? 'Up next' : 'Now speaking'}
      </span>
      <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
        {session.title}
      </span>
    </div>
  );
}

const feature: Feature = {
  id: 'now-speaking',
  slot: 'main',
  order: 10,
  Component: NowSpeaking,
};

export default feature;

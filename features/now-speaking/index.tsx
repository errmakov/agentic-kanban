'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

type Session = { hour: number; minute: number; title: string };

const SCHEDULE: readonly Session[] = [
  { hour: 9, minute: 0, title: 'Opening Keynote' },
  { hour: 10, minute: 0, title: 'Building Agentic Pipelines' },
  { hour: 11, minute: 30, title: 'Live Coding on Stage' },
  { hour: 13, minute: 0, title: 'Lunch & Networking' },
  { hour: 14, minute: 0, title: 'Scaling with AI Agents' },
  { hour: 15, minute: 30, title: 'Q&A Panel' },
  { hour: 16, minute: 30, title: 'Closing Remarks' },
];

/** Pick the session whose start time most recently passed; before the first, show it as upcoming. */
export function getCurrentSession(now: Date, schedule: readonly Session[]): string {
  if (schedule.length === 0) return 'No sessions scheduled';
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  for (let i = schedule.length - 1; i >= 0; i--) {
    const s = schedule[i];
    if (s.hour * 60 + s.minute <= minutesNow) return s.title;
  }
  return `Up next: ${schedule[0].title}`;
}

function NowSpeaking() {
  const [session, setSession] = useState<string>(() =>
    getCurrentSession(new Date(), SCHEDULE),
  );

  useEffect(() => {
    const tick = () => setSession(getCurrentSession(new Date(), SCHEDULE));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      aria-live="polite"
      className="rounded-xl border border-indigo-200 bg-indigo-50 px-6 py-4"
    >
      <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
        Now speaking
      </p>
      <h2 className="mt-1 text-2xl font-bold text-indigo-900">{session}</h2>
    </section>
  );
}

const feature: Feature = {
  id: 'now-speaking',
  slot: 'main',
  order: 10,
  Component: NowSpeaking,
};

export default feature;

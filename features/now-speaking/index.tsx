'use client';

import { useState, useEffect } from 'react';
import type { Feature } from '@/features/types';

interface Session {
  start: string;
  title: string;
}

const SCHEDULE: Session[] = [
  { start: '2026-06-03T09:00', title: 'Welcome & Intro to Agentic Pipelines' },
  { start: '2026-06-03T09:30', title: 'Building the Kanban Loop' },
  { start: '2026-06-03T10:15', title: 'SA/BA Agent Deep Dive' },
  { start: '2026-06-03T11:00', title: 'Dev Agent & Feature Slots' },
  { start: '2026-06-03T11:45', title: 'Test Agent & Quality Gates' },
  { start: '2026-06-03T13:00', title: 'Human Review & Deployment' },
  { start: '2026-06-03T13:45', title: 'Live Demo: Ship a Feature on Stage' },
  { start: '2026-06-03T14:30', title: 'Q&A & Wrap-up' },
];

export function getCurrentSession(
  schedule: Session[],
  now: Date,
): { title: string; isUpcoming: boolean } {
  const past = schedule.filter((s) => new Date(s.start) <= now);
  if (past.length === 0) {
    return { title: schedule[0].title, isUpcoming: true };
  }
  const current = past[past.length - 1];
  return { title: current.title, isUpcoming: false };
}

export function NowSpeaking() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    const tid = setTimeout(update, 0);
    const id = setInterval(update, 30_000);
    return () => {
      clearTimeout(tid);
      clearInterval(id);
    };
  }, []);

  if (now === null) return null;

  const { title, isUpcoming } = getCurrentSession(SCHEDULE, now);

  return (
    <div className="bg-amber-100 border border-amber-300 rounded-lg px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
        {isUpcoming ? 'Up next' : 'Now speaking'}
      </p>
      <p className="text-lg font-bold text-amber-900 mt-0.5">{title}</p>
    </div>
  );
}

const feature: Feature = {
  id: 'now-speaking',
  slot: 'main',
  order: 5,
  Component: NowSpeaking,
};

export default feature;

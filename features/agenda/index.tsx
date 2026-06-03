'use client';
import type { Feature } from '@/features/types';

const sessions = [
  { time: '09:00', title: 'Opening Keynote' },
  { time: '10:00', title: 'Building Features Live' },
  { time: '11:00', title: 'Coffee Break' },
  { time: '11:30', title: 'Agent Pipelines in Practice' },
  { time: '13:00', title: 'Lunch' },
  { time: '14:00', title: 'Closing Q&A' },
];

export function Agenda() {
  return (
    <section aria-labelledby="agenda-heading" className="space-y-4">
      <h2 id="agenda-heading" className="text-lg font-semibold">
        Today&apos;s Agenda
      </h2>
      <ul className="space-y-2">
        {sessions.map((session) => (
          <li key={session.time} className="flex gap-3">
            <time className="text-neutral-500 text-sm tabular-nums">{session.time}</time>
            <span className="font-medium">{session.title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const feature: Feature = {
  id: 'agenda',
  slot: 'main',
  order: 10,
  Component: Agenda,
};
export default feature;

'use client';

import type { Feature } from '@/features/types';

interface AgendaItem {
  time: string;
  title: string;
}

const AGENDA: AgendaItem[] = [
  { time: '09:00', title: 'Welcome & Setup' },
  { time: '09:30', title: 'Building Features Live with Agents' },
  { time: '11:00', title: 'The Kanban Pull System' },
  { time: '13:00', title: 'Lunch Break' },
  { time: '14:00', title: 'Scaling the Agent Pipeline' },
  { time: '16:00', title: 'Q&A and Wrap-up' },
];

export function DayAgenda() {
  if (AGENDA.length === 0) return null;

  return (
    <section aria-labelledby="day-agenda-heading" className="space-y-4">
      <h2 id="day-agenda-heading" className="text-lg font-semibold">
        Today&apos;s Agenda
      </h2>
      <ol className="space-y-2">
        {AGENDA.map((item) => (
          <li key={`${item.time}-${item.title}`} className="flex gap-4">
            <span className="font-mono tabular-nums text-neutral-500">{item.time}</span>
            <span className="break-words text-neutral-700">{item.title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

const feature: Feature = {
  id: 'day-agenda',
  slot: 'main',
  order: 10,
  Component: DayAgenda,
};

export default feature;

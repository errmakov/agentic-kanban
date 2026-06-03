import type { Feature } from '@/features/types';

const AGENDA = [
  { time: '09:00', title: 'Welcome & Intro' },
  { time: '09:30', title: 'Live Coding: Agentic Kanban' },
  { time: '10:30', title: 'Break' },
  { time: '10:45', title: 'Q&A / Demo' },
  { time: '11:30', title: 'Wrap-up' },
];

export function AgendaList() {
  return (
    <section aria-labelledby="agenda-heading" className="px-4 py-6">
      <h2 id="agenda-heading" className="text-xl font-semibold mb-4">
        Today&apos;s Agenda
      </h2>
      <ol className="space-y-2">
        {AGENDA.map(({ time, title }) => (
          <li key={time} className="flex gap-4">
            <span className="text-neutral-400 font-mono text-sm w-12 shrink-0">{time}</span>
            <span className="font-medium">{title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

const feature: Feature = {
  id: 'agenda-list',
  slot: 'main',
  order: 10,
  Component: AgendaList,
};
export default feature;

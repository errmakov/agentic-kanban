import type { Feature } from '@/features/types';

interface AgendaItem {
  time: string;
  title: string;
  speaker?: string;
}

const AGENDA: AgendaItem[] = [
  { time: '09:00', title: 'Doors open & coffee' },
  { time: '09:30', title: 'Keynote: Building live with agents', speaker: 'Anna Petrov' },
  { time: '10:30', title: 'Hands-on: your first agent feature' },
  { time: '12:00', title: 'Lunch break' },
  { time: '13:00', title: 'Deep dive: the Kanban pull system', speaker: 'Dmitri Sokolov' },
  { time: '15:00', title: 'Open floor & Q&A' },
];

export function Agenda() {
  return (
    <section aria-labelledby="agenda-heading" className="space-y-4">
      <h2 id="agenda-heading" className="text-lg font-semibold">
        Today&apos;s Agenda
      </h2>
      <ul className="divide-y divide-neutral-200">
        {AGENDA.map((item) => (
          <li key={`${item.time}-${item.title}`} className="flex gap-4 py-2">
            <span className="shrink-0 tabular-nums text-neutral-500">{item.time}</span>
            <span className="min-w-0 break-words">
              {item.title}
              {item.speaker ? (
                <span className="text-neutral-500"> — {item.speaker}</span>
              ) : null}
            </span>
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

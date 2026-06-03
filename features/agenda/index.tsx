import type { Feature } from '@/features/types';

type Session = { time: string; title: string };

const items: Session[] = [
  { time: '09:00', title: 'Doors open & coffee' },
  { time: '09:30', title: 'Welcome and intro to FactoryWall' },
  { time: '10:30', title: 'Building features live on stage' },
  { time: '12:30', title: 'Lunch break' },
  { time: '13:30', title: 'The agent pipeline, end to end' },
  { time: '15:30', title: 'Q&A and wrap-up' },
];

export function Agenda() {
  return (
    <section aria-labelledby="agenda-heading" className="space-y-4">
      <h2 id="agenda-heading" className="text-lg font-semibold">
        Today&rsquo;s Agenda
      </h2>
      {items.length === 0 ? (
        <p className="text-neutral-600">No sessions scheduled.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((session) => (
            <li key={session.time} className="flex gap-3">
              <span className="font-medium tabular-nums">{session.time}</span>
              <span className="break-words text-neutral-600">{session.title}</span>
            </li>
          ))}
        </ul>
      )}
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

import type { Feature } from '@/features/types';

const AGENDA: { time: string; title: string }[] = [
  { time: '09:00', title: 'Doors open & coffee' },
  { time: '09:30', title: 'Welcome & intro to the agent pipeline' },
  { time: '10:30', title: 'Building features live on stage' },
  { time: '12:00', title: 'Lunch break' },
  { time: '13:00', title: 'Hands-on: ship your own card' },
  { time: '15:00', title: 'Wrap-up & Q&A' },
];

function AgendaList() {
  return (
    <section aria-labelledby="agenda-heading" className="space-y-4">
      <h2 id="agenda-heading" className="text-lg font-semibold">
        Today&apos;s Agenda
      </h2>
      <ol className="space-y-2">
        {AGENDA.map((item) => (
          <li key={item.time} className="flex gap-3 text-neutral-600">
            <span className="shrink-0 font-mono font-medium text-neutral-900">
              {item.time}
            </span>
            <span className="break-words">{item.title}</span>
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

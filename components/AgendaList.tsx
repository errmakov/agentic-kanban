const AGENDA: { time: string; title: string }[] = [
  { time: '09:00', title: 'Doors open & coffee' },
  { time: '09:30', title: 'Keynote: Building software live with agents' },
  { time: '10:30', title: 'Hands-on: Shipping your first feature card' },
  { time: '12:00', title: 'Lunch break' },
  { time: '13:00', title: 'Deep dive: The Kanban pull system' },
  { time: '15:30', title: 'Wrap-up & open Q&A' },
];

export function AgendaList() {
  return (
    <section aria-labelledby="agenda-heading" className="space-y-3">
      <h3 id="agenda-heading" className="text-base font-semibold">
        Today&apos;s Agenda
      </h3>
      <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {AGENDA.map((item) => (
          <li key={item.time} className="flex gap-4 py-2">
            <span className="w-16 shrink-0 font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
              {item.time}
            </span>
            <span className="break-words text-foreground">{item.title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

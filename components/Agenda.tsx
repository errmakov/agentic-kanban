const agenda = [
  { time: '09:00', title: 'Doors open & coffee' },
  { time: '09:30', title: 'Keynote: Building software live with agents' },
  { time: '10:30', title: 'Workshop: Your first agent-shipped feature' },
  { time: '12:00', title: 'Lunch break' },
  { time: '13:00', title: 'Workshop: Scaling the Kanban pull system' },
  { time: '15:00', title: 'Wrap-up & open Q&A' },
];

export function Agenda() {
  return (
    <section aria-labelledby="agenda-heading" className="mt-12 space-y-4">
      <h2 id="agenda-heading" className="text-lg font-semibold">
        Agenda
      </h2>
      <ul className="space-y-2">
        {agenda.map((item) => (
          <li key={item.time} className="flex gap-4">
            <span className="w-16 shrink-0 font-mono text-neutral-500">
              {item.time}
            </span>
            <span className="break-words text-neutral-800">{item.title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

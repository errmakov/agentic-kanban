type AgendaItem = {
  time: string;
  session: string;
};

const AGENDA: AgendaItem[] = [
  { time: '08:30', session: 'Registration & Coffee' },
  { time: '09:00', session: 'Keynote: Building Live with Agents' },
  { time: '10:30', session: 'Break' },
  { time: '11:00', session: 'Hands-on Workshop' },
  { time: '12:30', session: 'Lunch' },
  { time: '13:30', session: 'Q&A and Wrap-up' },
];

export function Agenda() {
  return (
    <section aria-labelledby="agenda-heading" className="mt-12 space-y-4">
      <h2 id="agenda-heading" className="text-lg font-semibold">
        Today&apos;s Agenda
      </h2>
      <ol className="space-y-2">
        {AGENDA.map((item) => (
          <li key={`${item.time}-${item.session}`} className="flex gap-4">
            <span className="font-mono text-neutral-500 dark:text-neutral-400">
              {item.time}
            </span>
            <span className="break-words text-neutral-700 dark:text-neutral-300">
              {item.session}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

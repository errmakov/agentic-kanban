const SESSIONS = [
  { time: '09:00', title: 'Welcome & coffee' },
  { time: '09:15', title: 'Intro to agentic pipelines' },
  { time: '10:00', title: 'Building FactoryWall live on stage' },
  { time: '11:00', title: 'Break' },
  { time: '11:15', title: 'Kanban pull systems for AI agents' },
  { time: '12:00', title: 'Q&A and lunch' },
  { time: '13:00', title: 'Wrap-up & next steps' },
];

export function Agenda() {
  return (
    <section aria-labelledby="agenda-heading" className="space-y-4">
      <h2 id="agenda-heading" className="text-lg font-semibold">
        Today&apos;s Agenda
      </h2>
      <ul className="space-y-2">
        {SESSIONS.map((session) => (
          <li key={session.time} className="flex gap-4">
            <span className="font-mono tabular-nums text-neutral-500">
              {session.time}
            </span>
            <span>{session.title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

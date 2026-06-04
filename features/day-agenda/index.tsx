'use client';
import type { Feature } from '@/features/types';

const AGENDA = [
  { time: '09:00', title: 'Welcome & Intro' },
  { time: '09:30', title: 'The Agentic Loop: How the Pipeline Works' },
  { time: '10:15', title: 'Live Coding: Ship a Feature with AI Agents' },
  { time: '11:00', title: 'Coffee Break' },
  { time: '11:20', title: 'Parallel Agents & Conflict-Free Branching' },
  { time: '12:00', title: 'Lunch' },
  { time: '13:00', title: 'Hands-On Lab: Build Your Own Feature' },
  { time: '14:30', title: 'Q&A and Wrap-Up' },
];

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function activeAgendaIndex(nowMinutes: number): number {
  let idx = -1;
  for (let i = 0; i < AGENDA.length; i++) {
    if (toMinutes(AGENDA[i].time) <= nowMinutes) idx = i;
  }
  return idx;
}

export function DayAgenda() {
  const now = new Date();
  const activeIdx = activeAgendaIndex(now.getHours() * 60 + now.getMinutes());

  return (
    <section
      className="w-full max-w-xl mx-auto px-4 py-6"
      suppressHydrationWarning
    >
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
        Today&apos;s Agenda
      </h2>
      <ul className="space-y-2">
        {AGENDA.map((item, i) => {
          const isActive = i === activeIdx;
          return (
            <li
              key={item.time}
              className={[
                'flex items-baseline gap-3 rounded px-3 py-2 text-sm',
                isActive
                  ? 'border-l-4 border-blue-500 bg-blue-50 font-semibold'
                  : 'border-l-4 border-transparent',
              ].join(' ')}
              suppressHydrationWarning
            >
              <span className="w-12 shrink-0 tabular-nums text-gray-500">{item.time}</span>
              <span>{item.title}</span>
            </li>
          );
        })}
      </ul>
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

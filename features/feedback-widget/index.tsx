'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

type Counts = { up: number; down: number };

function FeedbackWidget() {
  const [counts, setCounts] = useState<Counts>({ up: 0, down: 0 });
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/feedback-widget')
      .then((res) => res.json())
      .then((data: Counts) => {
        if (active) setCounts(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  function vote(type: 'up' | 'down') {
    const prev = counts;
    setCounts((c) => ({ ...c, [type]: c[type] + 1 }));
    setVoting(true);
    fetch('/api/feedback-widget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote: type }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('vote failed');
        return res.json();
      })
      .then((data: Counts) => setCounts(data))
      .catch(() => setCounts(prev))
      .finally(() => setVoting(false));
  }

  return (
    <section className="flex justify-center gap-6" aria-label="Session feedback">
      <button
        type="button"
        onClick={() => vote('up')}
        disabled={voting}
        aria-label="Thumbs up"
        className="flex flex-col items-center gap-1 rounded-xl bg-neutral-100 px-6 py-3 transition-transform hover:bg-neutral-200 active:scale-95 disabled:opacity-50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      >
        <span className="text-3xl">👍</span>
        <span className="text-sm font-medium tabular-nums">{counts.up}</span>
      </button>
      <button
        type="button"
        onClick={() => vote('down')}
        disabled={voting}
        aria-label="Thumbs down"
        className="flex flex-col items-center gap-1 rounded-xl bg-neutral-100 px-6 py-3 transition-transform hover:bg-neutral-200 active:scale-95 disabled:opacity-50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      >
        <span className="text-3xl">👎</span>
        <span className="text-sm font-medium tabular-nums">{counts.down}</span>
      </button>
    </section>
  );
}

const feature: Feature = {
  id: 'feedback-widget',
  slot: 'main',
  order: 200,
  Component: FeedbackWidget,
};

export default feature;

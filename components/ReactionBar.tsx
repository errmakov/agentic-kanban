'use client';

import { useEffect, useState } from 'react';
import { EMOJIS } from '@/lib/emojis';

type Counts = Record<string, number>;

export function ReactionBar() {
  const [counts, setCounts] = useState<Counts>({});

  useEffect(() => {
    fetch('/api/reactions')
      .then((res) => res.json())
      .then((data) => setCounts(data.counts))
      .catch(() => {});
  }, []);

  function react(emoji: string) {
    fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    })
      .then((res) => res.json())
      .then((data) => setCounts(data.counts))
      .catch(() => {});
  }

  return (
    <div aria-label="Reactions" className="flex flex-wrap gap-3">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={`${emoji} reaction`}
          onClick={() => react(emoji)}
          className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-lg transition-transform hover:scale-105 active:scale-95"
        >
          <span aria-hidden="true">{emoji}</span>
          <span className="text-sm font-medium tabular-nums">{counts[emoji] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

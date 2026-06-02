'use client';

import { useEffect, useState } from 'react';

export const EMOJIS = ['👍', '❤️', '😂', '🎉', '🤯'] as const;

type Counts = Record<string, number>;

const initialCounts: Counts = Object.fromEntries(EMOJIS.map((e) => [e, 0]));

export function ReactionBar() {
  const [counts, setCounts] = useState<Counts>(initialCounts);

  useEffect(() => {
    fetch('/api/reactions')
      .then((res) => res.json())
      .then((data: Counts) => setCounts(data))
      .catch(() => {});
  }, []);

  const handleReact = (emoji: string) => {
    setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }));
    fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    })
      .then((res) => res.json())
      .then((data: Counts) => setCounts(data))
      .catch(() => {});
  };

  return (
    <div role="group" aria-label="Emoji reactions" className="flex justify-center gap-4">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleReact(emoji)}
          aria-label={`React with ${emoji}`}
          className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-transform active:scale-95 hover:bg-neutral-100"
        >
          <span className="text-2xl">{emoji}</span>
          <span className="text-sm tabular-nums text-neutral-600">{counts[emoji] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { EMOJIS, type ReactionCounts } from '@/lib/reactions';

export function ReactionBar() {
  const [counts, setCounts] = useState<ReactionCounts>({});

  useEffect(() => {
    fetch('/api/reactions')
      .then((res) => res.json())
      .then((data: ReactionCounts) => setCounts(data))
      .catch(() => {});
  }, []);

  async function handleReact(emoji: string) {
    const res = await fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    });
    if (res.ok) {
      setCounts((await res.json()) as ReactionCounts);
    }
  }

  return (
    <div role="group" aria-label="Reactions" className="flex gap-2">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleReact(emoji)}
          aria-label={`React with ${emoji}`}
          className="flex items-center gap-1 rounded-full border border-neutral-300 px-3 py-1 transition-transform active:scale-95"
        >
          <span aria-hidden="true">{emoji}</span>
          <span className="tabular-nums text-sm text-neutral-600">
            {counts[emoji] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}

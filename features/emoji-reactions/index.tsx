'use client';
import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

const ALLOWED_EMOJIS = ['👏', '🔥', '🤔', '💡'] as const;

type Counts = Record<string, number>;

function zeroedCounts(): Counts {
  return Object.fromEntries(ALLOWED_EMOJIS.map((e) => [e, 0]));
}

export function EmojiReactionBar() {
  const [counts, setCounts] = useState<Counts>(zeroedCounts);

  useEffect(() => {
    fetch('/api/emoji-reactions')
      .then((res) => res.json())
      .then((data: Counts) => setCounts(data))
      .catch(() => {});
  }, []);

  function react(emoji: string) {
    setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }));
    fetch('/api/emoji-reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    })
      .then((res) => res.json())
      .then((data: Counts) => setCounts(data))
      .catch(() => {});
  }

  return (
    <section aria-label="Emoji reactions" className="flex flex-wrap gap-3">
      {ALLOWED_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => react(emoji)}
          aria-label={`React with ${emoji}`}
          className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-lg transition-transform hover:scale-105 active:scale-95"
        >
          <span aria-hidden>{emoji}</span>
          <span className="text-sm font-medium tabular-nums">{counts[emoji] ?? 0}</span>
        </button>
      ))}
    </section>
  );
}

const feature: Feature = {
  id: 'emoji-reactions',
  slot: 'main',
  order: 10,
  Component: EmojiReactionBar,
};
export default feature;

'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

const EMOJIS = ['👍', '❤️', '😂', '🔥', '🎉', '🤯'] as const;

type Counts = Record<string, number>;

function EmojiReactionBar() {
  const [counts, setCounts] = useState<Counts>({});

  useEffect(() => {
    fetch('/api/emoji-reactions')
      .then((res) => res.json())
      .then((data: Counts) => setCounts(data))
      .catch(() => {});
  }, []);

  async function react(emoji: string) {
    const previous = counts;
    setCounts({ ...previous, [emoji]: (previous[emoji] ?? 0) + 1 });
    try {
      const res = await fetch('/api/emoji-reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      if (!res.ok) throw new Error('request failed');
      const data: Counts = await res.json();
      setCounts(data);
    } catch {
      setCounts(previous);
    }
  }

  return (
    <div
      role="group"
      aria-label="Emoji reactions"
      className="flex flex-wrap justify-center gap-3"
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => react(emoji)}
          aria-label={`React with ${emoji}`}
          className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 transition-transform hover:scale-105 active:scale-95 dark:border-white/15"
        >
          <span className="text-2xl">{emoji}</span>
          <span className="text-xs font-mono">{counts[emoji] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

const feature: Feature = {
  id: 'emoji-reactions',
  slot: 'main',
  order: 50,
  Component: EmojiReactionBar,
};

export default feature;

'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

const EMOJIS = ['👍', '❤️', '🔥', '👏', '😂'] as const;
type Counts = Record<string, number>;

function zeroCounts(): Counts {
  return Object.fromEntries(EMOJIS.map((e) => [e, 0]));
}

function EmojiReactionBar() {
  const [counts, setCounts] = useState<Counts>(zeroCounts);

  useEffect(() => {
    let active = true;
    fetch('/api/emoji-reaction-bar')
      .then((res) => res.json())
      .then((data: Counts) => {
        if (active) setCounts(data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  async function react(emoji: string) {
    const previous = counts;
    setCounts({ ...counts, [emoji]: (counts[emoji] ?? 0) + 1 });
    try {
      const res = await fetch('/api/emoji-reaction-bar', {
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
    <section className="flex flex-wrap justify-center gap-2" aria-label="Emoji reactions">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => react(emoji)}
          aria-label={`React with ${emoji}`}
          className="flex items-center gap-2 rounded-full border border-black/10 bg-white/5 px-4 py-2 text-lg transition-transform hover:scale-105 active:scale-95 dark:border-white/15"
        >
          <span aria-hidden>{emoji}</span>
          <span className="text-sm font-medium tabular-nums">{counts[emoji] ?? 0}</span>
        </button>
      ))}
    </section>
  );
}

const feature: Feature = {
  id: 'emoji-reaction-bar',
  slot: 'main',
  order: 10,
  Component: EmojiReactionBar,
};

export default feature;

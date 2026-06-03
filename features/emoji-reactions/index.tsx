'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

const EMOJIS = ['👍', '🔥', '❤️', '😂', '🚀'] as const;

type Counts = Record<string, number>;

function zeroed(): Counts {
  return Object.fromEntries(EMOJIS.map((emoji) => [emoji, 0]));
}

export function EmojiReactionBar() {
  const [counts, setCounts] = useState<Counts>(zeroed);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch('/api/emoji-reactions');
        const data = (await res.json()) as Counts;
        if (active) setCounts((prev) => ({ ...prev, ...data }));
      } catch {
        // leave state unchanged on failure
      }
    }

    load();
    const id = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  async function handleReact(emoji: string) {
    try {
      const res = await fetch('/api/emoji-reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as Counts;
      setCounts((prev) => ({ ...prev, ...data }));
    } catch {
      // leave state unchanged on failure
    }
  }

  return (
    <section className="flex flex-wrap justify-center gap-3" aria-label="Emoji reactions">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleReact(emoji)}
          aria-label={`React with ${emoji}`}
          className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-2xl transition hover:bg-neutral-100 active:scale-95"
        >
          <span>{emoji}</span>
          <span className="text-sm font-medium tabular-nums">{counts[emoji] ?? 0}</span>
        </button>
      ))}
    </section>
  );
}

const feature: Feature = {
  id: 'emoji-reactions',
  slot: 'main',
  order: 50,
  Component: EmojiReactionBar,
};

export default feature;

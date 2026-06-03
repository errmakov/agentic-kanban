'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

const EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥'] as const;

function EmojiReactionBar() {
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(EMOJIS.map((e) => [e, 0])),
  );

  useEffect(() => {
    let active = true;
    fetch('/api/emoji-reactions')
      .then((res) => res.json())
      .then((data: Record<string, number>) => {
        if (active) setCounts((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  function react(emoji: string) {
    setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }));
    fetch('/api/emoji-reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('reaction failed');
        return res.json();
      })
      .then((data: Record<string, number>) => setCounts((prev) => ({ ...prev, ...data })))
      .catch(() => {
        // Revert the optimistic increment on failure.
        setCounts((prev) => ({ ...prev, [emoji]: Math.max(0, (prev[emoji] ?? 1) - 1) }));
      });
  }

  return (
    <section className="flex flex-wrap justify-center gap-4" aria-label="Emoji reactions">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => react(emoji)}
          aria-label={`React with ${emoji}`}
          className="flex flex-col items-center gap-1 rounded-xl bg-neutral-100 p-3 transition-transform hover:bg-neutral-200 active:scale-95 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          <span className="text-2xl">{emoji}</span>
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

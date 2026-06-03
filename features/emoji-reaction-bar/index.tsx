'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

const EMOJIS = ['👍', '❤️', '🎉', '🚀'] as const;
type Counts = Record<string, number>;

function EmojiReactionBar() {
  const [counts, setCounts] = useState<Counts>({});

  useEffect(() => {
    fetch('/api/emoji-reactions')
      .then((res) => res.json())
      .then(setCounts)
      .catch(() => {});
  }, []);

  async function react(emoji: string) {
    setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }));
    try {
      const res = await fetch('/api/emoji-reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      setCounts(await res.json());
    } catch {
      const res = await fetch('/api/emoji-reactions');
      setCounts(await res.json());
    }
  }

  return (
    <div className="flex gap-3">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => react(emoji)}
          className="rounded-full px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-lg font-medium transition-colors active:scale-95"
          aria-label={`React with ${emoji}`}
        >
          {emoji} {counts[emoji] ?? 0}
        </button>
      ))}
    </div>
  );
}

const feature: Feature = {
  id: 'emoji-reaction-bar',
  slot: 'main',
  order: 10,
  Component: EmojiReactionBar,
};
export default feature;

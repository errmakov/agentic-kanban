'use client';
import { useState, useEffect } from 'react';
import type { Feature } from '@/features/types';

const EMOJI = ['👍', '❤️', '😂', '🎉', '🤯'];

export function EmojiReactionBar() {
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(EMOJI.map((e) => [e, 0])),
  );

  useEffect(() => {
    fetch('/api/emoji-reactions')
      .then((r) => r.json())
      .then((data) => setCounts(data.counts))
      .catch(() => {});
  }, []);

  async function handleClick(emoji: string) {
    setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }));
    try {
      const res = await fetch('/api/emoji-reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      const data = await res.json();
      setCounts(data.counts);
    } catch {
      setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 1) - 1 }));
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 py-4">
      {EMOJI.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleClick(emoji)}
          className="flex flex-col items-center gap-1 min-w-[56px] min-h-[56px] px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-transform"
          aria-label={`React with ${emoji}`}
        >
          <span className="text-2xl leading-none">{emoji}</span>
          <span className="text-xs font-semibold tabular-nums">{counts[emoji] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

const feature: Feature = {
  id: 'emoji-reactions',
  slot: 'main',
  order: 10,
  Component: EmojiReactionBar,
};
export default feature;

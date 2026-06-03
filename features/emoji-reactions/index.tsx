'use client';
import { useState, useEffect } from 'react';
import type { Feature } from '@/features/types';

const EMOJIS = ['👍', '❤️', '🔥', '🤔', '👏'];

export function EmojiReactions() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [popped, setPopped] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/emoji-reactions')
      .then((r) => r.json())
      .then((data) => setCounts(data.counts ?? {}))
      .catch(() => {});
  }, []);

  async function handleTap(emoji: string) {
    setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }));
    setPopped((prev) => ({ ...prev, [emoji]: true }));
    setTimeout(() => setPopped((prev) => ({ ...prev, [emoji]: false })), 150);

    try {
      const res = await fetch('/api/emoji-reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      if (res.ok) {
        const data = await res.json();
        setCounts(data.counts ?? {});
      }
    } catch {
      // silent failure — optimistic update stays visible
    }
  }

  return (
    <div className="flex justify-center gap-3 py-4">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleTap(emoji)}
          aria-label={`React with ${emoji}`}
          className={[
            'flex flex-col items-center gap-1 rounded-xl px-4 py-2',
            'bg-white/10 hover:bg-white/20 active:bg-white/30',
            'transition-transform duration-150',
            popped[emoji] ? 'scale-125' : 'scale-100',
          ].join(' ')}
        >
          <span className="text-2xl leading-none">{emoji}</span>
          <span className="text-xs font-medium tabular-nums">{counts[emoji] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

const feature: Feature = {
  id: 'emoji-reactions',
  slot: 'main',
  order: 50,
  Component: EmojiReactions,
};
export default feature;

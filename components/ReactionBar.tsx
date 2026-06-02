'use client';

import { useEffect, useState } from 'react';

const EMOJIS = ['👍', '❤️', '🔥', '👏', '🚀'];

function zeroCounts(): Record<string, number> {
  return Object.fromEntries(EMOJIS.map((emoji) => [emoji, 0]));
}

export function ReactionBar() {
  const [counts, setCounts] = useState<Record<string, number>>(zeroCounts);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch('/api/reactions');
        const data = (await res.json()) as { counts: Record<string, number> };
        if (active) setCounts(data.counts);
      } catch {
        // transient network error — the next poll will retry
      }
    };

    load();
    const interval = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleReact = async (emoji: string) => {
    setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }));
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      const data = (await res.json()) as { counts: Record<string, number> };
      if (data.counts) setCounts(data.counts);
    } catch {
      // optimistic update stands; the next poll will reconcile
    }
  };

  return (
    <section aria-label="Reactions" className="mt-8 flex flex-wrap gap-3">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleReact(emoji)}
          aria-label={`React with ${emoji} (${counts[emoji] ?? 0})`}
          className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-lg transition-transform hover:bg-neutral-100 active:scale-95"
        >
          <span aria-hidden="true">{emoji}</span>
          <span className="text-sm tabular-nums text-neutral-600">
            {counts[emoji] ?? 0}
          </span>
        </button>
      ))}
    </section>
  );
}

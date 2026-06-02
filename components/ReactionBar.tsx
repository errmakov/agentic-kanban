'use client';

import { useEffect, useState } from 'react';

const EMOJIS = ['👍', '❤️', '🔥', '👏', '😂'] as const;

type Counts = Record<string, number>;

export function ReactionBar() {
  const [counts, setCounts] = useState<Counts>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reactions')
      .then((res) => res.json())
      .then((data: Counts) => setCounts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function react(emoji: string) {
    const previous = counts;
    setCounts({ ...counts, [emoji]: (counts[emoji] ?? 0) + 1 });
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      if (!res.ok) throw new Error('request failed');
      setCounts(await res.json());
    } catch {
      setCounts(previous);
    }
  }

  if (loading) return null;

  return (
    <section aria-labelledby="reactions-heading" className="mt-8">
      <h2 id="reactions-heading" className="sr-only">
        Reactions
      </h2>
      <div role="group" aria-label="Reactions" className="flex flex-wrap gap-3">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`React with ${emoji}`}
            onClick={() => react(emoji)}
            className="flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-2xl transition-transform hover:bg-neutral-100 active:scale-95"
          >
            <span aria-hidden="true">{emoji}</span>
            <span className="text-sm tabular-nums text-neutral-600">{counts[emoji] ?? 0}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

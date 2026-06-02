'use client';

import { useEffect, useState } from 'react';
import { EMOJIS, zeroCounts, type ReactionCounts } from '@/lib/emojis';

export function ReactionBar() {
  const [counts, setCounts] = useState<ReactionCounts>(zeroCounts);
  const [pending, setPending] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/reactions')
      .then((res) => res.json())
      .then((data: ReactionCounts) => setCounts(data))
      .catch(() => {});
  }, []);

  async function react(emoji: string) {
    setPending((prev) => new Set(prev).add(emoji));
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      if (res.ok) {
        setCounts((await res.json()) as ReactionCounts);
      }
    } catch {
      // network failure: leave counts unchanged
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(emoji);
        return next;
      });
    }
  }

  return (
    <div role="group" aria-label="Reactions" className="mt-8 flex flex-wrap gap-3">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => react(emoji)}
          disabled={pending.has(emoji)}
          aria-label={`React with ${emoji}`}
          className="flex min-w-[4rem] items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-lg shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <span aria-hidden="true">{emoji}</span>
          <span className="text-base font-semibold tabular-nums text-neutral-700">
            {counts[emoji] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}

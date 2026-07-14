'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

const EMOJIS = ['👍', '❤️', '🔥', '🎉'] as const;
type Counts = Record<string, number>;

const zeroed = (): Counts => Object.fromEntries(EMOJIS.map((e) => [e, 0]));

export function EmojiReactionBar() {
  const [counts, setCounts] = useState<Counts>(zeroed);
  const [pending, setPending] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch('/api/emoji-reactions');
        const data = (await res.json()) as { counts: Counts };
        if (active) setCounts({ ...zeroed(), ...data.counts });
      } catch {
        // Leave the current counts in place on a transient fetch failure.
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
    if (pending.has(emoji)) return;
    setPending((prev) => new Set(prev).add(emoji));
    try {
      const res = await fetch('/api/emoji-reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      const data = (await res.json()) as { counts: Counts };
      if (data.counts) setCounts({ ...zeroed(), ...data.counts });
    } catch {
      // Leave the count unchanged so the user can retry.
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(emoji);
        return next;
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleReact(emoji)}
          disabled={pending.has(emoji)}
          aria-label={`React with ${emoji}`}
          className="flex flex-col items-center gap-1 rounded-lg border border-neutral-200 px-4 py-2 transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          <span className="text-2xl leading-none">{emoji}</span>
          <span className="text-sm font-medium tabular-nums">{counts[emoji] ?? 0}</span>
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

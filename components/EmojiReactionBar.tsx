'use client';

import { useState } from 'react';

const EMOJIS = ['👍', '❤️', '😂', '🎉', '🤯'] as const;

export function EmojiReactionBar() {
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(EMOJIS.map((emoji) => [emoji, 0])),
  );

  return (
    <section aria-labelledby="reactions-heading" className="mt-8 space-y-4">
      <h2 id="reactions-heading" className="text-lg font-semibold">
        Reactions
      </h2>
      <div className="flex flex-wrap gap-3">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`React with ${emoji}`}
            onClick={() =>
              setCounts((prev) => ({ ...prev, [emoji]: prev[emoji] + 1 }))
            }
            className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 transition-transform hover:bg-neutral-50 active:scale-110"
          >
            <span className="text-2xl">{emoji}</span>
            <span className="tabular-nums text-neutral-600">{counts[emoji]}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

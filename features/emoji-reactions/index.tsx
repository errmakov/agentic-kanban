'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Feature } from '@/features/types';
import { EmojiReactionBar } from './EmojiReactionBar';
import { emptyCounts, type Counts } from './emojis';

const POLL_MS = 3000;

function EmojiReactions() {
  const [counts, setCounts] = useState<Counts>(emptyCounts);
  const [disabled, setDisabled] = useState(false);
  const cooldown = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch('/api/emoji-reactions');
        if (!res.ok) return;
        const data = (await res.json()) as { counts: Counts };
        if (active) setCounts((prev) => ({ ...prev, ...data.counts }));
      } catch {
        // ignore transient fetch errors; next poll retries
      }
    }

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const react = useCallback((emoji: string) => {
    // Optimistic increment for instant feedback.
    setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }));

    // Brief cooldown to avoid a burst of duplicate POSTs on rapid taps.
    setDisabled(true);
    if (cooldown.current) clearTimeout(cooldown.current);
    cooldown.current = setTimeout(() => setDisabled(false), 500);

    fetch('/api/emoji-reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { counts: Counts } | null) => {
        if (data) setCounts((prev) => ({ ...prev, ...data.counts }));
      })
      .catch(() => {
        // ignore; a later poll will reconcile the true count
      });
  }, []);

  return (
    <section aria-label="Emoji reactions" className="space-y-2">
      <p className="text-sm text-neutral-500">Tap to react:</p>
      <EmojiReactionBar counts={counts} onReact={react} disabled={disabled} />
    </section>
  );
}

const feature: Feature = {
  id: 'emoji-reactions',
  slot: 'main',
  order: 10,
  Component: EmojiReactions,
};
export default feature;

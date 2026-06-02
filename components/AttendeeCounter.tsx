'use client';

import { useEffect, useState } from 'react';

const HEARTBEAT_MS = 30_000;

function viewerId(): string {
  try {
    const existing = localStorage.getItem('fw_viewer_id');
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem('fw_viewer_id', id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function AttendeeCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = viewerId();
    let active = true;

    async function beat() {
      try {
        const res = await fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        const data = (await res.json()) as { count: number };
        if (active) setCount(data.count);
      } catch {
        // transient network errors are non-fatal for a live counter
      }
    }

    beat();
    const interval = setInterval(beat, HEARTBEAT_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <span className="text-sm text-neutral-500" aria-live="polite">
      👁 {count} viewing
    </span>
  );
}

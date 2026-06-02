'use client';

import { useEffect, useState } from 'react';

const HEARTBEAT_MS = 15_000;

export function AttendeeCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let sessionId = localStorage.getItem('fw-session-id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('fw-session-id', sessionId);
    }

    async function heartbeat() {
      try {
        const res = await fetch('/api/attendees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        setCount(data.count);
      } catch {
        // Leave the displayed count unchanged on a failed beat.
      }
    }

    heartbeat();
    const interval = setInterval(heartbeat, HEARTBEAT_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <span aria-label="live viewer count" className="text-sm text-neutral-500">
      {count === null ? '—' : count} viewing
    </span>
  );
}

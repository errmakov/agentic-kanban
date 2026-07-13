'use client';

import { useEffect, useRef, useState } from 'react';
import type { Feature } from '@/features/types';

const POLL_INTERVAL_MS = 10_000;

function AttendeeCounter() {
  const [count, setCount] = useState<number | null>(null);
  const idRef = useRef<string>('');

  useEffect(() => {
    idRef.current = crypto.randomUUID();
    let active = true;

    const heartbeat = async () => {
      try {
        const res = await fetch('/api/attendee-counter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: idRef.current }),
        });
        const data = (await res.json()) as { count: number };
        if (active) setCount(data.count);
      } catch {
        // Ignore transient network errors; the next tick will retry.
      }
    };

    heartbeat();
    const timer = setInterval(heartbeat, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <span className="text-sm font-medium tabular-nums">
      👀 {count ?? '—'} watching
    </span>
  );
}

const feature: Feature = {
  id: 'attendee-counter',
  slot: 'header',
  order: 10,
  Component: AttendeeCounter,
};

export default feature;

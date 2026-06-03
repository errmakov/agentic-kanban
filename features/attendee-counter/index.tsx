'use client';

import { useEffect, useRef, useState } from 'react';
import type { Feature } from '@/features/types';

const HEARTBEAT_MS = 20_000;
const REFRESH_MS = 10_000;

export function AttendeeCounter() {
  const [count, setCount] = useState<number | null>(null);
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    if (sessionId.current == null) {
      sessionId.current = crypto.randomUUID();
    }

    const heartbeat = async () => {
      try {
        const res = await fetch('/api/attendee-counter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionId.current }),
        });
        const data = (await res.json()) as { count: number };
        if (active) setCount(data.count);
      } catch {
        // network hiccup — keep the last known count
      }
    };

    const refresh = async () => {
      try {
        const res = await fetch('/api/attendee-counter');
        const data = (await res.json()) as { count: number };
        if (active) setCount(data.count);
      } catch {
        // network hiccup — keep the last known count
      }
    };

    heartbeat();
    const heartbeatTimer = setInterval(heartbeat, HEARTBEAT_MS);
    const refreshTimer = setInterval(refresh, REFRESH_MS);

    return () => {
      active = false;
      clearInterval(heartbeatTimer);
      clearInterval(refreshTimer);
    };
  }, []);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700"
      aria-label="People watching the wall"
    >
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

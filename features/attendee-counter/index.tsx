'use client';

import { useEffect, useRef, useState } from 'react';
import type { Feature } from '@/features/types';

function AttendeeCounter() {
  const [count, setCount] = useState(0);
  const sessionId = useRef<string>('');

  useEffect(() => {
    let mounted = true;
    if (!sessionId.current) sessionId.current = crypto.randomUUID();

    async function heartbeat() {
      try {
        const res = await fetch('/api/attendee-counter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionId.current }),
        });
        const data = (await res.json()) as { count: number };
        if (mounted) setCount(data.count);
      } catch {
        // ignore transient network errors; next tick retries
      }
    }

    async function poll() {
      try {
        const res = await fetch('/api/attendee-counter');
        const data = (await res.json()) as { count: number };
        if (mounted) setCount(data.count);
      } catch {
        // ignore transient network errors; next tick retries
      }
    }

    heartbeat();
    const heartbeatId = setInterval(heartbeat, 30_000);
    const pollId = setInterval(poll, 10_000);

    return () => {
      mounted = false;
      clearInterval(heartbeatId);
      clearInterval(pollId);
    };
  }, []);

  return <span className="text-sm font-medium">👀 {count} watching</span>;
}

const feature: Feature = {
  id: 'attendee-counter',
  slot: 'header',
  order: 10,
  Component: AttendeeCounter,
};

export default feature;

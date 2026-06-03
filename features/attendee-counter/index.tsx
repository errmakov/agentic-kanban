'use client';
import { useState, useEffect, useRef } from 'react';
import type { Feature } from '@/features/types';

export function AttendeeCounter() {
  const [count, setCount] = useState<number | null>(null);
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId.current) {
      sessionId.current = crypto.randomUUID();
    }
    const id = sessionId.current;

    async function heartbeat() {
      const res = await fetch('/api/attendee-counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json()) as { count: number };
      setCount(data.count);
    }

    heartbeat();
    const interval = setInterval(heartbeat, 10_000);
    return () => clearInterval(interval);
  }, []);

  if (count === null) return <span className="text-sm font-medium">— watching</span>;
  return <span className="text-sm font-medium">👥 {count} watching</span>;
}

const feature: Feature = {
  id: 'attendee-counter',
  slot: 'header',
  order: 10,
  Component: AttendeeCounter,
};
export default feature;

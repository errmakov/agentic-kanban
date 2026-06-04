'use client';
import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

function getSessionId(): string {
  try {
    const key = 'attendee-counter-sid';
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function AttendeeCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sessionId = getSessionId();

    async function heartbeat() {
      const res = await fetch('/api/attendee-counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await res.json()) as { count: number };
      setCount(data.count);
    }

    async function poll() {
      const res = await fetch('/api/attendee-counter');
      const data = (await res.json()) as { count: number };
      setCount(data.count);
    }

    heartbeat();
    const heartbeatInterval = setInterval(heartbeat, 30_000);
    const pollInterval = setInterval(poll, 10_000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(pollInterval);
    };
  }, []);

  return (
    <span className="text-sm font-medium text-neutral-600">
      👁 {count} watching
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

'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

const SESSION_KEY = 'fw-session-id';
const HEARTBEAT_MS = 15_000;

function getSessionId(): string {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}

function AttendeeCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const sessionId = getSessionId();
    let cancelled = false;

    async function sendHeartbeat() {
      try {
        const res = await fetch('/api/attendee-counter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { count: number };
        if (!cancelled) setCount(data.count);
      } catch {
        // Network hiccup or cold start — keep the last known count and retry next tick.
      }
    }

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, HEARTBEAT_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <span className="text-sm font-medium text-neutral-500">
      👀 {count ?? '–'} watching
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

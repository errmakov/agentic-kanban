'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

const HEARTBEAT_INTERVAL_MS = 20_000;
const REFRESH_INTERVAL_MS = 10_000;

function getSessionId(): string {
  const existing = sessionStorage.getItem('attendee-session-id');
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem('attendee-session-id', id);
  return id;
}

function AttendeeCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const sessionId = getSessionId();

    const heartbeat = () =>
      fetch('/api/attendee-counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});

    const refresh = () =>
      fetch('/api/attendee-counter')
        .then((res) => res.json())
        .then((data: { count: number }) => setCount(data.count))
        .catch(() => {});

    heartbeat();
    refresh();

    const heartbeatTimer = setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);
    const refreshTimer = setInterval(refresh, REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(heartbeatTimer);
      clearInterval(refreshTimer);
    };
  }, []);

  return (
    <span className="text-sm font-medium text-neutral-500">
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

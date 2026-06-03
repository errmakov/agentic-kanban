'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

const SESSION_KEY = 'aw-session-id';

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function AttendeeCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const sessionId = getSessionId();

    const heartbeat = () => {
      fetch('/api/attendee-counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    };

    const poll = () => {
      fetch('/api/attendee-counter')
        .then((res) => res.json())
        .then((data: { count: number }) => setCount(data.count))
        .catch(() => {});
    };

    heartbeat();
    poll();

    const heartbeatTimer = setInterval(heartbeat, 30_000);
    const pollTimer = setInterval(poll, 10_000);

    return () => {
      clearInterval(heartbeatTimer);
      clearInterval(pollTimer);
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

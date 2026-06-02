'use client';

import { useEffect, useState } from 'react';

const SESSION_KEY = 'fw-session-id';
const HEARTBEAT_MS = 15_000;
const POLL_MS = 10_000;

export function AttendeeCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    const heartbeat = () => {
      fetch('/api/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    };

    const refresh = () => {
      fetch('/api/attendees')
        .then((res) => res.json())
        .then((data: { count: number }) => setCount(data.count))
        .catch(() => {});
    };

    heartbeat();
    refresh();

    const heartbeatTimer = setInterval(heartbeat, HEARTBEAT_MS);
    const pollTimer = setInterval(refresh, POLL_MS);

    return () => {
      clearInterval(heartbeatTimer);
      clearInterval(pollTimer);
    };
  }, []);

  return (
    <span className="mt-3 block text-sm text-neutral-500">
      {count === null ? '—' : `${count} watching`}
    </span>
  );
}

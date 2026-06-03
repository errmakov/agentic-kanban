'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

const HEARTBEAT_MS = 30_000;
const POLL_MS = 10_000;

function getSessionId(): string {
  const existing = sessionStorage.getItem('attendee-session-id');
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem('attendee-session-id', id);
  return id;
}

export function AttendeeCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const sessionId = getSessionId();
    let active = true;

    const apply = (data: { count: number }) => {
      if (active) setCount(data.count);
    };

    const heartbeat = async () => {
      try {
        const res = await fetch('/api/attendee-counter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        apply(await res.json());
      } catch {
        // keep last known count
      }
    };

    const poll = async () => {
      try {
        const res = await fetch('/api/attendee-counter');
        apply(await res.json());
      } catch {
        // keep last known count
      }
    };

    heartbeat();
    const heartbeatId = setInterval(heartbeat, HEARTBEAT_MS);
    const pollId = setInterval(poll, POLL_MS);

    return () => {
      active = false;
      clearInterval(heartbeatId);
      clearInterval(pollId);
    };
  }, []);

  return (
    <span className="text-sm font-medium text-neutral-500">
      👀 {count ?? '…'} watching
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

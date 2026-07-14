'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

const POLL_MS = 5000;

function AttendeeCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function refresh() {
      try {
        const res = await fetch('/api/attendee-counter', {
          signal: controller.signal,
        });
        const data = await res.json();
        if (typeof data.count === 'number') {
          setCount(data.count);
        }
      } catch {
        // Network error / abort — keep the last known count.
      }
    }

    refresh();
    const id = setInterval(refresh, POLL_MS);

    return () => {
      clearInterval(id);
      controller.abort();
    };
  }, []);

  return (
    <span className="text-sm font-medium text-neutral-600">
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

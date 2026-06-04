'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Set the time post-mount so the server-rendered placeholder avoids a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (now === null) {
    return (
      <time className="text-sm font-medium tabular-nums text-neutral-500">
        ——:——:——
      </time>
    );
  }

  return (
    <time
      dateTime={now.toISOString()}
      className="text-sm font-medium tabular-nums text-neutral-500"
    >
      {now.toLocaleTimeString()}
    </time>
  );
}

const feature: Feature = {
  id: 'live-clock',
  slot: 'header',
  order: 20,
  Component: LiveClock,
};

export default feature;

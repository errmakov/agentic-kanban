'use client';
import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

export function LiveClock() {
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setDate(new Date());
    const initial = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);

  const formatted = date ? date.toLocaleTimeString() : '--:--:--';

  return (
    <time dateTime={date?.toISOString() ?? ''} className="text-sm font-medium font-mono text-neutral-600">
      {formatted}
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

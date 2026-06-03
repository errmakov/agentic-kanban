'use client';
import { useState, useEffect } from 'react';
import type { Feature } from '@/features/types';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function LiveClock() {
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    setDate(new Date());
    const interval = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = date
    ? `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    : '--:--:--';

  return (
    <time dateTime={date?.toISOString() ?? ''} className="text-sm font-medium tabular-nums">
      {timeStr}
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

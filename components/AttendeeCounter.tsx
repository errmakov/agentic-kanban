'use client';

import { useEffect, useState } from 'react';

export function AttendeeCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const source = new EventSource('/api/attendees');
    source.onmessage = (e) => {
      setCount(parseInt(e.data, 10));
    };
    return () => source.close();
  }, []);

  if (count === null) {
    return null;
  }

  return (
    <span className="text-sm text-neutral-500">
      👤 {count} online
    </span>
  );
}

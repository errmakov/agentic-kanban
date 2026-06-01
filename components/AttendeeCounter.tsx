'use client';

import { useEffect, useState } from 'react';

export function AttendeeCounter() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const source = new EventSource('/api/viewers');
    source.onmessage = (event) => {
      setCount(Number(event.data));
    };
    return () => source.close();
  }, []);

  return (
    <span
      aria-label="Attendees viewing"
      className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700"
    >
      {count} viewing
    </span>
  );
}

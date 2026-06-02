'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'fw-viewer-id';
const POLL_MS = 15_000;

export function AttendeeCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let id = sessionStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2);
      sessionStorage.setItem(STORAGE_KEY, id);
    }

    const url = `/api/viewers?id=${encodeURIComponent(id)}`;

    const poll = async () => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        setCount(data.count);
      } catch {
        // transient network errors leave the last known count in place
      }
    };

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  if (count === null) {
    return null;
  }

  return <span className="text-sm text-neutral-500">{count} viewing</span>;
}

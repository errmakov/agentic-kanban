'use client';

import { useEffect, useState } from 'react';

export function NowSpeakingBanner() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/session')
      .then((res) => res.json())
      .then((data) => {
        if (active) setName(typeof data.name === 'string' ? data.name : '');
      })
      .catch(() => {
        if (active) setName('');
      });
    return () => {
      active = false;
    };
  }, []);

  if (!name) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-neutral-900 px-6 py-3 text-white"
    >
      <div className="mx-auto flex w-full max-w-3xl items-baseline gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Now Speaking
        </span>
        <span className="truncate text-lg font-semibold">{name}</span>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

export function NowSpeakingBanner() {
  const [session, setSession] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/now-speaking')
      .then((res) => res.json())
      .then((data) => {
        if (active && typeof data?.session === 'string') setSession(data.session);
      })
      .catch(() => {
        /* API unreachable — keep the banner hidden */
      });
    return () => {
      active = false;
    };
  }, []);

  if (!session.trim()) return null;

  return (
    <section
      className="w-full rounded-lg border border-amber-300 bg-amber-50 px-6 py-4 text-amber-900"
      aria-label="Now speaking"
    >
      <span className="text-sm font-medium uppercase tracking-wide">Now speaking:</span>
      <p className="text-2xl font-bold">{session}</p>
    </section>
  );
}

const feature: Feature = {
  id: 'now-speaking',
  slot: 'main',
  order: 0,
  Component: NowSpeakingBanner,
};

export default feature;

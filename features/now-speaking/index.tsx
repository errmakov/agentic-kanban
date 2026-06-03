'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

const POLL_MS = 30_000;

function NowSpeakingBanner() {
  const [session, setSession] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch('/api/now-speaking');
        if (!res.ok) return;
        const data = (await res.json()) as { session?: string };
        if (active) setSession(typeof data.session === 'string' ? data.session : '');
      } catch {
        // ignore transient fetch errors; keep the last known session
      }
    }

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (!session.trim()) return null;

  return (
    <section
      aria-label="Now speaking"
      className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-center text-white shadow-md"
    >
      <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
        Now speaking
      </span>
      <p className="text-lg font-bold sm:text-xl">{session}</p>
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

'use client';
import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

function NowSpeakingBanner() {
  const [session, setSession] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/now-speaking');
        const data = (await res.json()) as { session?: string };
        if (active) setSession(typeof data.session === 'string' ? data.session.trim() : '');
      } catch {
        // ignore transient fetch errors; keep last known session
      }
    };
    load();
    const id = setInterval(load, 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (!session) return null;

  return (
    <section
      aria-label="Now speaking"
      className="w-full rounded-lg bg-[var(--foreground)] px-6 py-4 text-[var(--background)]"
    >
      <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Now Speaking</p>
      <p className="text-2xl font-bold sm:text-3xl">{session}</p>
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

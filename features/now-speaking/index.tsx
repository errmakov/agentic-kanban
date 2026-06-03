'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

function NowSpeakingBanner() {
  const [title, setTitle] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch('/api/now-speaking');
        const data = (await res.json()) as { title?: string };
        if (active) setTitle(typeof data.title === 'string' ? data.title : '');
      } catch {
        // keep the last known title on a transient fetch failure
      }
    };

    load();
    const id = setInterval(load, 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (!title) return null;

  return (
    <section
      aria-label="Now speaking"
      className="w-full bg-neutral-900 px-6 py-4 text-white"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        Now Speaking
      </p>
      <h2 className="line-clamp-2 text-2xl font-bold sm:text-3xl">{title}</h2>
    </section>
  );
}

const feature: Feature = {
  id: 'now-speaking',
  slot: 'main',
  order: 10,
  Component: NowSpeakingBanner,
};

export default feature;

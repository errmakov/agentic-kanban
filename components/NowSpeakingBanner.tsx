'use client';

import { useEffect, useState } from 'react';

export function NowSpeakingBanner() {
  const [session, setSession] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/now-speaking')
      .then((res) => res.json())
      .then((data) => {
        if (active) setSession(data.session ?? null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!session) return null;

  return (
    <div role="banner" className="bg-neutral-900 px-6 py-3 text-center text-white">
      <p className="text-sm">
        <span className="uppercase tracking-wide text-neutral-400">Now speaking: </span>
        <strong className="font-semibold">{session}</strong>
      </p>
    </div>
  );
}

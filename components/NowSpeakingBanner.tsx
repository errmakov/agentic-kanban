'use client';

import { useEffect, useState } from 'react';

export function NowSpeakingBanner() {
  const [session, setSession] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/now-speaking')
      .then((res) => res.json())
      .then((data: { session: string | null }) => setSession(data.session))
      .catch(() => setSession(null));
  }, []);

  if (!session) {
    return null;
  }

  return (
    <section
      role="status"
      className="w-full bg-neutral-900 px-6 py-4 text-center text-white"
    >
      <p className="text-sm uppercase tracking-wide text-neutral-400">Now speaking</p>
      <p className="text-2xl font-bold">{session}</p>
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';

export function NowSpeaking() {
  const [session, setSession] = useState('');

  useEffect(() => {
    fetch('/api/now-speaking')
      .then((res) => res.json())
      .then((data) => setSession(typeof data?.session === 'string' ? data.session : ''))
      .catch(() => setSession(''));
  }, []);

  if (!session) {
    return null;
  }

  return (
    <div
      role="status"
      className="w-full bg-neutral-900 px-6 py-3 text-center text-white"
    >
      <span className="text-sm uppercase tracking-wide text-neutral-400">
        Now speaking:
      </span>{' '}
      <span className="font-semibold">{session}</span>
    </div>
  );
}

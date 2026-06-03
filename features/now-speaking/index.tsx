'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

function NowSpeaking() {
  const [session, setSession] = useState('');
  const [draft, setDraft] = useState('');

  function load() {
    return fetch('/api/now-speaking')
      .then((res) => res.json() as Promise<{ session: string }>)
      .then((data) => {
        setSession(data.session);
        setDraft(data.session);
      });
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/now-speaking', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: draft }),
    });
    await load();
  }

  return (
    <div className="w-full">
      {session && (
        <section className="w-full rounded-lg bg-neutral-900 px-6 py-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Now speaking
          </p>
          <p className="mt-1 truncate text-2xl font-bold sm:text-3xl">{session}</p>
        </section>
      )}
      <form onSubmit={save} className="mt-2 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Set the current session…"
          aria-label="Current session name"
          className="flex-1 rounded border border-neutral-300 px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          className="rounded bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white"
        >
          Save
        </button>
      </form>
    </div>
  );
}

const feature: Feature = {
  id: 'now-speaking',
  slot: 'main',
  order: 1,
  Component: NowSpeaking,
};

export default feature;

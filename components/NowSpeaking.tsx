'use client';

import { FormEvent, useEffect, useState } from 'react';

export function NowSpeaking() {
  const [session, setSession] = useState('');
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetch('/api/now-speaking')
      .then((res) => res.json())
      .then((data) => setSession(typeof data?.session === 'string' ? data.session : ''))
      .catch(() => setSession(''));
  }, []);

  function startEditing() {
    setDraft(session);
    setEditing(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = draft.trim();
    setSession(next);
    setEditing(false);
    try {
      await fetch('/api/now-speaking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: next }),
      });
    } catch {
      // Banner still reflects the local value if the write fails.
    }
  }

  return (
    <div className="w-full bg-neutral-900 px-6 py-3 text-center text-white">
      {editing ? (
        <form onSubmit={handleSubmit} className="flex items-center justify-center gap-2">
          <label
            htmlFor="now-speaking-input"
            className="text-sm uppercase tracking-wide text-neutral-400"
          >
            Now speaking:
          </label>
          <input
            id="now-speaking-input"
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Session name"
            className="rounded bg-neutral-800 px-2 py-1 text-white placeholder:text-neutral-500"
          />
          <button
            type="submit"
            className="rounded bg-white px-3 py-1 font-semibold text-neutral-900"
          >
            Save
          </button>
        </form>
      ) : session ? (
        <p role="status">
          <span className="text-sm uppercase tracking-wide text-neutral-400">Now speaking:</span>{' '}
          <span className="font-semibold">{session}</span>{' '}
          <button
            type="button"
            onClick={startEditing}
            className="ml-2 text-sm text-neutral-400 underline"
          >
            Edit
          </button>
        </p>
      ) : (
        <button
          type="button"
          onClick={startEditing}
          className="text-sm text-neutral-400 underline"
        >
          Set who&rsquo;s speaking
        </button>
      )}
    </div>
  );
}

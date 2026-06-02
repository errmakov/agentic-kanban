'use client';

import { useEffect, useState } from 'react';

const VOTE_KEY = 'fw_feedback_vote';

type Vote = 'up' | 'down';

function storedVote(): Vote | null {
  try {
    const value = localStorage.getItem(VOTE_KEY);
    return value === 'up' || value === 'down' ? value : null;
  } catch {
    return null;
  }
}

export function FeedbackWidget() {
  const [up, setUp] = useState(0);
  const [down, setDown] = useState(0);
  const [voted, setVoted] = useState<Vote | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setVoted(storedVote());
      try {
        const res = await fetch('/api/feedback');
        const data = (await res.json()) as { up: number; down: number };
        if (active) {
          setUp(data.up);
          setDown(data.down);
        }
      } catch {
        // initial counts default to 0 on failure
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function vote(choice: Vote) {
    if (voted) return;
    setVoted(choice);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: choice }),
      });
      const data = (await res.json()) as { up: number; down: number };
      setUp(data.up);
      setDown(data.down);
    } catch {
      // network errors are non-fatal for a live tally
    }
    try {
      localStorage.setItem(VOTE_KEY, choice);
    } catch {
      // localStorage may be unavailable (private browsing)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-neutral-500">How&apos;s the session?</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => vote('up')}
          disabled={voted !== null}
          aria-label="Thumbs up"
          aria-pressed={voted === 'up'}
          className={`rounded-md border border-neutral-300 px-3 py-1 text-sm dark:border-neutral-700 ${
            voted === 'up' ? 'font-bold ring-2 ring-green-500' : ''
          } disabled:opacity-60`}
        >
          👍 {up}
        </button>
        <button
          type="button"
          onClick={() => vote('down')}
          disabled={voted !== null}
          aria-label="Thumbs down"
          aria-pressed={voted === 'down'}
          className={`rounded-md border border-neutral-300 px-3 py-1 text-sm dark:border-neutral-700 ${
            voted === 'down' ? 'font-bold ring-2 ring-red-500' : ''
          } disabled:opacity-60`}
        >
          👎 {down}
        </button>
      </div>
    </div>
  );
}

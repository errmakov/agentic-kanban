'use client';

import { useEffect, useState } from 'react';
import { SPEAKERS } from './speakers';

type Tally = { up: number; down: number };
type Tallies = Record<string, Tally>;
type Vote = 'up' | 'down';

const votedKey = (speakerId: string) => `speaker-bio-cards:voted:${speakerId}`;

export function SpeakerBioCards() {
  const [tallies, setTallies] = useState<Tallies>({});
  const [voted, setVoted] = useState<Record<string, Vote>>({});

  useEffect(() => {
    const stored: Record<string, Vote> = {};
    if (typeof window !== 'undefined') {
      for (const speaker of SPEAKERS) {
        const value = window.localStorage.getItem(votedKey(speaker.id));
        if (value === 'up' || value === 'down') stored[speaker.id] = value;
      }
    }
    fetch('/api/speaker-bio-cards')
      .then((res) => res.json())
      .then((data: { tallies: Tallies }) => {
        setTallies(data.tallies);
        setVoted(stored);
      })
      .catch(() => setVoted(stored));
  }, []);

  async function castVote(speakerId: string, vote: Vote) {
    if (voted[speakerId]) return;

    const previous = tallies[speakerId] ?? { up: 0, down: 0 };
    setTallies((prev) => ({
      ...prev,
      [speakerId]: { ...previous, [vote]: previous[vote] + 1 },
    }));
    setVoted((prev) => ({ ...prev, [speakerId]: vote }));
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(votedKey(speakerId), vote);
    }

    try {
      const res = await fetch('/api/speaker-bio-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speakerId, vote }),
      });
      if (!res.ok) throw new Error('request failed');
      const data: { speakerId: string; tally: Tally } = await res.json();
      setTallies((prev) => ({ ...prev, [data.speakerId]: data.tally }));
    } catch {
      setTallies((prev) => ({ ...prev, [speakerId]: previous }));
      setVoted((prev) => {
        const next = { ...prev };
        delete next[speakerId];
        return next;
      });
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(votedKey(speakerId));
      }
    }
  }

  return (
    <section aria-labelledby="speaker-bio-cards-heading" className="w-full">
      <h2 id="speaker-bio-cards-heading" className="mb-4 text-center text-xl font-semibold">
        Meet the Speakers
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SPEAKERS.map((speaker) => {
          const tally = tallies[speaker.id] ?? { up: 0, down: 0 };
          const speakerVote = voted[speaker.id];
          const hasVoted = Boolean(speakerVote);
          return (
            <article
              key={speaker.id}
              className="flex flex-col gap-2 rounded-xl border border-black/10 p-4 dark:border-white/15"
            >
              <h3 className="text-base font-semibold">{speaker.name}</h3>
              <p className="text-xs font-medium uppercase tracking-wide opacity-60">
                {speaker.role}
              </p>
              <p className="flex-1 text-sm opacity-80">{speaker.bio}</p>
              <div role="group" aria-label={`Rate ${speaker.name}`} className="flex gap-2">
                <button
                  type="button"
                  onClick={() => castVote(speaker.id, 'up')}
                  disabled={hasVoted}
                  aria-label={`Thumbs up for ${speaker.name}`}
                  aria-pressed={speakerVote === 'up'}
                  className={`flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 transition-transform enabled:hover:scale-105 enabled:active:scale-95 disabled:opacity-50 dark:border-white/15 ${
                    speakerVote === 'up' ? 'bg-green-500/15' : ''
                  }`}
                >
                  <span className="text-lg">👍</span>
                  <span className="text-xs font-mono">{tally.up}</span>
                </button>
                <button
                  type="button"
                  onClick={() => castVote(speaker.id, 'down')}
                  disabled={hasVoted}
                  aria-label={`Thumbs down for ${speaker.name}`}
                  aria-pressed={speakerVote === 'down'}
                  className={`flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 transition-transform enabled:hover:scale-105 enabled:active:scale-95 disabled:opacity-50 dark:border-white/15 ${
                    speakerVote === 'down' ? 'bg-red-500/15' : ''
                  }`}
                >
                  <span className="text-lg">👎</span>
                  <span className="text-xs font-mono">{tally.down}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';

type Tally = { up: number; down: number };
type Ratings = Record<string, Tally>;

type Speaker = {
  id: string;
  name: string;
  role: string;
  bio: string;
};

const SPEAKERS: Speaker[] = [
  {
    id: 'ada-lovelace',
    name: 'Ada Lovelace',
    role: 'Principal Engineer',
    bio: 'Wrote the first algorithm intended for a machine.',
  },
  {
    id: 'grace-hopper',
    name: 'Grace Hopper',
    role: 'Compiler Pioneer',
    bio: 'Invented the first compiler and popularized machine-independent languages.',
  },
  {
    id: 'alan-turing',
    name: 'Alan Turing',
    role: 'Research Lead',
    bio: 'Laid the foundations of computation and modern computing.',
  },
];

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function SpeakerBioCards() {
  const [ratings, setRatings] = useState<Ratings>({});

  useEffect(() => {
    fetch('/api/speaker-bio-cards')
      .then((res) => res.json())
      .then((data: Ratings) => setRatings(data))
      .catch(() => {});
  }, []);

  async function vote(speakerId: string, direction: 'up' | 'down') {
    try {
      const res = await fetch('/api/speaker-bio-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speakerId, vote: direction }),
      });
      if (!res.ok) return;
      const tally: Tally = await res.json();
      setRatings((prev) => ({ ...prev, [speakerId]: tally }));
    } catch {
      // network error — allow the user to retry
    }
  }

  return (
    <section aria-labelledby="speakers-heading" className="space-y-4">
      <h2 id="speakers-heading" className="text-lg font-semibold">
        Speakers
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SPEAKERS.map((speaker) => {
          const tally = ratings[speaker.id] ?? { up: 0, down: 0 };
          return (
            <article
              key={speaker.id}
              className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-500 font-semibold text-white">
                  {initials(speaker.name)}
                </div>
                <div>
                  <h3 className="font-semibold">{speaker.name}</h3>
                  <p className="text-sm text-neutral-600">{speaker.role}</p>
                </div>
              </div>
              <p className="text-sm">{speaker.bio}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label={`Thumbs up for ${speaker.name}`}
                  onClick={() => vote(speaker.id, 'up')}
                  className="flex items-center gap-1 rounded-md border border-neutral-200 px-3 py-1 text-sm hover:bg-neutral-100"
                >
                  👍 <span>{tally.up}</span>
                </button>
                <button
                  type="button"
                  aria-label={`Thumbs down for ${speaker.name}`}
                  onClick={() => vote(speaker.id, 'down')}
                  className="flex items-center gap-1 rounded-md border border-neutral-200 px-3 py-1 text-sm hover:bg-neutral-100"
                >
                  👎 <span>{tally.down}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

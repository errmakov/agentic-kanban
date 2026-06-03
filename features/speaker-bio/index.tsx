'use client';
import { useState, useEffect } from 'react';
import type { Feature } from '@/features/types';

type VoteTally = { up: number; down: number };
type Tallies = Record<string, VoteTally>;

const SPEAKERS = [
  {
    id: 'alex-rivera',
    name: 'Alex Rivera',
    role: 'Staff Engineer, Distributed Systems',
    bio: 'Alex has spent the last decade building fault-tolerant data pipelines at scale and loves turning war stories into teachable patterns.',
  },
  {
    id: 'priya-nair',
    name: 'Priya Nair',
    role: 'Principal Product Designer',
    bio: 'Priya bridges the gap between engineering constraints and delightful user experiences, with a focus on accessibility-first design.',
  },
  {
    id: 'sam-okonkwo',
    name: 'Sam Okonkwo',
    role: 'Developer Advocate',
    bio: 'Sam turns complex developer tooling into approachable workshops and has facilitated sessions at over thirty international conferences.',
  },
  {
    id: 'maya-chen',
    name: 'Maya Chen',
    role: 'AI/ML Engineer',
    bio: 'Maya builds production machine-learning systems and is passionate about making model evaluation rigorous and reproducible.',
  },
];

export function SpeakerBioCards() {
  const [tallies, setTallies] = useState<Tallies>({});

  useEffect(() => {
    fetch('/api/speaker-bio')
      .then((r) => r.json())
      .then((data: Tallies) => setTallies(data));
  }, []);

  async function handleVote(speakerId: string, vote: 'up' | 'down') {
    setTallies((prev) => {
      const current = prev[speakerId] ?? { up: 0, down: 0 };
      return { ...prev, [speakerId]: { ...current, [vote]: current[vote] + 1 } };
    });

    const res = await fetch('/api/speaker-bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speakerId, vote }),
    });
    const updated = (await res.json()) as Tallies;
    setTallies(updated);
  }

  return (
    <section className="w-full py-6 px-4">
      <h2 className="text-xl font-semibold mb-4">Speakers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SPEAKERS.map((speaker) => {
          const tally = tallies[speaker.id] ?? { up: 0, down: 0 };
          return (
            <div key={speaker.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex flex-col gap-3 shadow-sm">
              <div>
                <p className="font-bold text-base">{speaker.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{speaker.role}</p>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{speaker.bio}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleVote(speaker.id, 'up')}
                  aria-label={`Thumbs up for ${speaker.name}`}
                  className="flex items-center gap-1 text-sm px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                >
                  👍 {tally.up}
                </button>
                <button
                  onClick={() => handleVote(speaker.id, 'down')}
                  aria-label={`Thumbs down for ${speaker.name}`}
                  className="flex items-center gap-1 text-sm px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  👎 {tally.down}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const feature: Feature = {
  id: 'speaker-bio',
  slot: 'main',
  order: 50,
  Component: SpeakerBioCards,
};
export default feature;

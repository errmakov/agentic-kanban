'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';
import { SPEAKERS } from './speakers';
import { SpeakerCard } from './SpeakerCard';

type Tally = { up: number; down: number };
type Tallies = Record<string, Tally>;

function SpeakerBioCards() {
  const [tallies, setTallies] = useState<Tallies>({});

  useEffect(() => {
    fetch('/api/speaker-bio-cards')
      .then((res) => res.json())
      .then((data: Tallies) => setTallies(data))
      .catch(() => undefined);
  }, []);

  function handleVote(speakerId: string, direction: 'up' | 'down') {
    setTallies((prev) => {
      const current = prev[speakerId] ?? { up: 0, down: 0 };
      return { ...prev, [speakerId]: { ...current, [direction]: current[direction] + 1 } };
    });

    fetch('/api/speaker-bio-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speakerId, direction }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('vote failed');
      })
      .catch(() => {
        fetch('/api/speaker-bio-cards')
          .then((res) => res.json())
          .then((data: Tallies) => setTallies(data))
          .catch(() => undefined);
      });
  }

  return (
    <section className="w-full max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold">Meet the Speakers</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SPEAKERS.map((speaker) => {
          const tally = tallies[speaker.id] ?? { up: 0, down: 0 };
          return (
            <SpeakerCard
              key={speaker.id}
              speaker={speaker}
              up={tally.up}
              down={tally.down}
              onVote={(direction) => handleVote(speaker.id, direction)}
            />
          );
        })}
      </div>
    </section>
  );
}

const feature: Feature = {
  id: 'speaker-bio-cards',
  slot: 'main',
  order: 200,
  Component: SpeakerBioCards,
};

export default feature;

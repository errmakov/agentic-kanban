'use client';
import { useState, useEffect } from 'react';
import { SpeakerCard } from './SpeakerCard';

interface Speaker {
  id: string;
  name: string;
  role: string;
  bio: string;
}

type Tally = { up: number; down: number };
type Tallies = Record<string, Tally>;

const SPEAKERS: Speaker[] = [
  {
    id: 'alex-rivera',
    name: 'Alex Rivera',
    role: 'Senior Software Engineer',
    bio: 'Alex has 10+ years building distributed systems and loves teaching developer tooling to teams of all sizes.',
  },
  {
    id: 'sam-chen',
    name: 'Sam Chen',
    role: 'Product Manager',
    bio: 'Sam bridges technical teams and business stakeholders, specialising in agile delivery and continuous iteration.',
  },
  {
    id: 'jordan-kim',
    name: 'Jordan Kim',
    role: 'DevOps Lead',
    bio: 'Jordan specialises in CI/CD pipelines and platform engineering, making deployments boring by design.',
  },
];

export function SpeakerBioCards() {
  const [tallies, setTallies] = useState<Tallies>({});

  useEffect(() => {
    fetch('/api/speaker-bio-cards')
      .then((r) => r.json())
      .then((data: Tallies) => setTallies(data))
      .catch(() => {});
  }, []);

  async function handleVote(speakerId: string, vote: 'up' | 'down') {
    setTallies((prev) => {
      const current = prev[speakerId] ?? { up: 0, down: 0 };
      return { ...prev, [speakerId]: { ...current, [vote]: current[vote] + 1 } };
    });
    try {
      const res = await fetch('/api/speaker-bio-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speakerId, vote }),
      });
      const data = await res.json();
      setTallies((prev) => ({ ...prev, [speakerId]: data.tally }));
    } catch {
      setTallies((prev) => {
        const current = prev[speakerId] ?? { up: 0, down: 0 };
        return { ...prev, [speakerId]: { ...current, [vote]: Math.max(0, current[vote] - 1) } };
      });
    }
  }

  return (
    <section className="w-full py-6">
      <h2 className="mb-4 text-center text-xl font-bold text-gray-900">Speakers</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SPEAKERS.map((speaker) => {
          const tally = tallies[speaker.id] ?? { up: 0, down: 0 };
          return (
            <SpeakerCard
              key={speaker.id}
              name={speaker.name}
              role={speaker.role}
              bio={speaker.bio}
              up={tally.up}
              down={tally.down}
              onVote={(vote) => handleVote(speaker.id, vote)}
            />
          );
        })}
      </div>
    </section>
  );
}

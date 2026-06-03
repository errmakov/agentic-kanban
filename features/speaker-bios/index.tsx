'use client';
import type { Feature } from '@/features/types';

type Speaker = {
  name: string;
  role: string;
  bio: string;
};

const speakers: Speaker[] = [
  {
    name: 'Ada Okafor',
    role: 'Principal Engineer, FactoryWall',
    bio: 'Builds live agent pipelines and loves shipping small features on stage.',
  },
  {
    name: 'Mateo Rossi',
    role: 'Developer Advocate',
    bio: 'Helps teams adopt agentic workflows without losing their weekends.',
  },
  {
    name: 'Lena Hart',
    role: 'Staff AI Researcher',
    bio: 'Works on making autonomous agents reliable enough to trust in production.',
  },
];

export function SpeakerBioCards() {
  return (
    <section aria-labelledby="speakers-heading" className="space-y-4">
      <h2 id="speakers-heading" className="text-lg font-semibold">
        Speakers
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {speakers.map((speaker) => (
          <article
            key={speaker.name}
            className="rounded-lg border border-neutral-200 p-4 space-y-1"
          >
            <h3 className="font-semibold">{speaker.name}</h3>
            <p className="text-sm text-neutral-600">{speaker.role}</p>
            <p className="text-sm">{speaker.bio}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const feature: Feature = {
  id: 'speaker-bios',
  slot: 'main',
  order: 10,
  Component: SpeakerBioCards,
};
export default feature;

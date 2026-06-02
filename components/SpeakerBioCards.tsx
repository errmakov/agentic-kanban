type Speaker = {
  name: string;
  role: string;
  bio: string;
};

const SPEAKERS: Speaker[] = [
  {
    name: 'Ada Marković',
    role: 'Host & Pipeline Architect',
    bio: 'Builds agentic delivery systems and runs this workshop live on stage, shipping features card by card.',
  },
  {
    name: 'Liam Chen',
    role: 'Staff Engineer, Developer Tools',
    bio: 'Works on AI coding agents and loves making the invisible parts of software delivery visible to an audience.',
  },
  {
    name: 'Sofia Ruiz',
    role: 'Product Lead, Live Demos',
    bio: 'Designs the demo flow so every change is small, self-contained, and obvious the moment it appears.',
  },
];

export function SpeakerBioCards() {
  return (
    <section aria-labelledby="speakers-heading" className="space-y-4">
      <h2 id="speakers-heading" className="text-lg font-semibold">
        Speakers
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {SPEAKERS.map((speaker) => (
          <article
            key={speaker.name}
            className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
          >
            <h3 className="font-semibold">{speaker.name}</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {speaker.role}
            </p>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">{speaker.bio}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

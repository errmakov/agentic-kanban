type Speaker = {
  name: string;
  role: string;
  bio: string;
};

const speakers: Speaker[] = [
  {
    name: 'Ada Okafor',
    role: 'Principal Engineer, Platform',
    bio: 'Builds resilient developer tooling and loves making complex pipelines feel effortless.',
  },
  {
    name: 'Mateo Rossi',
    role: 'Staff AI Researcher',
    bio: 'Works on agentic systems and spends his weekends teaching robots to write tests.',
  },
  {
    name: 'Priya Nair',
    role: 'Head of Developer Experience',
    bio: 'Obsessed with fast feedback loops and turning live demos into shippable features.',
  },
];

export function SpeakerBioCards() {
  return (
    <section aria-labelledby="speakers-heading" className="mt-12 space-y-6">
      <h2 id="speakers-heading" className="text-lg font-semibold">
        Speakers
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {speakers.map((speaker) => (
          <article
            key={speaker.name}
            className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
          >
            <h3 className="font-semibold">{speaker.name}</h3>
            <p className="text-sm text-neutral-500">{speaker.role}</p>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">{speaker.bio}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

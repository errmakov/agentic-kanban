type Speaker = {
  name: string;
  role: string;
  bio: string;
};

const speakers: Speaker[] = [
  {
    name: 'Ada Lovelace',
    role: 'Keynote Speaker',
    bio: 'Pioneer of computing who wrote the first algorithm intended for a machine.',
  },
  {
    name: 'Grace Hopper',
    role: 'Workshop Host',
    bio: 'Compiler trailblazer who made programming readable for everyone.',
  },
  {
    name: 'Alan Turing',
    role: 'Panelist',
    bio: 'Father of theoretical computer science and artificial intelligence.',
  },
];

export function SpeakerBioCards() {
  return (
    <section className="w-full max-w-3xl">
      <h2 className="mb-4 text-xl font-bold">Speakers</h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {speakers.map((speaker) => (
          <li
            key={speaker.name}
            className="rounded-lg border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5"
          >
            <p className="font-bold">{speaker.name}</p>
            <p className="text-sm text-neutral-500">{speaker.role}</p>
            <p className="mt-2 text-sm">{speaker.bio}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

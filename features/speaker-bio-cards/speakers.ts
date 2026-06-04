export type Speaker = {
  id: string;
  name: string;
  role: string;
  bio: string;
};

export const SPEAKERS: Speaker[] = [
  {
    id: 'alice-mercer',
    name: 'Alice Mercer',
    role: 'Principal Engineer, Acme Cloud',
    bio: 'Builds resilient distributed systems and writes about the trade-offs nobody warns you about.',
  },
  {
    id: 'ben-ortiz',
    name: 'Ben Ortiz',
    role: 'Developer Advocate, Pixel Forge',
    bio: 'Turns gnarly frontend problems into approachable talks. Lives for a good live demo.',
  },
  {
    id: 'chen-wei',
    name: 'Chen Wei',
    role: 'ML Research Lead, Northwind Labs',
    bio: 'Researches practical applications of agents and the tooling that keeps them honest.',
  },
];

export const SPEAKER_IDS: string[] = SPEAKERS.map((s) => s.id);

export interface Speaker {
  id: string;
  name: string;
  role: string;
  bio: string;
}

export const SPEAKERS: Speaker[] = [
  {
    id: 'alice-nguyen',
    name: 'Alice Nguyen',
    role: 'Principal Engineer, Platform',
    bio: 'Builds developer tools and loves shipping small features live. Talks about agentic workflows and keeping systems boring on purpose.',
  },
  {
    id: 'ben-okafor',
    name: 'Ben Okafor',
    role: 'Staff Frontend Engineer',
    bio: 'Obsessed with fast, accessible UIs. Spends his weekends teaching kids to code and tuning his mechanical keyboard.',
  },
  {
    id: 'carla-mendes',
    name: 'Carla Mendes',
    role: 'Engineering Manager, DX',
    bio: 'Helps teams move faster without burning out. Believes the best process is the one you barely notice.',
  },
];

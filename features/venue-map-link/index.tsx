import type { Feature } from '@/features/types';

export function VenueMapLink() {
  return (
    <a
      href="https://maps.google.com/?q=conference+venue"
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-neutral-500 hover:text-neutral-700 underline"
    >
      Venue map
    </a>
  );
}

const feature: Feature = {
  id: 'venue-map-link',
  slot: 'footer',
  order: 10,
  Component: VenueMapLink,
};
export default feature;

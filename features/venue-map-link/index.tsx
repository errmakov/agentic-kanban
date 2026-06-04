import type { Feature } from '@/features/types';

export function VenueMapLink() {
  return (
    <a
      href="https://maps.google.com/?q=conference+venue"
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-medium underline-offset-4 hover:underline"
    >
      Venue map
    </a>
  );
}

const feature: Feature = {
  id: 'venue-map-link',
  slot: 'footer',
  order: 100,
  Component: VenueMapLink,
};

export default feature;

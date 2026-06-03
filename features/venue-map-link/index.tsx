import type { Feature } from '@/features/types';

export function VenueMapLink() {
  const url = process.env.NEXT_PUBLIC_VENUE_MAP_URL || '#';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-neutral-500 hover:underline"
    >
      Venue Map
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

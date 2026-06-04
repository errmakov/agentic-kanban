import type { Feature } from '@/features/types';
import { SpeakerBioCards } from './SpeakerBioCards';

const feature: Feature = {
  id: 'speaker-bio-cards',
  slot: 'main',
  order: 10,
  Component: SpeakerBioCards,
};
export default feature;

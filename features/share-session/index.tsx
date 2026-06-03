import type { Feature } from '@/features/types';
import { ShareButton } from './ShareButton';

const feature: Feature = {
  id: 'share-session',
  slot: 'header',
  order: 50,
  Component: ShareButton,
};

export default feature;

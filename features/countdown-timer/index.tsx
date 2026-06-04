import type { Feature } from '@/features/types';
import { CountdownTimer } from './CountdownTimer';

const feature: Feature = {
  id: 'countdown-timer',
  slot: 'main',
  order: 10,
  Component: CountdownTimer,
};

export default feature;

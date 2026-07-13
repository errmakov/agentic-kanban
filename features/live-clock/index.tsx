'use client';

import { useSyncExternalStore } from 'react';
import type { Feature } from '@/features/types';

function subscribe(callback: () => void) {
  const timer = setInterval(callback, 1000);
  return () => clearInterval(timer);
}

function getSnapshot() {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getServerSnapshot() {
  return '—';
}

export function LiveClock() {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return <time className="text-sm font-medium tabular-nums">{time}</time>;
}

const feature: Feature = {
  id: 'live-clock',
  slot: 'header',
  order: 200,
  Component: LiveClock,
};

export default feature;

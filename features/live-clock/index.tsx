'use client';

import { useSyncExternalStore } from 'react';
import type { Feature } from '@/features/types';

const listeners = new Set<() => void>();
let now: Date | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;

function tick() {
  now = new Date();
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  if (listeners.size === 0) {
    tick();
    intervalId = setInterval(tick, 1000);
  }
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
      now = null;
    }
  };
}

function getSnapshot() {
  return now;
}

function getServerSnapshot(): Date | null {
  return null;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function LiveClock() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (current === null) {
    return (
      <time className="text-sm font-medium font-mono tabular-nums text-neutral-600">
        --:--:--
      </time>
    );
  }

  return (
    <time
      dateTime={current.toISOString()}
      className="text-sm font-medium font-mono tabular-nums text-neutral-600"
    >
      {formatTime(current)}
    </time>
  );
}

const feature: Feature = {
  id: 'live-clock',
  slot: 'header',
  order: 20,
  Component: LiveClock,
};

export default feature;

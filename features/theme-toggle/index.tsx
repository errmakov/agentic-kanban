'use client';

import { useSyncExternalStore } from 'react';
import type { Feature } from '@/features/types';

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function getSnapshot() {
  return document.documentElement.classList.contains('dark');
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, () => false);

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      /* localStorage unavailable — keep the in-page toggle working anyway */
    }
    listeners.forEach((l) => l());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="rounded-md border border-neutral-200 px-2 py-1 text-sm transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
    >
      <span aria-hidden="true">{isDark ? '☀' : '☽'}</span>
    </button>
  );
}

const feature: Feature = {
  id: 'theme-toggle',
  slot: 'header',
  order: 10,
  Component: ThemeToggle,
};

export default feature;

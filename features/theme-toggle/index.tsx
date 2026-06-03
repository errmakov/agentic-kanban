'use client';
import { useSyncExternalStore } from 'react';
import type { Feature } from '@/features/types';

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function isDarkSnapshot() {
  return document.documentElement.classList.contains('dark');
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, isDarkSnapshot, () => false);

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    listeners.forEach((l) => l());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="text-sm font-medium"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

const feature: Feature = {
  id: 'theme-toggle',
  slot: 'header',
  order: 200,
  Component: ThemeToggle,
};
export default feature;

'use client';

import { useSyncExternalStore } from 'react';
import type { Feature } from '@/features/types';

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot() {
  return document.documentElement.classList.contains('dark');
}

function setTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
  try {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  } catch {
    // localStorage unavailable (e.g. private browsing) — theme still applies for this session
  }
  listeners.forEach((listener) => listener());
}

function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, () => false);

  return (
    <button
      type="button"
      onClick={() => setTheme(!isDark)}
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      className="text-lg leading-none rounded-md px-2 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
    >
      {isDark ? '☀️' : '🌙'}
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

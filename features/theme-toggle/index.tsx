'use client';

import { useSyncExternalStore } from 'react';
import type { Feature } from '@/features/types';

const THEME_EVENT = 'factorywall:theme';

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

// NOTE: This flips the body background/text via the .dark CSS variables in globals.css.
// Shared layout files (Header/Wall/Footer) use hardcoded Tailwind neutrals with no
// `dark:` variants, so those specific colors won't invert — we can't edit shared files.
export function ThemeToggle() {
  const isDark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains('dark'),
    () => false,
  );

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // localStorage may be unavailable (private mode); toggle still works this session.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="text-sm rounded px-2 py-1 hover:opacity-70 transition-opacity"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

const feature: Feature = {
  id: 'theme-toggle',
  slot: 'header',
  order: 50,
  Component: ThemeToggle,
};

export default feature;

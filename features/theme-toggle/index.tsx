'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

type Theme = 'light' | 'dark';

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage unavailable (e.g. private browsing) — fall through.
  }
  return null;
}

function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const initial: Theme =
      readStoredTheme() ?? (prefersDark() ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', initial === 'dark');
    // The theme is only knowable on the client (localStorage / matchMedia), so we must
    // resolve it after mount; a lazy initializer would diverge from the SSR'd HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initial);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('theme', next);
    } catch {
      // localStorage unavailable — the in-memory state still updates.
    }
    setTheme(next);
  };

  const isDark = theme === 'dark';
  const ready = theme !== null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-hidden={!ready}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-lg leading-none transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
    >
      <span aria-hidden="true">{ready ? (isDark ? '☀️' : '🌙') : ''}</span>
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

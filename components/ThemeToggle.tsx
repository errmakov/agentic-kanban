'use client';

import { useState } from 'react';

type Theme = 'light' | 'dark';

function currentTheme(): Theme {
  if (
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  ) {
    return 'dark';
  }
  return 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('theme', next);
    } catch {
      // localStorage unavailable — keep in-memory state only
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      suppressHydrationWarning
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className="rounded-md border border-neutral-200 px-2 py-1 text-sm dark:border-neutral-700"
    >
      {theme === 'dark' ? '☀' : '☽'}
    </button>
  );
}

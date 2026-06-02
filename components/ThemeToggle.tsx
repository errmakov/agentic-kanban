'use client';

import { useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark'),
  );

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    setIsDark(next);
    try {
      localStorage.theme = next ? 'dark' : 'light';
    } catch {
      // storage unavailable — fall back to in-memory state
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      suppressHydrationWarning
      className="rounded-md border border-neutral-200 px-2 py-1 text-lg leading-none dark:border-neutral-700"
    >
      {isDark ? '☀' : '☽'}
    </button>
  );
}

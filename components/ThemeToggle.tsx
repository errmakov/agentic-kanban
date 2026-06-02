'use client';

import { useContext } from 'react';
import { ThemeContext } from '@/app/theme-context';

export function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}

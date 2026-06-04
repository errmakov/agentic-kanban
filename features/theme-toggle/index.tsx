'use client';
import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Sync state to the theme the pre-hydration inline script already applied to <html>.
    // Server always renders 'light', so this must run post-mount to avoid a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('fw-theme', next);
    } catch {
      // localStorage unavailable (e.g. private browsing) — theme still applies for this session.
    }
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="rounded-md border border-neutral-400 px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-80"
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
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

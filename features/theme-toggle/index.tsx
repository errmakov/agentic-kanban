'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

// Note: the theme class is applied in useEffect (after first paint), so a visitor
// with a saved 'dark' preference may see a brief flash of light mode on load.
// Eliminating that requires an inline <head> script in the shared app/layout.tsx,
// which features must not edit, so we accept the flash for now.

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('theme');
    const isDark = saved === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    // SSR-safe: render defaults to 'light', then reconcile with the saved
    // preference once on mount (localStorage is unavailable on the server).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem('theme', next);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="text-lg leading-none"
    >
      {theme === 'dark' ? '🌙' : '☀'}
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

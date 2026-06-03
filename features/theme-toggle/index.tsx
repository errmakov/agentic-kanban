'use client';
import { useState, useEffect } from 'react';
import type { Feature } from '@/features/types';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    let initial = false;
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark') {
        initial = true;
      } else if (stored === null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initial = true;
      }
    } catch {
      initial = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    if (initial) {
      document.documentElement.classList.add('dark');
    }
    setIsDark(initial);
  }, []);

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // ignore private browsing / quota errors
    }
    setIsDark(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="text-xl leading-none"
    >
      {isDark ? '☀' : '☾'}
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

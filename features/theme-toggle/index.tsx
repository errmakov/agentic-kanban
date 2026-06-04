'use client';
import { useState } from 'react';
import type { Feature } from '@/features/types';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {}
    setIsDark(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="text-xl leading-none"
      suppressHydrationWarning
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

'use client';
import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

export function JumpToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 200);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll back to top"
      className="fixed bottom-6 right-6 z-50 rounded-md border border-neutral-400 px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-80"
    >
      ↑ Top
    </button>
  );
}

const feature: Feature = {
  id: 'jump-to-top',
  slot: 'footer',
  order: 200,
  Component: JumpToTop,
};

export default feature;

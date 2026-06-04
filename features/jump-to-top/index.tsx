'use client';
import { useState, useEffect } from 'react';
import type { Feature } from '@/features/types';

export function JumpToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 200);
    }
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-50 rounded-full bg-[var(--foreground)] text-[var(--background)] w-10 h-10 text-lg transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      ↑
    </button>
  );
}

const feature: Feature = {
  id: 'jump-to-top',
  slot: 'footer',
  order: 10,
  Component: JumpToTop,
};
export default feature;

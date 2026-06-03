'use client';
import { useState, useEffect } from 'react';
import type { Feature } from '@/features/types';

export function JumpToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md transition-opacity duration-200 dark:bg-neutral-800/80 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      ↑
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

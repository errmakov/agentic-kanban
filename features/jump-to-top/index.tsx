'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

const THRESHOLD = 300;

function JumpToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className={`fixed bottom-6 right-6 z-50 rounded-full h-11 w-11 text-lg leading-none shadow-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-all ${
        visible ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-90'
      }`}
    >
      ↑
    </button>
  );
}

const feature: Feature = {
  id: 'jump-to-top',
  slot: 'main',
  order: 999,
  Component: JumpToTop,
};

export default feature;

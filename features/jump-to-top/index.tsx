'use client';

import { useEffect, useState } from 'react';
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

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="fixed bottom-8 right-8 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-lg dark:border-neutral-700"
    >
      <span aria-hidden="true">↑</span>
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

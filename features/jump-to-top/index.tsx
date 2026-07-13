'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

const SCROLL_THRESHOLD = 200;

export function JumpToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 rounded-full bg-black/70 text-white px-3 py-3 shadow-lg hover:opacity-80 transition-opacity"
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

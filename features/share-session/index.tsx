'use client';

import { useEffect, useRef, useState } from 'react';
import type { Feature } from '@/features/types';

export function ShareSessionButton() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleClick() {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write rejected (e.g. permission denied) — leave feedback unchanged
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Copy link to this session"
      className="rounded-md px-2 py-1 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
    >
      {copied ? '✅ Copied!' : '🔗 Share'}
    </button>
  );
}

const feature: Feature = {
  id: 'share-session',
  slot: 'footer',
  order: 10,
  Component: ShareSessionButton,
};

export default feature;

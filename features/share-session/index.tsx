'use client';
import { useState, useRef, useCallback } from 'react';
import type { Feature } from '@/features/types';

export function ShareButton() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      if (timerRef.current) clearTimeout(timerRef.current);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silent no-op
    }
  }, []);

  return (
    <button
      onClick={handleClick}
      aria-label="Copy link to this session"
      className="text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded px-3 py-1"
    >
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  );
}

const feature: Feature = {
  id: 'share-session',
  slot: 'header',
  order: 10,
  Component: ShareButton,
};
export default feature;

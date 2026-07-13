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
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (non-HTTPS/old browser) — skip feedback silently.
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Share this session"
      className="rounded border border-neutral-300 px-2 py-1 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-neutral-100"
    >
      {copied ? 'Copied!' : '🔗 Share'}
    </button>
  );
}

const feature: Feature = {
  id: 'share-session',
  slot: 'footer',
  order: 200,
  Component: ShareSessionButton,
};

export default feature;

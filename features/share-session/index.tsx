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

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (non-HTTPS, denied permission) — leave the label unchanged.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="rounded-md border border-neutral-400 px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-80"
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}

const feature: Feature = {
  id: 'share-session',
  slot: 'header',
  order: 10,
  Component: ShareSessionButton,
};

export default feature;

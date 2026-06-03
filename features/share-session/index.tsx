'use client';
import { useEffect, useState } from 'react';
import type { Feature } from '@/features/types';

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // Clipboard API may be unavailable (non-HTTPS, old browser, sandbox) — ignore.
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full border border-neutral-200 px-3 py-1 text-sm font-medium transition-colors hover:bg-neutral-100"
    >
      {copied ? 'Copied!' : '🔗 Share'}
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

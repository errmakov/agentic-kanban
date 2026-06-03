'use client';
import { useState, useRef } from 'react';
import type { Feature } from '@/features/types';

export function ShareButton() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleClick() {
    try {
      await navigator.clipboard?.writeText(window.location.href);
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      setCopied(true);
      timerRef.current = setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, 2000);
    } catch {
      // clipboard unavailable or permission denied — do nothing
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={copied ? 'Link copied to clipboard' : 'Copy link to this session'}
      className="text-sm leading-none"
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}

const feature: Feature = {
  id: 'share-button',
  slot: 'header',
  order: 20,
  Component: ShareButton,
};
export default feature;

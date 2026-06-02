'use client';

import { useEffect, useRef, useState } from 'react';

export function ShareButton() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleClick() {
    if (!navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      return;
    }
    setCopied(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={copied ? 'Link copied!' : 'Copy session link'}
      className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      {copied ? 'Copied!' : '🔗 Share'}
    </button>
  );
}

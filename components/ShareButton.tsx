'use client';

import { useEffect, useRef, useState } from 'react';

export function ShareButton() {
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
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (non-HTTPS or denied) — leave the label unchanged.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label="Copy session link"
      className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
    >
      {copied ? '✓ Copied!' : '🔗 Share'}
    </button>
  );
}

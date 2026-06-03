'use client';

import { useState } from 'react';

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be unavailable (non-HTTPS / old browsers);
      // a failed copy is non-fatal during a live demo.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Copy link to this session"
      className="rounded border border-neutral-200 px-3 py-1 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}

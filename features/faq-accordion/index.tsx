'use client';
import { useState } from 'react';
import type { Feature } from '@/features/types';

const FAQ_ITEMS = [
  {
    question: 'What is FactoryWall?',
    answer:
      'FactoryWall is a live session-companion app displayed on screen during a conference workshop. Open it on your phone to follow along, react to posts, and vote in polls.',
  },
  {
    question: 'How do I react to a post?',
    answer:
      'Find the emoji reaction bar below a post and tap any emoji to add your reaction. Your reaction is tallied in real time for everyone to see.',
  },
  {
    question: 'Will my vote be saved if I reload the page?',
    answer:
      'Yes — reactions and votes are persisted on the server, so they survive page reloads and redeploys.',
  },
  {
    question: 'How do I join on mobile?',
    answer:
      'Scan the QR code displayed on the workshop screen, or type the URL into your mobile browser. No app install required.',
  },
  {
    question: 'Can I see who else is watching?',
    answer:
      'The attendee counter in the header shows how many people currently have the page open.',
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-100">FAQ</h2>
      <div className="divide-y divide-neutral-200 dark:divide-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
              className="w-full text-left px-4 py-3 text-sm font-medium text-neutral-800 dark:text-neutral-100 flex justify-between items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <span>{item.question}</span>
              <span aria-hidden className="shrink-0 text-neutral-400">
                {openIndex === i ? '▲' : '▼'}
              </span>
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400 prose-sm max-w-none">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

const feature: Feature = {
  id: 'faq-accordion',
  slot: 'main',
  order: 50,
  Component: FaqAccordion,
};
export default feature;

'use client';

import { useState } from 'react';
import type { Feature } from '@/features/types';

const FAQ_ITEMS = [
  {
    question: 'What is FactoryWall?',
    answer:
      'FactoryWall is a live session companion — open it on your phone to interact with the workshop in real time.',
  },
  {
    question: 'How do I send a reaction?',
    answer:
      'Tap any emoji on the reactions panel. Your reaction is counted instantly and visible on the main screen.',
  },
  {
    question: 'Will my reactions be saved?',
    answer:
      'Yes — reaction counts persist across reloads and redeployments. They are stored server-side.',
  },
  {
    question: 'Do I need an account?',
    answer: 'No account needed. Just open the URL on your phone and start interacting.',
  },
  {
    question: 'Can I change the theme?',
    answer:
      'Yes — tap the moon / sun icon in the top-right corner to toggle between light and dark mode.',
  },
] as const;

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(i: number) {
    setOpenIndex((prev) => (prev === i ? null : i));
  }

  return (
    <section aria-label="FAQ" className="w-full max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-100">
        Frequently Asked Questions
      </h2>
      <div className="flex flex-col gap-2">
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"
          >
            <button
              id={`faq-btn-${i}`}
              type="button"
              aria-expanded={openIndex === i}
              aria-controls={`faq-panel-${i}`}
              onClick={() => toggle(i)}
              className="w-full text-left px-4 py-3 font-medium text-neutral-800 dark:text-neutral-100 flex justify-between items-center"
            >
              <span>{item.question}</span>
              <span aria-hidden="true" className="ml-2 text-neutral-500 dark:text-neutral-400">
                {openIndex === i ? '−' : '+'}
              </span>
            </button>
            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-btn-${i}`}
              className={`px-4 pb-3 text-sm text-neutral-600 dark:text-neutral-300 transition-opacity duration-200 ${
                openIndex === i ? 'opacity-100' : 'opacity-0 hidden'
              }`}
            >
              {item.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const feature: Feature = {
  id: 'faq-accordion',
  slot: 'main',
  order: 200,
  Component: FaqAccordion,
};

export default feature;

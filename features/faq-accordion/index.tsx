'use client';

import { useState } from 'react';
import type { Feature } from '@/features/types';

const FAQ_ITEMS = [
  {
    question: 'How do I react to a slide?',
    answer:
      'Tap any emoji in the reactions bar on your phone — the count updates live on the big screen for everyone to see.',
  },
  {
    question: 'Can I vote more than once?',
    answer:
      'Yes! Reactions are meant to be spammed. Tap as many times as you like to show your enthusiasm.',
  },
  {
    question: 'Will the session be recorded?',
    answer:
      'The talk is recorded, but this companion wall is live-only. Grab a screenshot if you want to keep something.',
  },
  {
    question: 'Do I need to install anything?',
    answer:
      'No. Everything runs in your phone browser — just keep this page open for the rest of the workshop.',
  },
] as const;

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section aria-label="Frequently asked questions" className="mx-auto w-full max-w-xl">
      <h2 className="mb-4 text-center text-lg font-semibold">FAQ</h2>
      <div className="flex flex-col gap-2">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={item.question}
              className="rounded-lg border border-black/10 dark:border-white/15"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${i}`}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-medium"
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className="text-xl transition-transform"
                  style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div id={`faq-answer-${i}`} className="px-4 pb-3 text-sm opacity-90">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
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

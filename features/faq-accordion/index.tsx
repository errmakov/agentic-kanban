'use client';
import { useState } from 'react';
import type { Feature } from '@/features/types';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-what',
    question: 'What is FactoryWall?',
    answer:
      'A live session-companion web app shown on the big screen and opened by the audience on their phones during this workshop.',
  },
  {
    id: 'faq-built',
    question: 'How is this page built?',
    answer:
      'Feature-by-feature, live on stage. Each GitHub issue becomes one small feature that an agent pipeline implements, tests, and ships.',
  },
  {
    id: 'faq-interact',
    question: 'Can I interact with it?',
    answer:
      'Yes! Many features are interactive — try the reactions, votes, and other controls right from your phone.',
  },
  {
    id: 'faq-stack',
    question: 'What is it made with?',
    answer:
      'Next.js with the App Router, TypeScript, and Tailwind CSS. State that must survive a reload is kept in small JSON files — no database server.',
  },
  {
    id: 'faq-parallel',
    question: 'How do agents build in parallel?',
    answer:
      'Every feature is just a folder that renders into a named slot, so agents never edit the same file and their work never collides.',
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="mx-auto w-full max-w-2xl py-6" aria-label="Frequently asked questions">
      <h2 className="mb-4 text-2xl font-bold">FAQ</h2>
      <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
        {FAQS.map((item) => {
          const isOpen = open === item.id;
          return (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => setOpen((prev) => (prev === item.id ? null : item.id))}
                aria-expanded={isOpen}
                aria-controls={item.id}
                className="flex w-full items-center justify-between gap-3 py-3 text-left font-medium hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  ▾
                </span>
              </button>
              <div
                id={item.id}
                hidden={!isOpen}
                className="overflow-hidden pb-3 text-sm text-neutral-600 dark:text-neutral-400"
              >
                {item.answer}
              </div>
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

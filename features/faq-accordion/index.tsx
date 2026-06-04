'use client';
import { useState } from 'react';
import type { Feature } from '@/features/types';

const FAQ_ITEMS = [
  {
    question: 'What is FactoryWall?',
    answer:
      'A live session-companion app, built feature-by-feature on stage by this repository’s agent pipeline. Each GitHub issue becomes one small, visible feature.',
  },
  {
    question: 'How do agents pick up work?',
    answer:
      'Through a Kanban pull system on a GitHub Project board. A dispatcher pulls finished cards into the next silo — SA/BA, Dev, Test — only when that silo is under its WIP limit.',
  },
  {
    question: 'How are features kept conflict-free?',
    answer:
      'Each feature lives in its own folder under features/ and renders into a named slot. Agents never edit a shared layout file, so parallel features never collide.',
  },
  {
    question: 'Where is the source code?',
    answer:
      'Everything lives in this repository. The app is Next.js with TypeScript and Tailwind, and every feature ships as an isolated, auto-discovered folder.',
  },
] as const;

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <section aria-labelledby="faq-heading" className="w-full max-w-2xl">
      <h2 id="faq-heading" className="mb-4 text-lg font-semibold">
        FAQ
      </h2>
      <div className="divide-y divide-neutral-300 border-y border-neutral-300">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question}>
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
                className="flex w-full items-center justify-between gap-4 py-3 text-left font-medium"
              >
                <span>{item.question}</span>
                <span
                  aria-hidden
                  className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}
                >
                  ▸
                </span>
              </button>
              {isOpen && (
                <p
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className="pb-3 text-neutral-600"
                >
                  {item.answer}
                </p>
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

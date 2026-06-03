'use client';
import { useState } from 'react';
import type { Feature } from '@/features/types';

const FAQ_ITEMS = [
  {
    question: 'What is FactoryWall?',
    answer: 'FactoryWall is a live session companion built in real-time on stage. Open it on your phone to interact with the workshop as features are added.',
  },
  {
    question: 'How do I react to something?',
    answer: 'Tap any emoji button in the reactions section to send your reaction. Your tap is counted instantly and shared with the whole audience.',
  },
  {
    question: 'Is my data saved?',
    answer: 'Reaction counts are persisted on the server so they survive page refreshes, but no personal data is collected or stored.',
  },
  {
    question: 'Who builds these features?',
    answer: 'Each feature is implemented live on stage by an AI agent pipeline — from GitHub issue to deployed code in minutes.',
  },
  {
    question: 'Can I use this for my own events?',
    answer: 'The source code is open — fork the repo and adapt it for your own workshops or conferences.',
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <section className="w-full max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold mb-4">FAQ</h2>
      <div className="flex flex-col gap-2">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          const buttonId = `faq-btn-${index}`;
          const regionId = `faq-region-${index}`;
          return (
            <div key={index} className="rounded-xl bg-white/10">
              <button
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={regionId}
                onClick={() => toggle(index)}
                className="w-full text-left px-4 py-3 font-medium flex justify-between items-center hover:bg-white/10 rounded-xl transition-colors"
              >
                <span>{item.question}</span>
                <span
                  className={[
                    'ml-3 shrink-0 transition-transform duration-200',
                    isOpen ? 'rotate-180' : 'rotate-0',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
              <div
                id={regionId}
                role="region"
                aria-labelledby={buttonId}
                className={[
                  'overflow-hidden transition-opacity duration-200',
                  isOpen ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0',
                ].join(' ')}
              >
                <p className="px-4 pb-4 text-sm text-white/80">{item.answer}</p>
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

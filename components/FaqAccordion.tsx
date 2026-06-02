const FAQ_ITEMS = [
  {
    question: 'What is FactoryWall?',
    answer:
      'FactoryWall is a live session companion — a web app built on stage during the workshop and opened by the audience on their phones.',
  },
  {
    question: 'How are features built?',
    answer:
      'Each feature is implemented live by an AI agent pipeline: every GitHub issue becomes one small feature an agent builds, tests, and ships.',
  },
  {
    question: 'What is the Kanban pipeline?',
    answer:
      'Work flows through a pull-based Kanban board: SA/BA analyses an issue, Dev implements it, Test verifies it, and a human reviews before it ships.',
  },
  {
    question: 'Can I interact with the app?',
    answer:
      'Yes — many features let the audience join in, from reactions and votes to live tallies that update as the session goes on.',
  },
];

export function FaqAccordion() {
  return (
    <section aria-labelledby="faq-heading" className="space-y-2">
      <h2 id="faq-heading" className="text-lg font-semibold">
        Frequently Asked Questions
      </h2>
      <div className="space-y-2">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.question}
            className="rounded-lg border border-neutral-200 dark:border-neutral-700"
          >
            <summary className="cursor-pointer px-4 py-3 font-medium">
              {item.question}
            </summary>
            <p className="px-4 pb-4 text-neutral-600 dark:text-neutral-400">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

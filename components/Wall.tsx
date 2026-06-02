import { AgendaList } from './AgendaList';
import { ReactionBar } from './ReactionBar';
import { Countdown } from './Countdown';

export function Wall() {
  return (
    <section aria-labelledby="wall-heading" className="space-y-4">
      <h2 id="wall-heading" className="text-lg font-semibold">
        Welcome to the workshop
      </h2>
      <p className="text-neutral-600 dark:text-neutral-400">
        This page is built live during the session. Each feature you see appear was
        implemented by an AI agent pulling a card across the board.
      </p>
      <AgendaList />
      <ReactionBar />
      <Countdown />
    </section>
  );
}

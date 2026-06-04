import type { Speaker } from './speakers';

type SpeakerCardProps = {
  speaker: Speaker;
  up: number;
  down: number;
  onVote: (direction: 'up' | 'down') => void;
};

export function SpeakerCard({ speaker, up, down, onVote }: SpeakerCardProps) {
  return (
    <article className="flex flex-col rounded-lg border border-foreground/15 p-4 shadow-sm">
      <h3 className="text-lg font-semibold">{speaker.name}</h3>
      <p className="text-sm font-medium text-foreground/60">{speaker.role}</p>
      <p className="mt-2 flex-1 text-sm text-foreground/80">{speaker.bio}</p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          aria-label={`Thumbs up for ${speaker.name}`}
          onClick={() => onVote('up')}
          className="flex items-center gap-1 rounded-md border border-foreground/15 px-3 py-1 text-sm font-medium transition-colors hover:bg-foreground/5"
        >
          <span aria-hidden="true">👍</span>
          <span>{up}</span>
        </button>
        <button
          type="button"
          aria-label={`Thumbs down for ${speaker.name}`}
          onClick={() => onVote('down')}
          className="flex items-center gap-1 rounded-md border border-foreground/15 px-3 py-1 text-sm font-medium transition-colors hover:bg-foreground/5"
        >
          <span aria-hidden="true">👎</span>
          <span>{down}</span>
        </button>
      </div>
    </article>
  );
}

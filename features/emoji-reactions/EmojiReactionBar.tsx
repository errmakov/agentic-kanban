import { EMOJIS, type Counts } from './emojis';

interface EmojiReactionBarProps {
  counts: Counts;
  onReact: (emoji: string) => void;
  disabled?: boolean;
}

export function EmojiReactionBar({ counts, onReact, disabled }: EmojiReactionBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {EMOJIS.map((emoji) => {
        const count = counts[emoji] ?? 0;
        return (
          <button
            key={emoji}
            type="button"
            disabled={disabled}
            onClick={() => onReact(emoji)}
            aria-label={`React with ${emoji} (${count} reactions)`}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-base transition-transform duration-100 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <span aria-hidden="true">{emoji}</span>
            <span className="text-sm font-medium tabular-nums">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

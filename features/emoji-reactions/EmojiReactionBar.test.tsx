import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmojiReactionBar } from './EmojiReactionBar';
import { EMOJIS } from './emojis';

const counts = { '👍': 4, '❤️': 1, '🔥': 0, '😂': 2, '🎉': 7 };

describe('EmojiReactionBar', () => {
  it('renders a button for every emoji', () => {
    render(<EmojiReactionBar counts={counts} onReact={() => {}} />);
    for (const emoji of EMOJIS) {
      expect(
        screen.getByRole('button', { name: new RegExp(`React with ${emoji}`) }),
      ).toBeInTheDocument();
    }
  });

  it('shows the count for each emoji', () => {
    render(<EmojiReactionBar counts={counts} onReact={() => {}} />);
    const button = screen.getByRole('button', { name: /React with 👍/ });
    expect(button).toHaveTextContent('4');
  });

  it('calls onReact with the correct emoji when clicked', () => {
    const onReact = vi.fn();
    render(<EmojiReactionBar counts={counts} onReact={onReact} />);
    fireEvent.click(screen.getByRole('button', { name: /React with 🔥/ }));
    expect(onReact).toHaveBeenCalledWith('🔥');
  });

  it('disables all buttons when disabled', () => {
    render(<EmojiReactionBar counts={counts} onReact={() => {}} disabled />);
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
  });
});

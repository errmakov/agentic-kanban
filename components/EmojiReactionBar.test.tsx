import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmojiReactionBar } from './EmojiReactionBar';

describe('EmojiReactionBar', () => {
  it('renders all emoji reaction buttons starting at zero', () => {
    render(<EmojiReactionBar />);
    for (const emoji of ['👍', '❤️', '😂', '🎉', '🤯']) {
      const button = screen.getByRole('button', { name: `React with ${emoji}` });
      expect(button).toHaveTextContent('0');
    }
  });

  it('increments only the clicked emoji count', () => {
    render(<EmojiReactionBar />);
    const thumbs = screen.getByRole('button', { name: 'React with 👍' });
    fireEvent.click(thumbs);
    fireEvent.click(thumbs);
    expect(thumbs).toHaveTextContent('2');

    const heart = screen.getByRole('button', { name: 'React with ❤️' });
    expect(heart).toHaveTextContent('0');
  });
});

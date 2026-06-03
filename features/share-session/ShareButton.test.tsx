import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ShareButton } from './index';

describe('ShareButton', () => {
  it('renders a Share button initially', () => {
    render(<ShareButton />);
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('writes the page url to the clipboard and shows "Copied!" on click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ShareButton />);
    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument(),
    );
  });
});

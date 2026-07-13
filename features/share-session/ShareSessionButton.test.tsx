import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShareSessionButton } from './index';

describe('ShareSessionButton', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    writeText.mockClear();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  it('renders a share button', () => {
    render(<ShareSessionButton />);
    expect(screen.getByRole('button', { name: /share this session/i })).toBeInTheDocument();
  });

  it('copies the current URL and shows confirmation on click', async () => {
    render(<ShareSessionButton />);
    fireEvent.click(screen.getByRole('button', { name: /share this session/i }));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    await waitFor(() => {
      expect(screen.getByText(/copied!/i)).toBeInTheDocument();
    });
  });
});

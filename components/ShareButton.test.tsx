import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShareButton } from './ShareButton';

describe('ShareButton', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: 'https://factorywall.example/session' },
      writable: true,
    });
  });

  it('renders an accessible share button', () => {
    render(<ShareButton />);
    expect(
      screen.getByRole('button', { name: /copy session link/i }),
    ).toBeInTheDocument();
  });

  it('copies the current URL and shows feedback when clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    render(<ShareButton />);
    fireEvent.click(screen.getByRole('button', { name: /copy session link/i }));

    expect(writeText).toHaveBeenCalledWith('https://factorywall.example/session');
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /link copied!/i }),
      ).toBeInTheDocument(),
    );
  });
});

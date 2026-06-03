import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ShareButton } from './ShareButton';
import feature from './index';

describe('ShareButton', () => {
  it('renders with an accessible name', () => {
    render(<ShareButton />);
    expect(
      screen.getByRole('button', { name: /copy link to this session/i }),
    ).toBeInTheDocument();
  });

  it('copies the page URL and shows "Copied!" on click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ShareButton />);
    const button = screen.getByRole('button', { name: /copy link to this session/i });
    expect(button).toHaveTextContent('Share');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    await waitFor(() => expect(button).toHaveTextContent('Copied!'));
  });
});

describe('ShareButton feature descriptor', () => {
  it('has the correct id, slot, and order', () => {
    expect(feature.id).toBe('share-session');
    expect(feature.slot).toBe('header');
    expect(feature.order).toBe(50);
  });

  it('exposes the ShareButton component', () => {
    expect(feature.Component).toBe(ShareButton);
  });
});

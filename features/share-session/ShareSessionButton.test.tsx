import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import feature from './index';

const ShareSessionButton = feature.Component;

describe('ShareSessionButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a share button', () => {
    render(<ShareSessionButton />);
    expect(
      screen.getByRole('button', { name: /copy link to this session/i }),
    ).toBeInTheDocument();
  });

  it('writes the page URL to the clipboard on click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    render(<ShareSessionButton />);
    fireEvent.click(
      screen.getByRole('button', { name: /copy link to this session/i }),
    );

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(window.location.href));
  });

  it('shows transient feedback after a successful copy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    render(<ShareSessionButton />);
    const button = screen.getByRole('button', { name: /copy link to this session/i });
    expect(button.textContent).toContain('Share');

    fireEvent.click(button);

    await waitFor(() => expect(button.textContent).toContain('Copied!'));
  });

  it('does not throw when the clipboard API is unavailable', () => {
    vi.stubGlobal('navigator', {});

    render(<ShareSessionButton />);
    const button = screen.getByRole('button', { name: /copy link to this session/i });

    expect(() => fireEvent.click(button)).not.toThrow();
  });

  it('exports correct feature descriptor properties', () => {
    expect(feature.id).toBe('share-session');
    expect(feature.slot).toBe('footer');
    expect(feature.order).toBe(10);
  });
});

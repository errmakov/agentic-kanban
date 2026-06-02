import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FeedbackWidget } from './FeedbackWidget';

describe('FeedbackWidget', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: () => Promise.resolve({ up: 3, down: 1 }) }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders thumbs up and thumbs down buttons', async () => {
    render(<FeedbackWidget />);
    expect(screen.getByLabelText('Thumbs up')).toBeInTheDocument();
    expect(screen.getByLabelText('Thumbs down')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText('Thumbs up')).toHaveTextContent('3');
    });
  });

  it('shows counts from the initial GET', async () => {
    render(<FeedbackWidget />);
    await waitFor(() => {
      expect(screen.getByLabelText('Thumbs up')).toHaveTextContent('3');
      expect(screen.getByLabelText('Thumbs down')).toHaveTextContent('1');
    });
  });

  it('POSTs and updates counts when a button is clicked', async () => {
    render(<FeedbackWidget />);
    await waitFor(() => {
      expect(screen.getByLabelText('Thumbs up')).toHaveTextContent('3');
    });

    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve({ up: 4, down: 1 }),
    } as Response);

    fireEvent.click(screen.getByLabelText('Thumbs up'));

    await waitFor(() => {
      expect(screen.getByLabelText('Thumbs up')).toHaveTextContent('4');
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/feedback',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('persists the vote in localStorage and disables buttons after voting', async () => {
    render(<FeedbackWidget />);
    await waitFor(() => {
      expect(screen.getByLabelText('Thumbs up')).toHaveTextContent('3');
    });

    fireEvent.click(screen.getByLabelText('Thumbs up'));

    await waitFor(() => {
      expect(localStorage.getItem('fw_feedback_vote')).toBe('up');
    });
    expect(screen.getByLabelText('Thumbs up')).toBeDisabled();
    expect(screen.getByLabelText('Thumbs down')).toBeDisabled();
  });

  it('disables buttons on mount when a vote already exists in localStorage', async () => {
    localStorage.setItem('fw_feedback_vote', 'down');
    render(<FeedbackWidget />);
    await waitFor(() => {
      expect(screen.getByLabelText('Thumbs down')).toBeDisabled();
    });
    expect(screen.getByLabelText('Thumbs up')).toBeDisabled();
    expect(screen.getByLabelText('Thumbs down')).toHaveAttribute('aria-pressed', 'true');
  });
});

import { describe, it, expect } from 'vitest';
import { EMOJIS, zeroCounts } from './emojis';

describe('EMOJIS', () => {
  it('contains the 5 expected emojis', () => {
    expect(EMOJIS).toEqual(['👍', '🎉', '🤔', '❤️', '🚀']);
  });
});

describe('zeroCounts', () => {
  it('returns 0 for every emoji in EMOJIS', () => {
    const counts = zeroCounts();
    for (const emoji of EMOJIS) {
      expect(counts[emoji]).toBe(0);
    }
  });

  it('returns a fresh object on each call', () => {
    const a = zeroCounts();
    const b = zeroCounts();
    a['👍'] = 99;
    expect(b['👍']).toBe(0);
  });
});

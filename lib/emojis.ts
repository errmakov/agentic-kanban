export const EMOJIS = ['👍', '🎉', '🤔', '❤️', '🚀'] as const;

export type Emoji = (typeof EMOJIS)[number];

export type ReactionCounts = Record<string, number>;

export function zeroCounts(): ReactionCounts {
  return Object.fromEntries(EMOJIS.map((emoji) => [emoji, 0]));
}

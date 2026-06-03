/** The fixed set of emoji reactions — source of truth for both the UI and the API. */
export const EMOJIS = ['👍', '❤️', '🔥', '😂', '🎉'] as const;

export type Emoji = (typeof EMOJIS)[number];

/** Counts keyed by emoji; every emoji is present, defaulting to 0. */
export type Counts = Record<string, number>;

/** Build a counts object with every emoji at zero. */
export function emptyCounts(): Counts {
  return Object.fromEntries(EMOJIS.map((e) => [e, 0]));
}

import type { Feature } from './types';

// ┌────────────────────────────────────────────────────────────────────────────┐
// │ FEATURE REGISTRY — the ONE shared file a feature touches.                    │
// │                                                                              │
// │ To add a feature:                                                            │
// │   1. Create features/<your-feature>/index.tsx with a DEFAULT export of a     │
// │      Feature object (see CLAUDE.md → "Adding a feature").                     │
// │   2. APPEND one import line below, and one entry to the `features` array.    │
// │                                                                              │
// │ Do NOT edit app/page.tsx, components/Header.tsx, Wall.tsx or Footer.tsx —    │
// │ they render slots automatically. Appending here is the only shared change,   │
// │ so parallel features don't collide on the layout.                            │
// └────────────────────────────────────────────────────────────────────────────┘

// ── feature imports (append one per feature) ──
// import attendeeCounter from './attendee-counter';
import countdownTimer from './countdown-timer';
import emojiReactionBar from './emoji-reaction-bar';
import themeToggle from './theme-toggle';

export const features: Feature[] = [
  // ── registered features (append one per feature) ──
  // attendeeCounter,
  countdownTimer,
  emojiReactionBar,
  themeToggle,
];

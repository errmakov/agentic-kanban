import type { ComponentType } from 'react';

/** Where a feature renders in the page layout. Pick one slot per feature. */
export type FeatureSlot = 'header' | 'main' | 'footer';

/**
 * A single FactoryWall feature.
 *
 * Each feature lives in its OWN file under `features/<id>/index.tsx` and is registered
 * — once, append-only — in `features/registry.ts`. Features render into a named slot,
 * so parallel features never edit the same layout file and (almost) never merge-conflict.
 * See CLAUDE.md → "Adding a feature".
 */
export interface Feature {
  /** Stable unique id — use the feature's kebab-case name (e.g. "attendee-counter"). */
  id: string;
  /** Which layout slot to render into. */
  slot: FeatureSlot;
  /** Render order within the slot (lower renders first). Defaults to 100. */
  order?: number;
  /** The feature's UI component (rendered with no props). */
  Component: ComponentType;
}

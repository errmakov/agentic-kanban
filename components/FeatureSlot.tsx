'use client';
//
// ⚠️  This MUST stay a client component ('use client' above). Do not remove it.
//
// The registry imports each feature's descriptor ({ id, slot, order, Component })
// from a module that is itself marked 'use client'. If FeatureSlot were a *server*
// component, React would hand those imports across the server/client boundary as
// "client reference" proxies whose data fields read as `undefined` on the server —
// so `f.slot` would be undefined, every feature would filter out, and the slot would
// render EMPTY with no error (build + tests still pass). Keeping the slot renderer on
// the client means the descriptors are real objects again. The whole feature registry
// is small and interactive, so client-bundling it is the right tradeoff; it still
// server-renders (SSR) normally, so there is no blank flash.
//
import { features } from '@/features/registry.generated';
import type { FeatureSlot as Slot } from '@/features/types';

/**
 * Renders every registered feature for a given slot, in `order`.
 * The layout (page/Header/Footer) drops a <FeatureSlot name="..." /> where features
 * should appear; features opt in via the registry, never by editing the layout.
 */
export function FeatureSlot({ name }: { name: Slot }) {
  // Dev guard: a feature with no/invalid slot never renders. Surface it loudly
  // instead of letting it vanish silently (the failure mode this file exists to prevent).
  if (process.env.NODE_ENV !== 'production') {
    const orphans = features.filter((f) => !f.slot);
    if (orphans.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(
        `[FeatureSlot] ${orphans.length} registered feature(s) have no "slot" and will never render:`,
        orphans.map((f) => f.id ?? '(missing id)'),
      );
    }
  }

  const items = features
    .filter((f) => f.slot === name)
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));

  return (
    <>
      {items.map(({ id, Component }) => (
        <Component key={id} />
      ))}
    </>
  );
}

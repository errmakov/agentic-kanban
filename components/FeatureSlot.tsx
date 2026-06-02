import { features } from '@/features/registry';
import type { FeatureSlot as Slot } from '@/features/types';

/**
 * Renders every registered feature for a given slot, in `order`.
 * The layout (page/Header/Footer) drops a <FeatureSlot name="..." /> where features
 * should appear; features opt in via the registry, never by editing the layout.
 */
export function FeatureSlot({ name }: { name: Slot }) {
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

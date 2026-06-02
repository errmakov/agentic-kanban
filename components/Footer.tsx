import { FeatureSlot } from '@/components/FeatureSlot';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-6 text-sm text-neutral-500">
        <span>FactoryWall · agentic-kanban</span>
        {/* Features in the "footer" slot render here — registered in features/registry.ts */}
        <div className="flex items-center gap-3">
          <FeatureSlot name="footer" />
        </div>
      </div>
    </footer>
  );
}

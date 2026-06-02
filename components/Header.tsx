import { FeatureSlot } from '@/components/FeatureSlot';

export function Header() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">FactoryWall</h1>
          <p className="text-sm text-neutral-500">
            The live session companion — built on stage, one feature at a time.
          </p>
        </div>
        {/* Features in the "header" slot render here — registered in features/registry.ts */}
        <div className="flex items-center gap-3">
          <FeatureSlot name="header" />
        </div>
      </div>
    </header>
  );
}

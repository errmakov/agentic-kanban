import { ShareButton } from './ShareButton';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">FactoryWall</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            The live session companion — built on stage, one feature at a time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShareButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

import { AttendeeCounter } from './AttendeeCounter';
import { ShareButton } from '@/components/ShareButton';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-700">
      <div className="mx-auto flex w-full max-w-3xl items-start justify-between px-6 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">FactoryWall</h1>
          <p className="text-sm text-neutral-500">
            The live session companion — built on stage, one feature at a time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AttendeeCounter />
          <ShareButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

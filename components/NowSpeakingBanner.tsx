export function NowSpeakingBanner() {
  const sessionName =
    process.env.NEXT_PUBLIC_SESSION_NAME || 'Agentic Kanban Workshop';

  return (
    <div
      aria-label="Now speaking"
      className="w-full bg-neutral-900 text-neutral-50"
    >
      <div className="mx-auto w-full max-w-3xl px-6 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Now Speaking
        </p>
        <p className="truncate text-lg font-semibold">{sessionName}</p>
      </div>
    </div>
  );
}

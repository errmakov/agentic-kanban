export function Footer() {
  const venueMapUrl = process.env.NEXT_PUBLIC_VENUE_MAP_URL;
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-700">
      <div className="mx-auto w-full max-w-3xl px-6 py-6 text-sm text-neutral-500 dark:text-neutral-400">
        FactoryWall · agentic-kanban
        {venueMapUrl ? (
          <>
            {' · '}
            <a
              href={venueMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Venue map
            </a>
          </>
        ) : null}
      </div>
    </footer>
  );
}

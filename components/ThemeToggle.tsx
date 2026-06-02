'use client';

export function ThemeToggle() {
  function toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch {
      // Persistence failed (e.g. private browsing) — the toggle still works for this session.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
    >
      <span className="dark:hidden">🌙 Dark</span>
      <span className="hidden dark:inline">☀️ Light</span>
    </button>
  );
}

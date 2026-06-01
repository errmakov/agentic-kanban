# Project Conventions

> This file is read by all AI agents working on this codebase (SA/BA, Dev, Test).
> Read it first, before making any changes.

## Project Overview

**FactoryWall** is a live session-companion web app, displayed on a screen and opened by
the audience on their phones during a conference workshop. It is built **feature-by-feature,
live on stage**, by this repository's agent pipeline: each GitHub issue becomes one small,
visible feature that an agent implements, tests, and ships.

Because features are demoed live, keep every change **small, visible, and self-contained**.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State**: client-side React state, or at most a single trivial `app/api/*` route.
  **There is no database.** Do not add Prisma, Postgres, or any persistence layer.
- **Testing**: Vitest (unit, jsdom) + Playwright (e2e)
- **Package Manager**: npm
- **Node Version**: 22

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build (standalone output)
npm run start        # Serve the production build
npm run test         # Run unit tests (vitest)
npm run test:e2e     # Run e2e tests (playwright)
npm run lint         # Lint (ESLint flat config, eslint .)
npm run typecheck    # TypeScript type checking (tsc --noEmit)
```

## Architecture

```
app/
  layout.tsx         # Root layout (html/body, global metadata)
  page.tsx           # Home page — composes Header / Wall / Footer
  globals.css        # Tailwind entry + CSS variables
  api/
    health/route.ts  # GET /api/health -> { status: "ok" } (deploy smoke target)
components/           # Presentational React components (one per file)
  Header.tsx
  Wall.tsx
  Footer.tsx
e2e/                  # Playwright specs
```

New features are **additive**: add a new component under `components/`, render it from
`app/page.tsx` (usually inside `<Wall />` or the header/footer), and keep it isolated so
parallel features don't collide.

## Pipeline (pull system)

This repo ships work through a Kanban **pull system** on a GitHub Project board.
Agents do **not** push work downstream — the **dispatcher** is the single mover.

- Silos: `Ready for Work` → `SA/BA` → `Dev` → `Test` → `Human Review` → `Ready to Deploy` → `Done`.
- Each silo except Test has two sub-states via labels: `stage:doing` (an agent is on it)
  and `stage:done` (finished, waiting in the buffer). WIP limits (`WIP_SABA` / `WIP_DEV` /
  `WIP_TEST` repo variables) apply to the **whole silo** (doing + done together).
- An agent finishes by setting `stage:done` and stopping. The dispatcher pulls a
  `stage:done` card into the next silo only when that silo is under its WIP limit
  (right-to-left, one hop per tick). Agents self-kick the dispatcher when they finish.
- Test is the rightmost value-add silo, so on success it **pushes** to `Human Review`.
- A failing test raises a `blocker`: new pulls stop and `agent-fix` swarms the card
  **in place** (cap 3 attempts, then `needs-human`). Cards never move backward.

As a feature agent you don't touch any of this — implement the issue and let the
pipeline carry the card.

## Coding Conventions

- Functional components with hooks; **no class components**
- **Named exports** for components (e.g. `export function ThemeToggle()`), one component per file
- Component files: PascalCase (`ThemeToggle.tsx`); App Router files stay lowercase (`page.tsx`)
- Prefer `const`; never `var`
- Style with Tailwind utility classes; reuse the CSS variables in `globals.css` for colors
- Keep components client-only unless server logic is truly needed; add `'use client'` when using state/effects
- Prefer compositor-friendly CSS for any motion (transform/opacity), not layout properties
- Use semantic HTML (`header`, `main`, `section`, `footer`) and label interactive controls for accessibility

## Agent Instructions

When working as an automated agent:

1. **Read this file first.**
2. **Implement exactly what the issue asks — nothing more.** One issue = one small feature.
3. Put new UI in its own component under `components/` and wire it into `app/page.tsx`.
4. **Add a Vitest unit test** for any new component (see `components/Wall.test.tsx` for the pattern).
5. Run `npm run typecheck` and `npm run build` before finishing; fix what you broke.
6. **No database, no new heavy dependencies.** Prefer the platform and a few lines of code.
7. **Never commit secrets or `.env` files.**
8. Keep diffs minimal and match the surrounding style.

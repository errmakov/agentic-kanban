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
- **State**: client-side React state, or a small `app/api/*` route. For state that must
  **survive a reload or redeploy** (reaction counts, votes, tallies), persist a **JSON
  file under `process.env.DATA_DIR`** (a mounted volume in prod; fall back to `./data`
  in dev) read/written via a tiny `app/api/*` route. **No external database server or
  ORM** (no Postgres/Prisma/MySQL); `sqlite` via a small lib is acceptable only if a
  JSON file genuinely won't do. Create the dir if missing (`fs.mkdir(..., {recursive:true})`).
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
  page.tsx           # Home — Header / Wall / <FeatureSlot> / Footer   (shared; do NOT edit)
  globals.css        # Tailwind entry + CSS variables
  api/
    health/route.ts  # GET /api/health -> { status: "ok" } (deploy smoke target)
components/           # Shared layout (do NOT edit) + the slot renderer
  Header.tsx          # renders the "header" slot
  Wall.tsx
  Footer.tsx          # renders the "footer" slot
  FeatureSlot.tsx     # renders every feature registered for a slot
features/             # ←— YOUR FEATURE GOES HERE (one folder per feature)
  types.ts            # the Feature interface (id, slot, order, Component)
  registry.ts         # the ONE shared file you append to (append-only)
  <feature>/index.tsx # your feature: own component(s), default-exporting a Feature
e2e/                  # Playwright specs
```

### Adding a feature (IMPORTANT — this is how we avoid deploy merge conflicts)

Features are **additive and isolated** so many agents build in parallel without
colliding. The layout exposes three **slots** — `header`, `main`, `footer` — and renders
whatever is registered for each. You add a feature by dropping a file in `features/` and
**appending** it to the registry; you never edit a shared layout file.

1. Create `features/<your-feature>/index.tsx` (kebab-case folder), default-exporting a `Feature`:

   ```tsx
   'use client'; // only if you use state/effects
   import type { Feature } from '@/features/types';

   function AttendeeCounter() {
     return <span className="text-sm font-medium">👀 128 watching</span>;
   }

   const feature: Feature = {
     id: 'attendee-counter',     // unique, kebab-case
     slot: 'header',             // 'header' | 'main' | 'footer'
     order: 100,                 // optional; lower renders first
     Component: AttendeeCounter,
   };
   export default feature;
   ```

2. Register it in `features/registry.ts` by APPENDING one import and one array entry:

   ```ts
   import attendeeCounter from './attendee-counter';
   // ...
   export const features: Feature[] = [
     attendeeCounter,
   ];
   ```

3. Server state goes in YOUR OWN route — `app/api/<your-feature>/route.ts` (persist a JSON
   file under `process.env.DATA_DIR`, as below). Never add it to a shared route.

4. Add a unit test beside your feature: `features/<your-feature>/<Component>.test.tsx`
   (see `components/Wall.test.tsx` for the pattern).

**Hard rule:** the ONLY shared file you may edit is `features/registry.ts`, and only by
appending. Do **NOT** edit `app/page.tsx`, `components/Header.tsx`, `Wall.tsx`, `Footer.tsx`,
or `FeatureSlot.tsx` — editing those is what causes the deploy-time merge conflicts.

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
  **in place** (cap 3 attempts, then `needs-human`). Cards never move backward, and a
  broken card is never pushed to Human Review (only Test pushes, only on success).
- A `needs-human` card keeps `blocker` and stays in its silo — the line stays stopped.
  A human writes guidance and/or pushes a fix to `agent/issue-<N>`, then runs
  `scripts/resume-issue.sh <repo> <issue>` (or swaps labels in the UI) to clear the
  flags and tag `retry`; the dispatcher re-dispatches the silo's agent with a fresh
  attempt budget.

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
3. Put your feature in its OWN folder under `features/` and register it (append-only) in
   `features/registry.ts` — see **"Adding a feature"**. **Never edit the shared layout**
   (`app/page.tsx`, `components/Header.tsx`/`Wall.tsx`/`Footer.tsx`/`FeatureSlot.tsx`); that
   causes deploy merge conflicts.
4. **Add a Vitest unit test** for your feature (see `components/Wall.test.tsx` for the pattern).
5. Run `npm run typecheck` and `npm run build` before finishing; fix what you broke.
6. **No external DB server/ORM, no new heavy dependencies.** Lightweight persistence is fine: a JSON file under `process.env.DATA_DIR`. Prefer the platform and a few lines of code.
7. **Never commit secrets or `.env` files.**
8. Keep diffs minimal and match the surrounding style.

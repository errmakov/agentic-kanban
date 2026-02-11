# Project Conventions

> This file is read by all AI agents working on this codebase.
> Customize it for YOUR webapp — the sections below are templates.

## Project Overview

<!-- Replace with your project description -->
This is a web application built with [YOUR FRAMEWORK].

## Tech Stack

<!-- Replace with your actual stack -->
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL via Prisma
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Package Manager**: npm
- **Node Version**: 22

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run unit tests
npm run test:e2e     # Run e2e tests
npm run lint         # Lint (ESLint + Prettier)
npm run typecheck    # TypeScript type checking
```

## Architecture

<!-- Replace with your project's architecture -->
```
src/
  app/               # Next.js App Router pages
    api/             # API routes
    (auth)/          # Auth-related pages
  components/        # React components
    ui/              # Reusable UI primitives
  lib/               # Shared utilities
  db/                # Database schema + queries
  types/             # TypeScript type definitions
tests/
  unit/              # Unit tests (colocated or here)
  e2e/               # Playwright e2e tests
```

## Coding Conventions

- Use functional components with hooks (no class components)
- Prefer `const` over `let`, never use `var`
- Use named exports (no default exports except pages)
- Error handling: use Result pattern for expected errors, throw for unexpected
- Files: kebab-case (`user-profile.tsx`), components: PascalCase (`UserProfile`)
- Tests: colocate unit tests as `*.test.ts` next to source files

## Agent Instructions

When working as an automated agent:

1. **Read this file first** before making any changes
2. **Run `npm run typecheck` and `npm run lint`** before considering work done
3. **Never commit secrets, .env files, or credentials**
4. **Keep changes minimal** — implement exactly what's asked, nothing more
5. **Write clear commit messages** describing the "why"
6. **If unsure about an approach**, prefer the simpler option

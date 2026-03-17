# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Knowledge Engine is a Next.js 16 full-stack application built with React 19 and TypeScript 5.9, following Clean Architecture principles. Package manager is **pnpm**.

## Commands

| Task | Command |
|------|---------|
| Dev server | `pnpm dev` (Turbopack) |
| Build | `pnpm build` (runs prisma generate first) |
| Lint | `pnpm lint` |
| Lint fix | `pnpm lint:fix` |
| Format | `pnpm format` |
| Format check | `pnpm format:check` |
| Type check | `pnpm exec tsc --noEmit` |
| Unit/integration tests | `pnpm test` |
| Single test file | `pnpm test tests/unit/myfile.test.ts` |
| Test with coverage | `pnpm test:coverage` |
| E2E tests | `pnpm test:e2e` |
| Prisma generate | `pnpm prisma generate` |
| Prisma migrate | `pnpm prisma migrate dev` |
| Prisma db pull | `pnpm prisma db pull` |
| Seed database | `pnpm prisma db seed` |

## Architecture

The codebase follows **Clean Architecture** with strict layer separation:

```
src/
├── core/                          # Business logic (framework-agnostic)
│   ├── domain/                    # Entities, value objects, services, repositories (interfaces), exceptions
│   ├── application/               # Use cases, DTOs, mappers
│   └── infrastructure/            # Implementations: db (Prisma repos), email, payment, storage
├── presentation/                  # UI layer
│   ├── components/
│   │   ├── ui/                    # shadcn/ui base components (do not manually edit)
│   │   ├── features/              # Feature-specific components
│   │   └── shared/                # Reusable components across features
│   ├── hooks/                     # Custom React hooks
│   └── providers/                 # QueryProvider, SessionProvider, ThemeProvider
├── app/                           # Next.js App Router (pages, layouts, route handlers)
├── actions/                       # Server actions
├── api/                           # API route logic
└── lib/                           # Shared utilities (cn(), etc.)
```

**Dependency rule**: `domain` has zero external dependencies. `application` depends only on `domain`. `infrastructure` implements `domain` interfaces. `presentation` and `app` depend on `application`/`infrastructure`.

## Key Tech Stack

- **Database**: PostgreSQL + Prisma 7 (schema at `prisma/schema.prisma`, config at `prisma.config.ts`, generated client at `prisma/generated/prisma`)
- **UI**: shadcn/ui (new-york style) + Radix UI + Tailwind CSS 4 + CVA for variants
- **Forms**: React Hook Form + Zod 4 validation
- **Data fetching**: TanStack React Query
- **HTTP client**: Ky
- **Auth**: NextAuth 5 (beta)
- **Payments**: Stripe
- **Email**: Resend + React Email
- **i18n**: next-international
- **Locale**: fr-FR (Playwright E2E tests default)

## Testing

- **Unit/Integration**: Vitest with jsdom, tests in `tests/unit/` and `tests/integration/`, setup file at `tests/setup.ts`
- **E2E**: Playwright targeting Chromium + Mobile Chrome (Pixel 5), tests in `tests/e2e/`
- **Coverage excludes**: `src/locales/**`, `src/components/ui/**`, `src/components/email/**`
- **Path alias**: `@/` maps to `./src/` in vitest via vite-tsconfig-paths (but note tsconfig maps `@/*` to `./*`)

## Code Style

- **Prettier**: no semicolons, double quotes, trailing commas, 100 char width, 2-space indent
- **ESLint**: next/core-web-vitals + typescript rules, unused vars prefixed with `_`
- **Tailwind**: use semantic CSS variables (e.g., `text-foreground` not `text-gray-900`), use `cn()` utility from `@/lib/utils` for class merging
- **Components**: use `data-slot` attributes for identification, `forwardRef` when accepting refs, CVA for variant-based styling

## CI Pipeline

Runs on push/PR to `main` and `integration` branches:

1. **Parallel**: lint, format check, type check, vitest with coverage
2. **Sequential**: build (after all checks) → E2E tests → SonarCloud analysis

## Git Branching

- `main`: production
- `integration`: integration/staging (Dependabot targets this)
- Feature branches: `feature/*`

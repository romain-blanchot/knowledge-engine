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
| E2E tests | `pnpm exec playwright test` |
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

## Path Aliases

Both tsconfig and vitest remap `@/components/*` and `@/hooks/*` to the `presentation/` subdirectory:

| Alias | Resolves to |
|-------|-------------|
| `@/*` | `./src/*` |
| `@/components/*` | `./src/presentation/components/*` |
| `@/hooks/*` | `./src/presentation/hooks/*` |

This means `import { Button } from "@/components/ui/button"` resolves to `src/presentation/components/ui/button`, not `src/components/ui/button`.

## Key Tech Stack

- **Database**: PostgreSQL + Prisma 7 (schema at `prisma/schema.prisma`, config at `prisma.config.ts`, generated client at `prisma/generated/prisma`)
- **UI**: shadcn/ui (new-york style, baseColor neutral) + Radix UI + Tailwind CSS 4 + CVA for variants
- **Tailwind**: v4 with inline `@theme` in `src/app/globals.css` (no `tailwind.config.ts`). Animations via `tw-animate-css`
- **Forms**: React Hook Form + Zod 4 validation
- **Data fetching**: TanStack React Query (1-minute default staleTime)
- **Tables**: TanStack React Table
- **URL state**: nuqs (type-safe query string state)
- **HTTP client**: Ky
- **Auth**: NextAuth 5 (beta 30) + bcryptjs for password hashing
- **Payments**: Stripe + @stripe/react-stripe-js
- **Email**: Resend + React Email
- **Toasts**: Sonner
- **Icons**: Lucide React
- **Dates**: date-fns + react-day-picker
- **Fonts**: Geist Sans + Geist Mono via `next/font/google`
- **Locale**: fr-FR (Playwright E2E tests default)

## Testing

- **Unit/Integration**: Vitest with jsdom + React Testing Library, tests in `tests/unit/` and `tests/integration/`, setup file at `tests/setup.ts`
- **Mocking**: MSW (Mock Service Worker) for HTTP mocking
- **E2E**: Playwright targeting Chromium + Mobile Chrome (Pixel 5), tests in `tests/e2e/`
- **Coverage excludes**: `src/locales/**`, `src/components/ui/**`, `src/components/email/**`

## Code Style

- **Prettier**: no semicolons, double quotes, trailing commas, 100 char width, 2-space indent, plugin `prettier-plugin-tailwindcss` (sorts classes in `clsx`, `cn`, `cva` calls)
- **ESLint**: flat config (`eslint.config.mjs`), next/core-web-vitals + next/typescript + prettier, unused vars prefixed with `_`
- **Tailwind**: use semantic CSS variables (e.g., `text-foreground` not `text-gray-900`), use `cn()` utility from `@/lib/utils` for class merging
- **Components**: use `data-slot` attributes for identification, `forwardRef` when accepting refs, CVA for variant-based styling

## CI Pipeline

Runs on push/PR to `main` and `integration` branches (cancels in-progress runs on same branch):

1. **Parallel**: lint, format check, type check, vitest with coverage
2. **Sequential**: build (after all checks) → E2E tests (Playwright) → SonarCloud analysis

## Git Branching

- `main`: production
- `integration`: integration/staging (Dependabot targets this)
- Feature branches: `feature/*`

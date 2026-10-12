# AGENTS.md: rules for MyStyle AI

## Mission
Build MyStyle AI: a production-ready AI Personal Wardrobe & Fashion Stylist PWA with mobile-first UX, intelligent digital wardrobe management, deterministic compatibility engine, multi-user Supabase cloud persistence, server-side OpenAI integration, seamless demo fallback mode, visual outfit flat-lays, and calendar planner.

## Stack
- Next.js (App Router), React 18/19, TypeScript (strict), Tailwind CSS
- Lucide React icons, Framer Motion
- Supabase PostgreSQL (Row-Level Security, migrations, seed data)
- Supabase Auth (Email/password, persistent sessions, route guards)
- Supabase Storage (image buckets with secure upload & signed URLs)
- OpenAI API abstraction (Vision analysis for clothes, Stylist recommendation & explanations, deterministic local mock fallback when keys are absent)
- Client state & offline fallback: Local demo mode & offline cache
- Testing: Vitest + React Testing Library for unit/integration tests, Playwright for E2E flows

## Engineering & Safety Rules
- TypeScript strict: no `any` without documented reason.
- Clear separation of concerns: Presentation in components, domain logic in services/engine, server routes in `src/app/api`.
- AI integration behind abstraction layer with robust Zod validation. When external credentials are not provided, gracefully switch to high-fidelity deterministic mock mode.
- Never invent owned garments: recommendations must strictly use items belonging to the user.
- Positive, proportion-based fashion styling guidance.
- Mobile-first responsive layout with bottom navigation on mobile and collapsible sidebar on desktop.
- Run tests and typecheck before reporting complete.


# AGENTS.md: rules for every session

## Mission
Build Private Closet exactly as described in docs/SPEC.md, using the design in docs/TECH_DESIGN.md. The product's central promise is privacy: no data about the user leaves the device.

## Stack (fixed unless I approve a change)
React 18+, TypeScript (strict), Vite, Tailwind CSS, React Router, Zustand for UI state, Dexie (IndexedDB) for app data, Zod for validation, vite-plugin-pwa (Workbox) for the service worker, Vitest + Testing Library for unit/component tests, Playwright + axe-core for end-to-end and accessibility tests, ESLint + Prettier. Prefer a small set of well-maintained dependencies and justify each new one.

## Privacy rules (hard)
- No analytics, telemetry, error-reporting services, ads, third-party scripts, CDNs, or remote fonts. Self-host fonts (for example via @fontsource packages for Inter and Fraunces).
- No direct use of fetch, XMLHttpRequest, WebSocket, EventSource, or navigator.sendBeacon outside src/net/guardedFetch.ts. Enforce with an ESLint rule (no-restricted-globals / no-restricted-properties) and make lint fail on violations.
- Every outbound request is registered in src/net/registry.ts with a purpose, destination, whether it is enabled by default, and what data it can carry. The Privacy Center reads from this registry, so the UI can never drift from the code.
- Ship a strict Content-Security-Policy (see TECH_DESIGN section 8).
- Photos and Style Profile values never leave IndexedDB/OPFS except through a user-initiated, encrypted export.
- Strip EXIF and location metadata from every imported photo.
- Never log personal data to the console in production builds.

## Copy and safety rules (hard)
- Never use these words or ideas in user-facing copy: slimming, slim, hide (as in hiding a body part), fix your shape, correct your figure, flatter your figure/body, BMI, "problem area", "ideal weight".
- Body-related advice is always proportion-based and positive: "works with your proportions".
- Weight is never required, never shown in summaries, never used to calculate BMI. If it exists at all it lives in a collapsed Advanced section.
- AI output is a suggestion. Always show an edit path and a "not me" path. Never imply certainty about skin tone, face shape, or taste.
- Add a unit test (copy-lint) that scans all source copy and i18n strings for banned terms and fails the build.

## Engineering rules
- TypeScript strict, no `any` without a comment explaining why.
- Feature folders; shared UI in src/ui; pure logic (engine, color science) in src/engine with no React imports so it is fully unit-testable.
- All AI-like capabilities are behind interfaces in src/ai (see TECH_DESIGN section 5). Mock implementations are deterministic and clearly labeled "simulated" in dev tools and in the Privacy Center's model list.
- Persistent state: Dexie for app data; localStorage only for tiny preferences (theme, last tab, reduced-motion override).
- Every screen handles loading, empty, error, and offline states.
- Accessibility: semantic HTML, visible focus, 44x44 minimum targets, labels on icon-only buttons, trapped focus and Escape-to-close in sheets and dialogs, prefers-reduced-motion respected, color never the only signal (charts use labels or patterns).
- Design tokens live in one place (tailwind config + CSS variables) and support light and dark themes. No hard-coded colors in components.
- Keep components small and reusable; build the component library before screens.

## Process rules
- Plan first, get approval, then build phase by phase.
- After each phase run: npm run lint, npm run typecheck, npm run test, npm run build, and the relevant Playwright flows. Do not report a phase complete if any fail.
- Be honest in every report about what is simulated, partial, or untested.
- Do not add features outside docs/SPEC.md without asking. If the spec is ambiguous, list the options and recommend one.

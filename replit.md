# Summer School Community Platform

A private, invite-only web app for a single cohort of summer school students to connect, share, and collaborate.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/community run dev` — run the frontend (Vite dev server)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, TanStack Query, Wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → `lib/api-client-react`)
- Build: esbuild (CJS bundle)
- Session: `cookie-session` with `SESSION_SECRET`

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for all API shapes)
- `lib/db/src/schema/` — Drizzle schema (users, profiles, posts, comments, events, settings)
- `lib/api-client-react/src/generated/` — generated hooks + Zod schemas (do not edit manually)
- `lib/api-zod/src/` — generated Zod validators for API inputs (do not edit manually)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/community/src/pages/` — all frontend pages
- `artifacts/community/src/lib/auth-context.tsx` — auth context provider

## Architecture decisions

- Contract-first: OpenAPI spec defines all shapes; backend and client both generated from it.
- Generated hooks (`@workspace/api-client-react`) return bare arrays for list endpoints matching the spec; backend must match.
- Session stored in signed cookies (`cookie-session`), no server-side session store.
- Invite code stored in `settings` table with key `"invite_code"` (default: `SUMMER25`).
- Admin user seeded at app startup (id=1, `admin@summercamp.edu`, password `Admin1234!`).

## Product

- **Login / Join**: Sign in or register with an invite code
- **Onboarding wizard**: New students fill in college, major, year, bio, interests, pronouns
- **Home feed**: Posts of type announcement/discussion/resource/introduction; emoji reactions; pinned posts at top
- **Directory**: Browse all student profile cards, search by name/college/tag
- **Student profiles**: Full profile with bio, tags, social links, fun fact
- **Events**: Browse upcoming/past events; RSVP going/maybe/not going
- **Admin dashboard**: User list, stats, invite code management, post moderation

## Seeded accounts

| Email | Password | Role |
|---|---|---|
| admin@summercamp.edu | Admin1234! | admin |
| maya@mit.edu | Student1234! | student |
| luca@stanford.edu | Student1234! | student |
| priya@cam.ac.uk | Student1234! | student |
| james@yale.edu | Student1234! | student |
| sofia@columbia.edu | Student1234! | student |

Invite code: **SUMMER25**

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run codegen (`pnpm --filter @workspace/api-spec run codegen`) after changing `openapi.yaml`
- Always run `pnpm --filter @workspace/db run push` after changing DB schema files
- Generated files in `lib/api-client-react/src/generated/` and `lib/api-zod/src/` must never be edited manually
- Import types from `@workspace/api-client-react` (the package root), not from deep paths like `/src/generated/api.schemas`
- The API server bundles with esbuild and runs the dist output — always restart workflow after changes

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

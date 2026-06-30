# PromoPress

Internal mockup builder: place customer logos onto product photos at
defined print/embroidery zones, replacing the manual `.cdr` → PDF workflow.

## Setup

```bash
npm install
cp .env.example .env   # adjust if needed
npx prisma migrate dev # creates dev.db and applies the schema
npx prisma db seed     # bootstraps the first admin account
npm run dev
```

The seed script prints the admin login (default
`admin@promopress.local` / `ChangeMe123!`) — log in with that, then use
**Users** in the nav to promote other accounts to `SALES` or `ADMIN`.
Self-registration always creates a `CUSTOMER` account; there's no UI path
to create an admin, by design.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` / `npm run typecheck` — checks also run in CI
- `npm run test:unit` — Vitest unit tests (pure logic, e.g. the logo
  placement math in `src/features/mockups/placement-math.ts`)
- `npm run test:e2e` — Playwright tests that drive a real browser against
  a disposable `test.db` (auto-created/migrated/seeded, never touches your
  local `dev.db`). Auto-starts the dev server, so just run it directly.
- `npx prisma studio` — browse/edit the local SQLite database

All four checks (lint, typecheck, build, both test suites) run in CI on
every push.

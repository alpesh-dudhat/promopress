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
- `npx prisma studio` — browse/edit the local SQLite database

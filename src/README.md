# Folder structure

- `app/` — Next.js routes only. Keep these thin: wire up data and render
  components from `features/`. Do not put business logic here.
- `features/<name>/` — everything specific to one domain (types, data
  access, server actions, UI). Add `products`, `mockups`, `auth` here as
  they grow.
- `components/` — UI components shared across multiple features (e.g.
  buttons, layout shells). If a component is only used by one feature, it
  belongs in that feature's folder instead.
- `lib/` — cross-cutting utilities with no feature ownership (database
  client, env config, generic helpers).

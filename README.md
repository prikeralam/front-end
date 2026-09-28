# PRI Website — frontend

The public website and staff dashboard for **PRI** (Policy and Research Initiative): the homepage, About, People, Projects, Research & Publications, the Data Repository & Library, and a signed-in `/dashboard` where staff draft, review and publish content and manage dataset access.

Next.js (App Router, TypeScript, Tailwind CSS), deployed as a Docker image to EC2 (staging and production; see [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) section 5). Content, datasets, sign-in and roles come from the Django REST backend in the sibling repo [`website-backend`](https://github.com/prikeralam/website-backend); this app never talks to a database directly.

## Getting started

```bash
npm install
cp .env.example .env.local   # set API_URL to a running backend
npm run dev                  # http://localhost:3000
```

For a local backend, run `website-backend` next to this repo (`../backend`) and load its demo data with `python manage.py seed_demo` (demo users are `demo_<role>` / `demo-pass-123`).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npx tsc --noEmit` | Type check |
| `npm run api:types` | Regenerate `app/_lib/api/schema.d.ts` from the backend's OpenAPI contract (`API_SCHEMA` overrides the source) |

## Layout

- `app/<route>/` — pages; route-local components live in that route's `_ui/`.
- `app/_lib/api/` — the typed, server-only API client, adapters from API shapes to UI types, and loaders.
- `app/_lib/auth/` — sign-in: JWTs in httpOnly cookies behind the one `app/api/auth/[[...action]]` route.
- `app/_lib/dashboard/` — Server Actions for everything that needs the signed-in user's token.
- `app/_lib/cms/` — the table describing each CMS content type the dashboard edits.
- `app/_ui/` — shared components. `app/_content/` — hand-written copy for sections with no backend yet (events, careers, fellowships, donations, contact).

`CLAUDE.md` records the architecture, decisions and changelog in detail; `docs/PRDs/` holds the frontend specs.

## Contributing

Work on `feat/<issue>-<desc>` (or `fix/`, `chore/`…) branches and open PRs into `dev`; `dev` → `staging` → `main` are promotions, and `main` deploys to production. Conventional Commits, and no `Co-Authored-By` trailers. See [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md).

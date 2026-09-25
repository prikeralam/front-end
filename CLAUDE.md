# PRI Website

## What this is

The public website and backend platform for **PRI** (Policy and Research Initiative). It is the initiative's central digital platform: it showcases PRI's mission and research, hosts a public knowledge hub (publications, datasets, visual tools), supports outreach and donor communication, provides portals for fellows/interns/researchers, and runs operational workflows (event registration, job postings, program tracking).

Source spec: `12. Website Development.docx` (project root) — a two-part document covering the frontend site structure and the backend development plan. This CLAUDE.md is the working summary; the docx is the canonical original if anything here needs re-checking.

## Tech stack (fixed)

- **Frontend:** Next.js
- **Backend:** Django
- **API layer:** Django REST Framework by default. **Open decision** — whether to add FastAPI as a hybrid service for specific async/high-throughput endpoints (e.g. dataset queries, dashboards), or stay Django+DRF only. Not resolved yet; revisit when coding starts on the first backend module. See "Open decisions" below.
- **Database:** PostgreSQL
- **File storage:** AWS S3 or DigitalOcean Spaces (datasets, publications, media)
- **Hosting:** VPS (DigitalOcean/AWS Lightsail) or Docker containers
- **Search:** ElasticSearch or Postgres full-text search (repository/publications/media-watch tagging)
- **Version control / CI:** GitHub or GitLab with CI/CD — **repo not created yet**, deliberately deferred until code writing begins
- **Security baseline:** SSL, 2FA/OAuth on admin panels, rate limiting, encrypted backups

## Workflow rule

**No module gets code until it has an approved spec.** Specs live in `docs/PRDs/` (see `docs/PRDs/README.md` for the full index and status of every section/module). Specs are written using the `to-spec` skill template (Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes) and, for now, saved as local Markdown files rather than published to an issue tracker, since no tracker exists yet.

## Site map — frontend (12 sections)

| # | Section | Phase |
|---|---|---|
| 1 | Homepage | **Phase 1** |
| 2 | About PRI | **Phase 1** |
| 3 | Research & Publications Hub | Future |
| 4 | Data Repository & Library | **Phase 1** |
| 5 | Fellowship & Internship Portal | Future |
| 6 | Advocacy & Policy Engagement | Future |
| 7 | Media Watch & Rapid Response | Future |
| 8 | Partner & Consortium Network | Future |
| 9 | Donors & Sponsors Forum | Future |
| 10 | Events & Campaigns | Future |
| 11 | Get Involved | Future |
| 12 | Contact & Newsletter | Future |

## Site map — backend modules (8)

| Letter | Module | Phase |
|---|---|---|
| A | Content Management System | **Phase 1** |
| B | Publication Repository Module | Future |
| C | Data Repository & Dashboard Integration | **Phase 1** |
| D | Fellowship / Internship Management System | Future |
| E | Media Watch & Rapid Response Module | Future |
| F | Donor & Fundraising Backend | Future |
| G | Forms, Surveys & Contact Management | Future |
| H | User Access & Roles (permissions layer, not a standalone feature module) | Cross-cutting |

## Roles & permissions (site-wide)

| Role | Permissions |
|---|---|
| Admin | Full access to all modules |
| Editor | Approve/publish content, upload research |
| Researcher | Draft research entries, upload datasets |
| Intern/Fellow | Submit work, view assigned pages |
| Donor/Visitor | Limited access (downloads, forms, donation) |

Content workflow (Module A): **Draft → Review → Approve → Publish**.

## Open decisions

- **Django/DRF vs. FastAPI hybrid vs. pure FastAPI** — deferred until coding starts on the first backend module (likely Module A). Django+DRF is the default for all modules, **including Module C again** — see below.
- **Module C's CKAN pivot (2026-09-15) is reversed as of 2026-09-19.** Module C is back to being a bespoke Django + DRF app, built in `pri-backend` alongside Modules A/B/D–H (not a standalone service). `pri-ckan` (the CKAN + Postgres + Solr + Redis stack) is **decommissioned**. See `docs/PRDs/backend/C-data-repository-dashboard-integration.md`'s 2026-09-19 amendment for the full detail, including the `internal_only`/`on_request` visibility model and `AccessRequest` workflow carrying over unchanged in shape into Django models.
  - **Code has not caught up to this decision yet.** `pri-website`'s `app/api/datasets/*` route handlers, `app/_lib/ckan.ts`, and `prisma/schema.prisma` are still the CKAN-era "Module C v0" implementation and still call a CKAN instance via `CKAN_URL` — which is unset in production, so **the live `/data` route is currently broken** (falls back to `http://localhost:5000`, unreachable from Vercel). Migrating the frontend to call `pri-backend`'s new datasets API instead is unstarted follow-up work.
- **Git/GitHub repo** — this repo (`sinankmuriyanal/pri-website`) has existed since 2026-09-08; it holds the frontend and, for now, the still-unmigrated CKAN-era Module C v0 layer (Prisma) described above. As of 2026-09-16 it is being renamed on disk from `Website` to `frontend`, now that a separate `pri-backend` repo (Django, Modules A/B/D–H, and — as of 2026-09-19 — C too) exists as its sibling — see the 2026-09-16 changelog entry.
- **Issue tracker** — none configured yet, so specs are local Markdown files under `docs/PRDs/` rather than tracker issues. Migrate them once a tracker exists.

## Phase 1 scope (current)

Only these get full specs and, later, code, in this order:
1. Frontend: Homepage
2. Frontend: About PRI
3. Backend: Module A — Content Management System
4. Frontend: Data Repository & Library
5. Backend: Module C — Data Repository & Dashboard Integration

Everything else in the site map above is deliberately out of scope until Phase 1 is specced and reviewed.

## Git workflow

Same as the backend repo (`website-backend`); full description in `.github/CONTRIBUTING.md`.

- Branches: `feat/<issue#>-<desc>` (or `fix/`, `chore/`, `refactor/`, `docs/`) -> `dev` -> `staging` -> `main`. Never commit or push directly to `dev`, `staging` or `main`; a push to `main` deploys to production via Vercel.
- Merge methods: squash work branches into `dev`; **merge commits** for promotions (`dev` -> `staging`, `staging` -> `main`). Hotfixes: `fix/*` from `main` into `main`, then merge the two auto-opened `backport/*` PRs.
- Commits: Conventional Commits, `<type>(<scope>): <summary>`. **No `Co-Authored-By` trailer** (Vercel Hobby blocks those deploys). PR bodies end with `Closes #<issue>`; use `.github/PULL_REQUEST_TEMPLATE.md`.
- CI (`.github/workflows/ci.yml`): `typecheck`, `test`, `build`, and a not-yet-blocking `lint`; `pr-guard.yml` enforces the branch flow. Branch rulesets need GitHub Pro/Team on a private repo, so until applied the flow is followed by convention: merge only when checks are green. `scripts/setup-github-protection.sh` applies rulesets and labels.
- After a backend contract change, run `npm run api:types` and commit the regenerated `app/_lib/api/schema.d.ts` with the frontend change that needs it.

## Changelog

- **2026-09-02** — Converted the source `12. Website Development.docx` project description into this CLAUDE.md; established `docs/PRDs/` as the spec workflow; scoped Phase 1 to Homepage, About PRI, Data Repository & Library (frontend) and Modules A, C (backend); logged the Django/FastAPI and repo-timing decisions as open/deferred.
- **2026-09-04** — Corrected PRI's expansion from "Policy Research Institute" to "Policy and Research Initiative" — that is the institute's actual name; "PRI" abbreviation is unchanged.
- **2026-09-07** — Scaffolded the Next.js frontend (TypeScript, Tailwind, App Router) and built three visual-design prototypes each for Homepage and About PRI, for stakeholder curation before CMS (Module A) integration. No backend wiring yet; content is placeholder copy following the approved specs' section structure. Repo initialized locally; GitHub remote creation pending (`gh` CLI not available in this environment).
- **2026-09-08** — Built out all three homepage prototypes (v1/v2/v3) well beyond the stated Phase 1 scope, at the user's direction: real People section (Our Team, Patrons, Executive Council — 25 real names/designations with photos as supplied) with its own nav dropdown and profile pages; Partners split into Institutions (SAFI Group of Institutions, CH Mohammed Koya Chair, HADIA Centre for Social Excellence, Mamburam Thangal Institute) and Researchers; unified primary brand colour to `#243D9A`; four real "Kerala in Data" research articles (education, demography, health, migration) integrated as genuine Research & Publications entries with real interactive Plotly charts recoloured per version, replacing the placeholder-only publication list; working theme/format filtering on the Research page; Donors page now shows real impact metrics and a "Well Wishers Program" photo gallery; homepage rebuilt so three full-bleed project hero banners (SIR Project, Education, Demography & Migration) are the first thing seen, each linking to its own project page; every photo placeholder site-wide now falls back to verified stock photography instead of a dashed box. GitHub remote is live (`sinankmuriyanal/pri-website`) and this session's work was pushed to `main`. Given the scope has outgrown "Phase 1," the phase boundary above should be revisited with the user rather than treated as current.
- **2026-09-09** — Replaced the homepage's 3-column static hero grid with a single-slide `HeroCarousel` (prev/next arrows, dot nav) across v1/v2/v3; iterated its layout twice more per feedback — boxed it to the page's content-width column (white margins on wide screens, matching the sprf.in reference) instead of full-bleed, and changed its aspect ratio from a wide 12:5 strip to 3:2 to read as an editorial photo. Renamed the "About PRI" label to "Who we are" on the About page header and in the primary nav dropdown (Donors & Sponsors left unchanged). Integrated ~25 real office/event/delegation photographs supplied by PRI: new "Life at PRI" gallery on About, "Inside PRI" strip on Home, "Policy Conversations" strip on Advocacy, and filled every remaining placeholder photo slot on the Donors and Events pages (Named Programmes, Well Wishers Program, all 5 event cards, the Advocacy event snapshot) — no dashed "photograph needed" boxes remain on those pages. The About page's Organisational Chart slot is still a placeholder since it needs an actual diagram, not a photo.
- **2026-09-10** — Major IA restructure across v1/v2/v3, driven by direct stakeholder review of the prototypes: reordered and flattened the navbar to About / Research / Projects / Data / People / Engage (Research and the new Projects/Data top-level items are now plain links, not dropdowns; Contact moved from its own top-level item into the Engage dropdown; People dropdown reordered to Patrons, Executive Council, Partners, Our Team); deleted the Donors & Sponsors, Advocacy & Policy, and Media Watch pages and their content files entirely (no longer wanted); renamed Get Involved to Careers (route moved `get-involved/` → `careers/`); added a new `/about/annual-reports` page (split out of the About page, which also lost its placeholder Organisational Chart section); added a `/projects` index page (the route existed for detail pages but had no listing page). Homepage hero now leads with a PRI motto/tagline slide (`Know more` → About) followed by the Education and Demography & Migration project slides (SIR Project dropped from the hero, still reachable via `/projects`); added new "Featured Research" and "Featured Events & Campaigns" homepage sections (3 items each + "View all" link) replacing the old generic "Latest Updates" feed. Research & Publications: narrowed formats to Report / Working Paper / Data Story, added a Language field (English/Malayalam, since only the Research page needed any language distinction) and a `views` field for a new Latest/Most-read sort control, and added author identity — publications now reference a `Person` (`group: "author"`) instead of a raw name string, shown as a small photo + name on every research card/detail page and linking to that author's profile, which now lists all their publications. People grids (Team/Patrons/Executive) went from a 3-column to a denser 4-5-column layout with every person now carrying a bio. Footer rebuilt with explicit About/People/Engage/Explore columns (the old `nav.slice(0,4)` no longer matched the new nav shape), real address ("West Kodur, Kodur PO, Malappuram Dt, Kerala, India, 676504"), real email (`contact@priresearch.in`), registration/12A/80G numbers, and placeholder social icons (LinkedIn/Facebook/X/Instagram — real profile URLs still needed). Removed the non-functional EN/ML toggle from the navbar site-wide. Brand colour changed from `#243D9A` to `#253D9A` everywhere; brand font is now intended to be Gilroy-SemiBold but the actual `.woff2` file hasn't been supplied yet, so the heading font wiring (`app/v{1,2,3}/fonts.ts`) still uses the prior Google Fonts as a placeholder with a TODO to swap to `next/font/local` once the file arrives. Also integrated Sayyid Hashir's supplied team photo, adopted the fuller Executive-Council names (Dr. Noushad T, Muhammed Thufail, Dr. Afsal K) for the matching Team entries, and wired in the real Annual Report 2025–26 PDF supplied under `public/PDFs/`. Same session also added the first pass of Data Repository browsing (`/v2/data`, theme/dataset detail pages) and a fully client-side/mock "verified-user data portal" (`app/_lib/mockAuth.ts` — role-based sign-in, dataset download gating, access requests, admin user-role management) as an explicit, commented-as-such prototype standing in for the not-yet-built Module C/H backends.
- **2026-09-15** — Collapsed the three parallel design prototypes down to one real site: deleted `app/v1/` and `app/v3/` entirely and promoted `app/v2/*` up to `app/*` (root `app/page.tsx`/`app/layout.tsx` now are the real homepage/site shell — the old "variant chooser" landing page is gone; also caught and fixed 30 files' worth of hardcoded `/v2/...` `href`s left over from the move, which had been silently 404ing). Rebuilt the Data Repository & Library on **CKAN** (open-source data catalog) instead of the bespoke Django Module C originally specced — see the "Open decisions" entry above for the CKAN-vs-Django rationale and the Portal.js reversal. New `pri-ckan` repo (`github.com/sinankmuriyanal/pri-ckan`): CKAN 2.11 + Postgres + Solr + Redis via Docker Compose, seeded with all 9 placeholder/real datasets (5 real Sametham/KITE school CSVs uploaded as actual CKAN resources). Along the way, fixed two real infra bugs worth knowing about: (1) the official `ckan/ckan-postgres-dev` image bakes a fixed test-fixture database at a non-standard `PGDATA` path and silently ignores its own documented env vars — swapped to a plain `postgres:15-alpine` image with a hand-written init script instead; (2) **this machine had a native Postgres already listening on ports 5432/5433** outside Docker, which silently intercepted this project's first attempt at a local dev Postgres — moved to port 5434. Built the "Module C v0" thin API layer in this repo (`app/api/datasets/*`, `app/api/access-requests`, backed by Prisma/`prisma/schema.prisma` against a second local Postgres via this repo's own `docker-compose.yml`) that enforces the `public`/`on-request`/`internal` tiers CKAN can't express natively (CKAN only has public/private) and the access-request approve/deny workflow — verified end-to-end that an `internal` dataset is genuinely unreachable (404, not just hidden in the UI) for non-staff, and that an `on-request` download stays blocked until the specific requester is approved. Rewired every data/dashboard page (`app/data/*`, `app/dashboard/*`) off the old hardcoded `app/_content/datasets.ts` mock array onto this live API — deleted that file; `app/_content/dashboards.ts` now holds what's left hand-authored (the Datawrapper/Tableau embed list, filter-option lists). Table/map preview reads real CSV files fetched from CKAN's resource URLs and parsed server-side, not the old local `/public` copies. Session/role identification is still `app/_lib/mockAuth.ts`'s client-side localStorage session (Module H, real auth, is still future-phase) — only the dataset-access decisions themselves moved server-side. Prisma is pinned to 6.19.3 (7.x/8.x are unreleased rc/dev builds with an incompatible config format). Repo layout going forward: this repo (frontend), `pri-ckan` (CKAN, its own deploy), and the still-future `pri-backend` (Django, for Modules A/B/D–H, created when Module A starts).
- **2026-09-16** — Redesigned the `/dashboard` portal from a single top-tab nav into a full left-sidebar CMS shell, and stood up the long-planned `pri-backend` Django project as a separate repo. Frontend: new `app/dashboard/layout.tsx` + `DashboardSidebar` (collapsible desktop rail, off-canvas mobile drawer) replace `DashboardTabs.tsx` (deleted) across all 8 former call sites; sidebar IA adds Content (Module A: pages/content blocks, testimonials, documents), Team & People (person profiles across all groups, plus Partners), Projects, Research & Publications, an Audit Log (Module H), alongside the existing Data Repository and personal-tools sections, all role-gated with the existing `mockAuth.ts` predicates. Since none of these new content types had a backend yet, added a generalized `app/_lib/mockContentStore.ts` — one localStorage-backed Draft→In Review→Approved→Published(→Unpublished) workflow store shared across all 7 new content types (content blocks, testimonials, person profiles, partners, documents, projects, publications), replacing the old one-off `DraftPublication` pattern (migrated onto the new store; `DraftDataset` was deliberately left untouched since it's co-located with the real Prisma-backed access-request flow). `ContentBlock` and `Testimonial` didn't exist as types anywhere before this — added to `app/_lib/types.ts` per Module A's spec shape. This is UI-only: none of the new CMS screens write to a real backend yet, matching the same "prototype standing in for a future module" pattern `mockAuth.ts` already used for datasets/users. Backend: new sibling repo `pri-backend` (`github.com/sinankmuriyanal/pri-backend`, private) — Django 6 + DRF, custom `accounts.User` (role field deliberately using the same string values as the frontend's `Role` type — `public/researcher/editor/fellow/admin`, not `donor`, to avoid a translation layer later), a shared `workflow.WorkflowMixin` + permission classes reused by `content` (ContentBlock/Testimonial/PersonProfile/Document), `projects`, and `publications` apps, SimpleJWT auth, and the three Module H endpoints (`/api/users/me/role/`, `PATCH /api/users/{id}/role/`, `GET /api/audit-log/?module=&actor=`) — every workflow transition writes an audit-log row. Verified end-to-end (JWT issuance, draft→review→publish transition as different role tokens, audit-log rows appearing, 403s for non-admin role/audit-log access) against a real Postgres via Docker Compose (port 5435 — 5432–5434 already taken on this machine by the native Postgres and the two other repos' containers). **Does not** touch datasets/CKAN — Module C stays exactly as-is in this repo. **Not yet wired up** — the dashboard still runs entirely on mock auth and the existing dataset API; integrating the two is explicit future work. This repo is being renamed from `Website` to `frontend` in the same session, now that `pri-backend` exists as its sibling — see "Open decisions" below.
- **2026-09-19** — Reversed the 2026-09-15 CKAN decision: Module C goes back to being a bespoke Django + DRF app in `pri-backend` alongside Modules A/B/D–H, and `pri-ckan` is decommissioned. Documentation-only change in this repo — updated this file's "Open decisions" and `docs/PRDs/backend/C-data-repository-dashboard-integration.md` (new amendment) and `docs/PRDs/README.md`'s status table to record the reversal; the actual frontend migration off CKAN (`app/api/datasets/*`, `app/_lib/ckan.ts`, `prisma/schema.prisma`) has not happened yet and is tracked as open follow-up work — until it does, the live `/data` route stays broken (it still calls CKAN via `CKAN_URL`, which isn't configured in production). Separately, also fixed a real deploy-blocking bug found while investigating: the last several production deploys had been silently failing (`exceeded_serverless_functions_per_deployment` — Vercel Hobby plan caps a deployment at 12 serverless functions), so production had been stuck for days on a build from before the `/v2`-nav-prefix fix even landed; collapsed the `/api/datasets/*` route handlers from 5 separate functions down to 1 (`app/api/datasets/[[...slug]]/route.ts`) to clear the cap — same URLs, no behavior change. Worth another look once Module C's real migration starts, since the whole CKAN-era API surface is being replaced anyway.
- **2026-09-25** — Moved the frontend to its own repo, `github.com/prikeralam/front-end` (private; the old `sinankmuriyanal/pri-website` remote is kept locally as `legacy`), and adopted the backend's git workflow wholesale: three long-lived branches (`dev` default, `staging`, `main`), Conventional Commits, PR template, `pr-guard` branch-flow check, hotfix backport workflow, and a CI workflow adapted to Next.js (`typecheck`, `test`, `build`, plus a non-blocking `lint` because 24 mock-era lint errors remain). There are no deploy workflows: Vercel's Git integration deploys `main` and builds previews for other branches. Added `scripts/setup-github-protection.sh` (rulesets and labels), the branch-protection checklist, `docs/agents/*` for the issue-tracker and triage-label conventions, and `.gitattributes`. ESLint now ignores generated `.vercel/` output. This supersedes the "repo not created yet" and `sinankmuriyanal/pri-website` notes above.

## Agent skills

### Issue tracker

GitHub issues tracked via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical 5-role triage vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`CONTEXT.md` and `docs/adr/` at repo root). See `docs/agents/domain.md`.

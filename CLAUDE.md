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

- **Django/DRF vs. FastAPI hybrid vs. pure FastAPI** — deferred until coding starts on the first backend module (likely Module A). Django+DRF is still the default for Modules A, B, D–H. **Superseded for Module C specifically** (see below): that module is now being built on CKAN, not Django.
- **Module C is now CKAN-backed, not bespoke Django** — decided 2026-09-15. The Data Repository & Dashboard module's datasets/search/preview are served by CKAN (a dedicated data-catalog service, its own repo/deployment) rather than a hand-rolled Django app; the frontend talks to it via `@portaljs/components` (Datopian's Portal.js library) inside this repo. CKAN only has public/private visibility, so the spec's three-tier model (`public`/`on-request`/`internal`) is enforced by a thin API layer that sits in front of it. See `docs/PRDs/backend/C-data-repository-dashboard-integration.md`'s amendment note. This does not change the plan for Modules A/B/D–H, which remain Django+DRF, in their own future repo.
- **Git/GitHub repo** — not created yet. Per global rules a project needs a CLAUDE.md and a GitHub repo before code is written; the CLAUDE.md exists now, the repo is intentionally deferred until code writing begins.
- **Issue tracker** — none configured yet, so specs are local Markdown files under `docs/PRDs/` rather than tracker issues. Migrate them once a tracker exists.

## Phase 1 scope (current)

Only these get full specs and, later, code, in this order:
1. Frontend: Homepage
2. Frontend: About PRI
3. Backend: Module A — Content Management System
4. Frontend: Data Repository & Library
5. Backend: Module C — Data Repository & Dashboard Integration

Everything else in the site map above is deliberately out of scope until Phase 1 is specced and reviewed.

## Changelog

- **2026-09-02** — Converted the source `12. Website Development.docx` project description into this CLAUDE.md; established `docs/PRDs/` as the spec workflow; scoped Phase 1 to Homepage, About PRI, Data Repository & Library (frontend) and Modules A, C (backend); logged the Django/FastAPI and repo-timing decisions as open/deferred.
- **2026-09-04** — Corrected PRI's expansion from "Policy Research Institute" to "Policy and Research Initiative" — that is the institute's actual name; "PRI" abbreviation is unchanged.
- **2026-09-07** — Scaffolded the Next.js frontend (TypeScript, Tailwind, App Router) and built three visual-design prototypes each for Homepage and About PRI, for stakeholder curation before CMS (Module A) integration. No backend wiring yet; content is placeholder copy following the approved specs' section structure. Repo initialized locally; GitHub remote creation pending (`gh` CLI not available in this environment).
- **2026-09-08** — Built out all three homepage prototypes (v1/v2/v3) well beyond the stated Phase 1 scope, at the user's direction: real People section (Our Team, Patrons, Executive Council — 25 real names/designations with photos as supplied) with its own nav dropdown and profile pages; Partners split into Institutions (SAFI Group of Institutions, CH Mohammed Koya Chair, HADIA Centre for Social Excellence, Mamburam Thangal Institute) and Researchers; unified primary brand colour to `#243D9A`; four real "Kerala in Data" research articles (education, demography, health, migration) integrated as genuine Research & Publications entries with real interactive Plotly charts recoloured per version, replacing the placeholder-only publication list; working theme/format filtering on the Research page; Donors page now shows real impact metrics and a "Well Wishers Program" photo gallery; homepage rebuilt so three full-bleed project hero banners (SIR Project, Education, Demography & Migration) are the first thing seen, each linking to its own project page; every photo placeholder site-wide now falls back to verified stock photography instead of a dashed box. GitHub remote is live (`sinankmuriyanal/pri-website`) and this session's work was pushed to `main`. Given the scope has outgrown "Phase 1," the phase boundary above should be revisited with the user rather than treated as current.
- **2026-09-09** — Replaced the homepage's 3-column static hero grid with a single-slide `HeroCarousel` (prev/next arrows, dot nav) across v1/v2/v3; iterated its layout twice more per feedback — boxed it to the page's content-width column (white margins on wide screens, matching the sprf.in reference) instead of full-bleed, and changed its aspect ratio from a wide 12:5 strip to 3:2 to read as an editorial photo. Renamed the "About PRI" label to "Who we are" on the About page header and in the primary nav dropdown (Donors & Sponsors left unchanged). Integrated ~25 real office/event/delegation photographs supplied by PRI: new "Life at PRI" gallery on About, "Inside PRI" strip on Home, "Policy Conversations" strip on Advocacy, and filled every remaining placeholder photo slot on the Donors and Events pages (Named Programmes, Well Wishers Program, all 5 event cards, the Advocacy event snapshot) — no dashed "photograph needed" boxes remain on those pages. The About page's Organisational Chart slot is still a placeholder since it needs an actual diagram, not a photo.
- **2026-09-10** — Major IA restructure across v1/v2/v3, driven by direct stakeholder review of the prototypes: reordered and flattened the navbar to About / Research / Projects / Data / People / Engage (Research and the new Projects/Data top-level items are now plain links, not dropdowns; Contact moved from its own top-level item into the Engage dropdown; People dropdown reordered to Patrons, Executive Council, Partners, Our Team); deleted the Donors & Sponsors, Advocacy & Policy, and Media Watch pages and their content files entirely (no longer wanted); renamed Get Involved to Careers (route moved `get-involved/` → `careers/`); added a new `/about/annual-reports` page (split out of the About page, which also lost its placeholder Organisational Chart section); added a `/projects` index page (the route existed for detail pages but had no listing page). Homepage hero now leads with a PRI motto/tagline slide (`Know more` → About) followed by the Education and Demography & Migration project slides (SIR Project dropped from the hero, still reachable via `/projects`); added new "Featured Research" and "Featured Events & Campaigns" homepage sections (3 items each + "View all" link) replacing the old generic "Latest Updates" feed. Research & Publications: narrowed formats to Report / Working Paper / Data Story, added a Language field (English/Malayalam, since only the Research page needed any language distinction) and a `views` field for a new Latest/Most-read sort control, and added author identity — publications now reference a `Person` (`group: "author"`) instead of a raw name string, shown as a small photo + name on every research card/detail page and linking to that author's profile, which now lists all their publications. People grids (Team/Patrons/Executive) went from a 3-column to a denser 4-5-column layout with every person now carrying a bio. Footer rebuilt with explicit About/People/Engage/Explore columns (the old `nav.slice(0,4)` no longer matched the new nav shape), real address ("West Kodur, Kodur PO, Malappuram Dt, Kerala, India, 676504"), real email (`contact@priresearch.in`), registration/12A/80G numbers, and placeholder social icons (LinkedIn/Facebook/X/Instagram — real profile URLs still needed). Removed the non-functional EN/ML toggle from the navbar site-wide. Brand colour changed from `#243D9A` to `#253D9A` everywhere; brand font is now intended to be Gilroy-SemiBold but the actual `.woff2` file hasn't been supplied yet, so the heading font wiring (`app/v{1,2,3}/fonts.ts`) still uses the prior Google Fonts as a placeholder with a TODO to swap to `next/font/local` once the file arrives. Also integrated Sayyid Hashir's supplied team photo, adopted the fuller Executive-Council names (Dr. Noushad T, Muhammed Thufail, Dr. Afsal K) for the matching Team entries, and wired in the real Annual Report 2025–26 PDF supplied under `public/PDFs/`. Same session also added the first pass of Data Repository browsing (`/v2/data`, theme/dataset detail pages) and a fully client-side/mock "verified-user data portal" (`app/_lib/mockAuth.ts` — role-based sign-in, dataset download gating, access requests, admin user-role management) as an explicit, commented-as-such prototype standing in for the not-yet-built Module C/H backends.
- **2026-09-15** — Collapsed the three parallel design prototypes down to one real site: deleted `app/v1/` and `app/v3/` entirely and promoted `app/v2/*` up to `app/*` (root `app/page.tsx`/`app/layout.tsx` now are the real homepage/site shell — the old "variant chooser" landing page is gone). Decided to rebuild the Data Repository & Library on **CKAN** (open-source data catalog) instead of the bespoke Django Module C originally specced, with **Datopian's Portal.js** (`@portaljs/components`) as the frontend integration layer inside this app, and a thin custom API layer (not a CKAN plugin) enforcing the `public`/`on-request`/`internal` visibility tiers CKAN doesn't natively support — see the "Open decisions" entry above and the amendment this adds to `docs/PRDs/backend/C-data-repository-dashboard-integration.md`. Confirmed the resulting repo layout: this repo (frontend), a new `pri-ckan` repo (CKAN + Postgres/Solr/Redis via Docker), and the still-future `pri-backend` (Django, for Modules A/B/D–H, created when Module A starts) — CKAN is not a replacement for that Django backend, just Module C's data-catalog engine. Docker Desktop is not installed on the dev machine yet — needed before the CKAN repo's stack can actually run locally.

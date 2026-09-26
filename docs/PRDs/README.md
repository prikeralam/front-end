# PRI Website — Spec Index

Specs for this project are written using the `to-spec` skill's template (Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes) and saved here as local Markdown files rather than published to an issue tracker, since no tracker/repo exists yet (see [`CLAUDE.md`](../../CLAUDE.md) "Open decisions"). Migrate these into real tracker issues once one is set up.

**Rule:** no section or module gets code until its spec here is drafted and reviewed.

All 12 frontend sections and all 8 backend modules from the source document now have a full spec (20 specs total). 5 are prioritized for the first build phase; the remaining 15 are drafted for stakeholder review and completeness, not yet scheduled.

## Phasing

Phase 1 covers 3 frontend sections and 2 backend modules, chosen because they're the minimum needed to stand up a working homepage/about/data-repository slice of the site: Homepage and About PRI both depend on the CMS (Module A); Data Repository & Library depends on Module C. Every other section/module below is fully specced but marked "Future phase" — not yet scheduled for build.

## Frontend sections (12)

| # | Section | Status | Spec |
|---|---|---|---|
| 1 | Homepage | **Drafted — Phase 1** | [frontend/01-homepage.md](frontend/01-homepage.md) |
| 2 | About PRI | **Drafted — Phase 1** | [frontend/02-about-pri.md](frontend/02-about-pri.md) |
| 3 | Research & Publications Hub | Drafted · Future phase | [frontend/03-research-publications-hub.md](frontend/03-research-publications-hub.md) |
| 4 | Data Repository & Library | **Drafted — Phase 1** | [frontend/04-data-repository-library.md](frontend/04-data-repository-library.md) |
| 5 | Fellowship & Internship Portal | Drafted · Future phase | [frontend/05-fellowship-internship-portal.md](frontend/05-fellowship-internship-portal.md) |
| 6 | Advocacy & Policy Engagement | Drafted · Future phase | [frontend/06-advocacy-policy-engagement.md](frontend/06-advocacy-policy-engagement.md) |
| 7 | Media Watch & Rapid Response | Drafted · Future phase | [frontend/07-media-watch-rapid-response.md](frontend/07-media-watch-rapid-response.md) |
| 8 | Partner & Consortium Network | Drafted · Future phase | [frontend/08-partner-consortium-network.md](frontend/08-partner-consortium-network.md) |
| 9 | Donors & Sponsors Forum | Drafted · Future phase | [frontend/09-donors-sponsors-forum.md](frontend/09-donors-sponsors-forum.md) |
| 10 | Events & Campaigns | Drafted · Future phase | [frontend/10-events-campaigns.md](frontend/10-events-campaigns.md) |
| 11 | Get Involved | Drafted · Future phase | [frontend/11-get-involved.md](frontend/11-get-involved.md) |
| 12 | Contact & Newsletter | Drafted · Future phase | [frontend/12-contact-newsletter.md](frontend/12-contact-newsletter.md) |

## Backend modules (8)

| Letter | Module | Status | Spec |
|---|---|---|---|
| A | Content Management System | **Drafted — Phase 1** | `website-backend` → `docs/PRDs/A-content-management-system.md` |
| B | Publication Repository Module | Drafted · Future phase | `website-backend` → `docs/PRDs/B-publication-repository-module.md` |
| C | Data Repository & Dashboard Integration | **Drafted — Phase 1 · Django+DRF in `website-backend` (CKAN pivot reversed, see amendment)** | `website-backend` → `docs/PRDs/C-data-repository-dashboard-integration.md` |
| D | Fellowship / Internship Management System | Drafted · Future phase | `website-backend` → `docs/PRDs/D-fellowship-internship-management-system.md` |
| E | Media Watch & Rapid Response Module | Drafted · Future phase | `website-backend` → `docs/PRDs/E-media-watch-rapid-response-module.md` |
| F | Donor & Fundraising Backend | Drafted · Future phase | `website-backend` → `docs/PRDs/F-donor-fundraising-backend.md` |
| G | Forms, Surveys & Contact Management | Drafted · Future phase | `website-backend` → `docs/PRDs/G-forms-surveys-contact-management.md` |
| H | User Access & Roles (cross-cutting permissions layer) | Drafted · Future phase | `website-backend` → `docs/PRDs/H-user-access-roles.md` |

## Dependency map (Phase 1)

```
Homepage (frontend/01) ──depends on──> Module A (backend/A)
About PRI (frontend/02) ──depends on──> Module A (backend/A)
Data Repository & Library (frontend/04) ──depends on──> Module C (backend/C)
```

## Dependency map (future phases)

```
Research & Publications Hub (3)        ──> Module B, Module A (author profiles)
Fellowship & Internship Portal (5)     ──> Module D, Module A (fellow profiles)
Advocacy & Policy Engagement (6)       ──> Module A (extension, no dedicated module)
Media Watch & Rapid Response (7)       ──> Module E
Partner & Consortium Network (8)       ──> Module A (partner listings), Module G (forms)
Donors & Sponsors Forum (9)            ──> Module F, Module A (reports/named programs)
Events & Campaigns (10)                ──> Module G (registration), Module A (event content)
Get Involved (11)                      ──> Module G (forms), Module A (job board)
Contact & Newsletter (12)              ──> Module G

Module H (User Access & Roles) ──feeds──> every module (A–G) — cross-cutting, see Further Notes in its own spec
```

## Open items surfaced across all specs

- **Django+DRF vs. FastAPI hybrid vs. pure FastAPI** — unresolved, deferred to when coding starts (see `CLAUDE.md`). Module C remains the strongest FastAPI-hybrid candidate if that path is chosen.
- **Person/role content model** — whether governance members (About PRI), research authors (Research Hub, Module B), and fellows (Fellowship Portal, Module D) share one `PersonProfile` model or split into several. Module A's spec resolves this by using a single tagged model (`group` field); every downstream spec (03, 05, B, D) builds on that decision.
- **Multi-language content strategy (EN/Malayalam)** — Homepage and About PRI both need the toggle; the underlying content-storage approach (localized fields vs. separate rows) is not decided in Module A's spec.
- **`internal_only` dataset visibility** — Module C's spec assumes "fully hidden from public API," not just "download-gated." Needs explicit stakeholder confirmation before the data model is built.
- **Module H should likely be built earlier than "last alphabetically"** — Modules A and C (Phase 1) already implement ad hoc role logic that Module H is meant to formalize and every future module (B, D, E, F, G) will need the same logic. Worth raising when planning the phase after Phase 1.
- **Intern-application overlap** — Get Involved (§11)'s "intern form" and the Fellowship & Internship Portal (§5)/Module D's application system may be the same pipeline or two separate ones; needs stakeholder clarification before either is built.
- **Advocacy & Policy Engagement (§6)** is modeled as an extension of Module A rather than a dedicated backend module, since the source doc's 8 backend modules (A–H) don't include one for advocacy content — confirm this reading with stakeholders when §6 is prioritized.

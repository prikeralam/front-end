# Contributing / Git Workflow — PRI Website (frontend)

This is the frontend repo (`front-end`, Next.js). It follows the same workflow as the backend repo
(`website-backend`, Django/DRF); differences are in the deploy target (Vercel, not EC2) and in there being no
migrations here.

---

## 1. Branches

Three long-lived branches. Nothing else is long-lived.

| Branch | Purpose | Protected |
|---|---|---|
| `main` | Production. Vercel deploys it on merge. | Yes |
| `staging` | Pre-prod. Vercel Preview deployment pointed at the staging backend. | Yes |
| `dev` | Integration branch. Default branch for local work. | Yes (solo reviewer allowed) |

"Protected" is the intent; see [Enforcement](#enforcement) for what GitHub actually blocks today.

Short-lived work branches, cut from `dev`, deleted after merge:

```
feat/<issue#>-<short-description>
fix/<issue#>-<short-description>
chore/<short-description>
refactor/<short-description>
docs/<short-description>
```

Examples:
```
feat/12-people-team-from-api
fix/31-hero-carousel-focus-ring
chore/bump-next-version
```

### Promotion flow

```
feat/xyz  → PR → dev
dev       → PR → staging   (batch features, deploy, smoke test)
staging   → PR → main      (release)
```

Hotfixes to prod: branch `fix/*` from `main` directly, PR into `main`.
The Hotfix backport workflow then opens `backport/<pr>-to-staging` and
`backport/<pr>-to-dev` PRs for you, so the fix isn't lost on the next promotion.
Merge both. If a cherry-pick conflicts, the workflow opens an issue instead and
you cherry-pick by hand.

Merge methods: work branch into `dev` is a squash merge. Promotion PRs
(`dev` -> `staging`, `staging` -> `main`) are **merge commits**. Squashing a
promotion makes the branches diverge and every later promotion conflicts.

---

## 2. Commit messages — Conventional Commits

```
<type>(<scope>): <short summary>
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`

**Scope:** the PRD section or area — `homepage`, `about`, `people`, `research`, `data-repo`, `auth`, `cms`, `api`

Examples:
```
feat(people): read the team page from the backend API
fix(data-repo): stop the preview table overflowing on phones
chore(deps): bump next to 16.3.5
docs(prd): mark module C frontend as migrated
```

**No `Co-Authored-By` trailers.** Vercel's Hobby plan blocks deploys when one is present.

---

## 3. Issues

- One GitHub Issue per PRD section/module or per integration step. Split into
  sub-issues only if it genuinely spans multiple weeks.
- Branch name includes the issue number.
- PR description ends with `Closes #<issue>` to auto-close on merge.
- Trivial one-line fixes don't need an issue — just a `fix/` branch and a direct PR.
- Triage labels are described in `docs/agents/triage-labels.md`; issue commands in `docs/agents/issue-tracker.md`.

---

## 4. Pull requests

- Every PR targets `dev` (or `main`/`staging` only for the promotion/hotfix
  flows above) — never push directly to a protected branch.
- Self-review before merging, even solo: open the PR, step away, come back
  and read the diff as if it were someone else's code. This is the actual
  QA step when there's no second reviewer.
- Use the PR checklist in `.github/PULL_REQUEST_TEMPLATE.md`.
- Treat any PR containing Claude Code output with the same scrutiny as a
  junior dev's PR — check for silently assumed env vars, hardcoded API or
  media hosts, and UI states (loading / empty / error) that were never rendered.

---

## 5. Environments and CI/CD

| Env | Branch | Backend (`API_URL`) | Hosting |
|---|---|---|---|
| Dev | local / `dev` | local backend (`docker compose up` in `website-backend`, `http://localhost:8000`), seeded with `seed_demo` | `npm run dev` |
| Staging | `staging` | staging backend | Vercel Preview, env vars scoped to the `staging` branch |
| Production | `main` | production backend | Vercel Production |

Never point a staging deployment at the production backend. Set `API_URL` separately for the Production and
Preview (branch `staging`) scopes in the Vercel project. The backend must also list each deployed frontend
origin in its `CORS_ALLOWED_ORIGINS`, and media hosts the backend returns must be allow-listed in
`next.config.ts` (an unlisted host makes `next/image` throw).

### Workflows (`.github/workflows/`)

| Workflow | Runs on | What it does |
|---|---|---|
| `ci.yml` | every PR, push to `dev` | `typecheck` (`next typegen`, `tsc --noEmit`), `test` (Vitest), `build` (`next build` with no backend reachable), `lint` (ESLint) |
| `pr-guard.yml` | PRs into `dev`, `staging`, `main` | `branch-flow` fails a PR whose source/target pair is not an allowed promotion path (section 1) |
| `hotfix-backport.yml` | push to `main` from a `fix/*` PR | opens backport PRs into `staging` and `dev` |

There are no deploy workflows: Vercel's Git integration deploys `main` to production and builds a Preview for
every other branch and PR.

### Release flow

1. Merge work branches into `dev` (squash) once CI is green.
2. Open `dev` -> `staging`, merge commit. Check the Vercel Preview for the `staging` branch against the staging backend.
3. Open `staging` -> `main`, merge commit. Vercel deploys production.
4. Hotfix: `fix/*` from `main` -> `main`, then merge the two backport PRs.

### Backend contract

The API contract lives in the backend repo (`docs/api/`, `openapi.yaml`). After the backend changes an
endpoint, run `npm run api:types` (set `API_SCHEMA` to a path or a `/api/schema/` URL) and commit the updated
`app/_lib/api/schema.d.ts` in the same PR as the frontend change that needs it.

### Secrets and variables

Nothing sensitive is needed by the GitHub workflows. Runtime configuration is set in Vercel (`API_URL`, per
scope); the shape is in `.env.example`. Optional repository secret: `BACKPORT_TOKEN` (fine-grained PAT with
contents and pull-requests write on this repo); without it backport PRs don't trigger CI, so close and reopen
each one.

### Enforcement

The rulesets that would block merging on red checks, direct pushes, force-pushes
and the wrong merge method need GitHub Pro/Team on a private repo, so they may **not be applied** on this
repo. Until they are, the flow is followed by convention, and CI and `pr-guard` run but do not block:

- Merge only when `lint`, `typecheck`, `test`, `build` and `branch-flow` are green.
- Never push directly to `dev`, `staging` or `main`; a push to `main` deploys to production.
- Never force-push or delete the long-lived branches.
- Use the merge methods in section 1.

Once the plan allows it, run `scripts/setup-github-protection.sh`; it is safe to re-run.

---

## 6. Versioning

Frontend and backend repos version independently — don't try to keep tag numbers in sync across the two
repos. There is no automated release tagging here (the backend tags on deploy); tag a release by hand
(`gh release create`) when promoting `staging` to `main` if a named release is wanted.

---

## 7. What this deliberately skips

No `release/*` or full GitFlow branch taxonomy — three long-lived branches
plus short-lived work branches is the right complexity for a solo developer
now and for a 3–5 person team later. Add `CODEOWNERS` and require a second
approver when the team grows; the branch/environment structure doesn't change.

# Contributing / Git Workflow — PRI Website (frontend)

This is the frontend repo (`front-end`, Next.js). It follows the same workflow as the backend repo
(`website-backend`, Django/DRF), including the EC2 deploy pipeline; the difference is that there is no
database or migrations here.

---

## 1. Branches

Three long-lived branches. Nothing else is long-lived.

| Branch | Purpose | Protected |
|---|---|---|
| `main` | Production. Deployed to the production EC2 instance on merge (after manual approval). | Yes |
| `staging` | Pre-prod. Deployed to the staging EC2 instance on merge, pointed at the staging backend. | Yes |
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

**No `Co-Authored-By` trailers.**

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
| Staging | `staging` | staging backend | its own EC2 instance: Docker Compose (Next.js standalone server + nginx), `/opt/pri-frontend` |
| Production | `main` | production backend | its own EC2 instance, same layout |

Never point a staging deployment at the production backend. The backend must also list each deployed frontend
origin in its `CORS_ALLOWED_ORIGINS`, and media hosts the backend returns must be allow-listed for `next/image`
(an unlisted host makes `next/image` throw). `next.config.ts` is baked into the image at build time and one
image serves both environments, so those hosts come from the `IMAGE_HOSTS` repository variable (both
environments' storage buckets), not from the runtime `API_URL`.

### Workflows (`.github/workflows/`)

| Workflow | Runs on | What it does |
|---|---|---|
| `ci.yml` | every PR, except docs/Markdown-only changes and the `dev` -> `staging` and `staging` -> `main` promotion PRs (their code already passed on its own PR) | `typecheck` (`next typegen`, `tsc --noEmit`), `test` (Vitest), `build` (`next build` with no backend reachable), `lint` (ESLint), `docker-build` (builds the image, runs it, requests `/healthz`) |
| `pr-guard.yml` | PRs into `dev`, `staging`, `main` | `branch-flow` fails a PR whose source/target pair is not an allowed promotion path (section 1) |
| `deploy-staging.yml` | push to `staging` | builds and pushes the image to GHCR, then deploys it to the staging EC2 host over SSH (`staging` Environment) |
| `deploy-production.yml` | push to `main` | image, then manual approval, then SSH deploy, then git tag and GitHub Release (`production` Environment) |
| `hotfix-backport.yml` | push to `main` from a `fix/*` PR | opens backport PRs into `staging` and `dev` |

Images are tagged `sha-<commit>` and `tree-<git tree hash>`. A merge of `staging` into `main` has the same tree
as staging, so production **promotes the image already tested on staging** (retag, no rebuild). A hotfix or any
tree never seen on staging is built fresh.

On the host, `deploy/remote-deploy.sh` swaps in the new env file (which pins `IMAGE`), restarts the stack,
requests `/healthz` through nginx, and restores the previous image if that fails. `/healthz` does not call the
backend, so a backend outage does not roll back a frontend deploy.

### Release flow

1. Merge work branches into `dev` (squash) once CI is green.
2. Open `dev` -> `staging`, merge commit. The staging deploy runs; smoke test it against the staging backend.
3. Open `staging` -> `main`, merge commit. The production run pauses at the `production` Environment for
   approval. Approve it: the image is deployed and the release is tagged (section 6).
4. Hotfix: `fix/*` from `main` -> `main`, then merge the two backport PRs.

### Provisioning a host (once per environment)

Each environment is one EC2 host shared with the backend, a CloudFormation stack from website-backend's
`deploy/aws/host.yml` (instance, static IP, bucket, deploy key; nginx and certbot on the host). This repo only
deploys its container to `/opt/pri-frontend` and installs its nginx site there. The Environment secrets are in
[`docs/deploy/aws-provisioning.md`](../docs/deploy/aws-provisioning.md).

### Backend contract

The API contract lives in the backend repo (`docs/api/`, `openapi.yaml`). After the backend changes an
endpoint, run `npm run api:types` (set `API_SCHEMA` to a path or a `/api/schema/` URL) and commit the updated
`app/_lib/api/schema.d.ts` in the same PR as the frontend change that needs it.

### Secrets and variables

Set per GitHub Environment, not at repo level, so staging and prod stay isolated
(`gh secret set NAME --env staging`):

| Where | Name | Kind |
|---|---|---|
| `staging` and `production` | `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `EC2_SSH_KNOWN_HOSTS`, `APP_ENV_FILE` | secrets |
| repository | `IMAGE_HOSTS` | variable; build-time `next/image` hosts, comma-separated (`gh variable set IMAGE_HOSTS`) |
| repository (optional) | `BACKPORT_TOKEN` | secret; fine-grained PAT with contents and pull-requests write on this repo; without it backport PRs don't trigger CI, so close and reopen each one |

`APP_ENV_FILE` is the full runtime env file (see the "Deployed" section of `.env.example`): `ENVIRONMENT`
(must equal the environment being deployed; the deploy action refuses otherwise), `SERVER_NAME` and `API_URL`.
The GitHub side is scripted in `scripts/setup-github-protection.sh`.

### Enforcement

The rulesets that would block merging on red checks, direct pushes, force-pushes
and the wrong merge method need GitHub Pro/Team on a private repo, so they may **not be applied** on this
repo. Until they are, the flow is followed by convention, and CI and `pr-guard` run but do not block:

- Merge only when `lint`, `typecheck`, `test`, `build`, `docker-build` and `branch-flow` are green.
- Never push directly to `dev`, `staging` or `main`; a push to `main` deploys to production.
- Never force-push or delete the long-lived branches.
- Use the merge methods in section 1.

Once the plan allows it, run `scripts/setup-github-protection.sh`; it is safe to re-run.

---

## 6. Versioning

Every successful prod deploy is tagged and published as a GitHub Release automatically (`v0.1.0` for the
first). While pre-1.0, a `feat` commit since the last tag bumps the minor version and anything else bumps the
patch. Frontend and backend repos version independently — don't try to keep tag numbers in sync across the two
repos.

---

## 7. What this deliberately skips

No `release/*` or full GitFlow branch taxonomy — three long-lived branches
plus short-lived work branches is the right complexity for a solo developer
now and for a 3–5 person team later. Add `CODEOWNERS` and require a second
approver when the team grows; the branch/environment structure doesn't change.

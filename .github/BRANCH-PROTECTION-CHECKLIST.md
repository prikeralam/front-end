# Branch Protection Setup — frontend repo (`front-end`)

> **Automated:** `scripts/setup-github-protection.sh` applies sections 2-4 (rulesets), the repo setting and the
> labels, and prints what is still to do by hand. It is safe to re-run. The backend repo has the same checklist.
>
> **Plan limit:** rulesets on a private repo need GitHub Pro/Team (or a public repo). On Free the script reports a 403
> for that step. Until the plan changes, the workflow in CONTRIBUTING.md is followed by convention: CI and `pr-guard`
> still run on every PR but do not block merging, so merge only when they are green.

Run through this once, right after creating the repo, before the first commit lands.

## 1. Create branches

```bash
git checkout -b dev
git push -u origin dev
git checkout -b staging
git push -u origin staging
# main already exists as default
```

Set `dev` as the repo's default branch (Settings → General → Default branch)
so new PRs target it automatically.

## 2. Protect `main`

Settings → Branches → Add rule → branch name pattern `main`:
- [ ] Require a pull request before merging
- [ ] Require status checks to pass before merging (`typecheck`, `test`, `build`, `branch-flow`)
- [ ] Do not allow bypassing the above settings (include yourself)
- [ ] Block force pushes
- [ ] Block deletions

## 3. Protect `staging`

Same rule pattern as `main`, target `staging`.

## 4. Protect `dev`

- [ ] Require a pull request before merging
- [ ] Require status checks to pass (`typecheck`, `test`, `build`, `branch-flow`)
- [ ] Block force pushes
- [ ] Block deletions
- [ ] (Leave "require approvals" at 0 for now — solo dev. Set to 1 when the team grows.)

## 5. Vercel

- [ ] Import the repo; set the production branch to `main`
- [ ] `API_URL`: Production scope -> production backend; Preview scope limited to branch `staging` -> staging backend
- [ ] Confirm no commit carries a `Co-Authored-By` trailer (Hobby plan blocks those deploys)
- [ ] Add each deployed origin to the backend's `CORS_ALLOWED_ORIGINS`

## 6. Repo hygiene

- [ ] `.github/CONTRIBUTING.md` (workflow doc) and `.github/PULL_REQUEST_TEMPLATE.md` present
- [ ] `.env.example` lists every env var the app reads, with dummy values
- [ ] `.gitignore` covers `.env*` (except `.env.example`), `node_modules`, `.next`, `.vercel`

## 7. When the team grows to 3–5

- [ ] Add `CODEOWNERS` mapping areas to owners
- [ ] Raise `dev` required approvals from 0 to 1
- [ ] Raise `main`/`staging` required approvals to 1 (or 2 for `main`)
- [ ] Make `lint` a required check once the mock-era lint errors are gone

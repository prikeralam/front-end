## Summary

<!-- What does this change do, and why. -->

Closes #

## Type

- [ ] feat
- [ ] fix
- [ ] chore
- [ ] refactor
- [ ] docs

## Checklist

- [ ] Targets `dev` (not `main`/`staging`, unless this is a release/hotfix PR)
- [ ] Commit messages follow Conventional Commits (`feat(scope): summary`), no `Co-Authored-By` trailer
- [ ] Regenerated `app/_lib/api/schema.d.ts` (`npm run api:types`) if the backend contract changed
- [ ] Env vars documented in `.env.example` if new ones were added
- [ ] No hardcoded API/media hosts for one environment (use `API_URL`)
- [ ] Loading, empty and error states handled for any new data-driven UI
- [ ] `npx tsc --noEmit` and `npm test` pass locally
- [ ] Tested locally against the dev backend
- [ ] Self-reviewed the diff (not just skimmed)
- [ ] No secrets, credentials, or `.env` files committed

## Screenshots

<!-- For UI changes: before / after, desktop and phone width. -->

## Notes for reviewer

<!-- Anything that needs a second look, e.g. a backend gap worked around. -->

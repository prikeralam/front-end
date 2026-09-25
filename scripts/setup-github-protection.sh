#!/usr/bin/env bash
# Applies the repo hygiene from the branch-protection checklist (.github/BRANCH-PROTECTION-CHECKLIST.md):
#   1. repo settings (auto-delete merged branches)
#   2. triage and area labels (docs/agents/triage-labels.md)
#   3. rulesets protecting dev, staging and main
# Deploys are handled by Vercel's Git integration, so there are no GitHub Environments to create here.
# Safe to re-run: existing labels and rulesets are updated in place.
#
# Needs: gh logged in as a repo admin. Rulesets on a private repo need GitHub Pro/Team; on Free that step
# reports a 403 and the script exits non-zero after trying the rest.
#
# Usage: scripts/setup-github-protection.sh [owner/repo]
set -uo pipefail

repo="${1:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}"
failed=0

step() { printf '\n== %s\n' "$1"; }
warn() { printf 'FAILED: %s\n' "$1" >&2; failed=1; }

# Required status checks: the job names from ci.yml and pr-guard.yml.
checks='[{"context":"lint"},{"context":"typecheck"},{"context":"test"},{"context":"build"},{"context":"branch-flow"}]'

step "Repo settings"
gh api -X PATCH "repos/$repo" -F delete_branch_on_merge=true --silent \
  && echo "Merged branches are deleted automatically." \
  || warn "could not update repo settings"

step "Labels"
label() { # name, color, description
  gh label create "$1" --color "$2" --description "$3" --force --repo "$repo" >/dev/null \
    && echo "$1: ok" || warn "could not create label $1"
}
label needs-triage    FBCA04 "Maintainer needs to evaluate this issue"
label needs-info      D4C5F9 "Waiting on reporter for more information"
label ready-for-agent 0E8A16 "Fully specified, ready for an AFK agent"
label ready-for-human 1D76DB "Requires human implementation"
label wontfix         ffffff "Will not be actioned"
label ci              0E8A16 "CI/CD pipeline"
label frontend        C5DEF5 "Next.js frontend"
label integration     5319E7 "Wiring the frontend to the Django backend"
label module          1D76DB "Product module from a PRD"

# Promotion PRs (dev->staging, staging->main) must be merge commits: squashing them makes the branches
# diverge and every later promotion conflicts. Work-branch PRs into dev are squashed. Because promotion
# merges leave merge commits the source branch lacks, "require branch to be up to date" is off for
# staging/main (it would force merging staging back into dev, which pr-guard forbids).
ruleset() { # name, branch, merge method
  local name="$1" branch="$2" method="$3" id
  local body
  body=$(cat <<JSON
{
  "name": "$name",
  "target": "branch",
  "enforcement": "active",
  "conditions": {"ref_name": {"include": ["refs/heads/$branch"], "exclude": []}},
  "bypass_actors": [],
  "rules": [
    {"type": "deletion"},
    {"type": "non_fast_forward"},
    {"type": "pull_request", "parameters": {
      "required_approving_review_count": 0,
      "dismiss_stale_reviews_on_push": false,
      "require_code_owner_review": false,
      "require_last_push_approval": false,
      "required_review_thread_resolution": false,
      "allowed_merge_methods": ["$method"]
    }},
    {"type": "required_status_checks", "parameters": {
      "strict_required_status_checks_policy": false,
      "required_status_checks": $checks
    }}
  ]
}
JSON
)
  id=$(gh api "repos/$repo/rulesets" --jq ".[] | select(.name == \"$name\") | .id" 2>/dev/null | head -n1)
  if [ -n "$id" ]; then
    printf '%s' "$body" | gh api -X PUT "repos/$repo/rulesets/$id" --input - --silent \
      && echo "$name: updated" || warn "could not update ruleset $name"
  else
    printf '%s' "$body" | gh api -X POST "repos/$repo/rulesets" --input - --silent \
      && echo "$name: created" || warn "could not create ruleset $name (private repos need GitHub Pro/Team)"
  fi
}

step "Branch rulesets"
ruleset "protect-dev" dev squash
ruleset "protect-staging" staging merge
ruleset "protect-main" main merge

step "Still to do by hand"
cat <<'TXT'
  Vercel project: production branch = main; set API_URL for the Production scope and, for the Preview scope
  limited to the `staging` branch, the staging backend URL. Add each deployed origin to the backend's
  CORS_ALLOWED_ORIGINS.
  Repository (optional): BACKPORT_TOKEN  ->  gh secret set BACKPORT_TOKEN
TXT

if [ "$failed" -ne 0 ]; then
  printf '\nSome steps failed (see FAILED lines above).\n' >&2
  exit 1
fi
printf '\nAll steps applied.\n'

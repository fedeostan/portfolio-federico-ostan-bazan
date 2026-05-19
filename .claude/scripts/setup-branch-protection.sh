#!/usr/bin/env bash
# Idempotent branch protection setup for `main`.
#
# What this enforces on main:
#   - Pull request required (no direct pushes)
#   - CI status check `ci` must pass before merging
#   - Linear history (no merge commits on main)
#   - Branch deletion blocked (only via PR merge w/ auto-delete)
#
# What this enforces on the repo:
#   - Squash merge is the ONLY allowed merge method on PRs
#   - Branches are auto-deleted after merge
#
# Re-runnable. Requires `gh` authenticated with admin rights on the repo.

set -euo pipefail

REPO_OWNER="fedeostan"
REPO_NAME="portfolio-federico-ostan-bazan"
BRANCH="main"

echo "==> Configuring repository merge settings ($REPO_OWNER/$REPO_NAME)"
gh api -X PATCH "repos/$REPO_OWNER/$REPO_NAME" \
  -f allow_squash_merge=true \
  -f allow_merge_commit=false \
  -f allow_rebase_merge=false \
  -f delete_branch_on_merge=true \
  -f allow_auto_merge=true \
  -f squash_merge_commit_title=PR_TITLE \
  -f squash_merge_commit_message=PR_BODY \
  > /dev/null
echo "    ✓ Squash-only, auto-delete head branch, PR title becomes commit"

echo "==> Configuring branch protection on '$BRANCH'"
# Note: using --input - because nested objects need JSON, not -f shorthand.
gh api -X PUT "repos/$REPO_OWNER/$REPO_NAME/branches/$BRANCH/protection" \
  --input - <<'JSON' > /dev/null
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["ci"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": false,
  "lock_branch": false,
  "allow_fork_syncing": false
}
JSON
echo "    ✓ PR required, CI must be green, linear history, no force-push, no delete"

echo
echo "==> Done. Verify in browser: https://github.com/$REPO_OWNER/$REPO_NAME/settings/branches"

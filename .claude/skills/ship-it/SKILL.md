---
name: ship-it
description: Use when Fede replies "approved", "lgtm", "ship it", or invokes /ship-it on a session that just emitted a FEDE QA block. Squash-merges the PR, deletes the branch, flips the issue to status:completed, cascades unblocks to dependents whose deps are now all closed, removes the worktree, and fast-forwards the primary checkout. Refuses if there is no PR-in-flight or CI is failing.
---

# Skill: ship-it

Final merge dance. **Rigid skill — follow every step in order.**

## When to trigger

- Fede replies `approved`, `lgtm`, `ship it`, or `approve` in a session that previously emitted a **FEDE QA** block.
- Fede invokes `/ship-it` explicitly.

## Pre-flight (refuse if any fail)

1. **There must be a PR in flight from this session.**
   - The current `git rev-parse --abbrev-ref HEAD` must match `feature/issue-N-<slug>`. If not, refuse: *"I can't ship — this session isn't on a feature branch. Which PR did you mean?"*
   - Extract `N` from the branch name.
   - Find the PR: `gh pr list --head "feature/issue-${N}-<slug>" --json number,url,state --jq '.[0]'`. Refuse if no PR or PR is not OPEN.

2. **CI must be green.**
   ```bash
   gh pr checks "$PR_NUMBER"
   ```
   If any check is `fail` or `pending` (other than no-checks-yet), refuse and surface the failing check name. Tell Fede to wait or fix.

   If `gh pr checks` returns no checks at all (CI not yet wired in this branch), proceed — the workflow file lands as part of this very feature.

## Procedure

### 1. Squash-merge with branch delete

```bash
gh pr merge "$PR_NUMBER" --squash --delete-branch
```

The merge auto-closes the issue via the `Closes #N` line in the PR body. Confirm:

```bash
gh issue view "$N" --json state --jq '.state'
# expect: "CLOSED"
```

### 2. Post the completion comment + flip labels

```bash
COMMIT_SHA=$(gh pr view "$PR_NUMBER" --json mergeCommit --jq '.mergeCommit.oid')

gh issue comment "$N" --body "🎉 **COMPLETED**

**PR**: #${PR_NUMBER}
**Commit**: \`${COMMIT_SHA}\`
**Merged**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

gh issue edit "$N" --add-label "status:completed" --remove-label "status:qa-pending"
```

### 3. Cascade — unblock dependents

Find every open issue whose body's "Depends on" section lists `#N`, then for each, re-evaluate whether **all** of its dependencies are now closed-with-completed-label. If yes, flip it from `status:blocked` to `status:available`.

```bash
# Find candidates (open issues that mention "#N" in their body's Depends section)
gh issue list --state open --json number,body \
  --jq '.[] | select(.body | contains("Depends on")) | select(.body | test("#'"$N"'\\b")) | .number'
```

For each candidate `D`:

```bash
# Extract all #M references in D's Depends on section
DEPS=$(gh issue view "$D" --json body --jq '.body' \
  | awk '/## Depends on/,/^## /' \
  | grep -oE '#[0-9]+' | tr -d '#')

ALL_DONE=true
for M in $DEPS; do
  STATE=$(gh issue view "$M" --json state,labels --jq '{state, labels: [.labels[].name]}')
  if ! echo "$STATE" | grep -q '"CLOSED"'; then ALL_DONE=false; break; fi
  if ! echo "$STATE" | grep -q 'status:completed'; then ALL_DONE=false; break; fi
done

if [ "$ALL_DONE" = true ]; then
  CUR_LABELS=$(gh issue view "$D" --json labels --jq '[.labels[].name] | join(",")')
  if echo "$CUR_LABELS" | grep -q 'status:blocked'; then
    gh issue edit "$D" --remove-label "status:blocked" --add-label "status:available"
    UNBLOCKED+=("#$D")
  fi
fi
```

Collect the list of issues you flipped (the `UNBLOCKED` array above).

### 4. Sync the primary checkout

Switch the current shell out of the worktree back to the primary checkout, then fast-forward `main`:

```bash
cd /Users/federicoostanbazan/portfolio-federico-ostan-bazan
git fetch origin
git checkout main
git pull --ff-only origin main
```

### 5. Remove the worktree

```bash
git worktree remove "../portfolio-issue-${N}"
git worktree prune
```

If `git worktree remove` complains the worktree is dirty (unexpected, since we just merged), surface the error to Fede and stop — don't `--force` without his okay.

### 6. Report to Fede (one short paragraph)

Use this format:

```
Merged #N → main. Closed and labelled `status:completed`.
Unblocked: <#X, #Y or "none">.
Worktree removed. Local main is up to date.

Ready for the next issue. Available now: <gh issue list --label status:available --json number,title --jq '.[] | "#\(.number) \(.title)"' joined with " · ">
```

End the session.

## What this skill does NOT do

- Does not modify code or open new PRs.
- Does not delete worktrees of other sessions — only the one matching the merged issue's number.
- Does not roll back. If the merge succeeds but a later step fails (label flip, cascade, worktree remove), the merge is final — surface the partial failure to Fede; do not attempt to revert the merge.

## Failure modes

- **`gh pr merge` fails because branch protection blocks**: surface the rule that blocked (often: "CI required but failed/pending"). Do not bypass with admin override unless Fede explicitly says so.
- **Cascade matches nothing**: that's fine — print `Unblocked: none`.
- **Worktree removal fails**: report it, tell Fede the exact `git worktree remove --force` command to run manually.
- **Primary checkout has uncommitted changes when we try to switch back to main**: refuse to switch; tell Fede where the dirty state is. Do not stash/discard without permission.

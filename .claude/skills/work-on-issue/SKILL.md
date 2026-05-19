---
name: work-on-issue
description: Use when the user pastes a GitHub issue URL, types "work on it", says "pick up #N", or invokes /work-on-issue N. Verifies dependencies, locks the issue, creates a worktree off fresh origin/main, copies env files, installs deps, and starts implementation against the issue's plan. Refuses on locked/blocked/missing-deps.
---

# Skill: work-on-issue

Start work on a GitHub issue in a clean, isolated worktree. **Rigid skill — follow every step in order.**

## When to trigger

- User pastes a github.com issue URL.
- User says "work on it", "pick up #N", "let's do issue N", "start N".
- User invokes `/work-on-issue N`.

Extract the issue number `N` from the URL or message. If ambiguous, ask which issue.

## Pre-flight (refuse if any fail)

Run each in order. If any check refuses, **stop** and tell Fede exactly which check failed and why.

1. **Issue exists & state**
   ```bash
   gh issue view "$N" --json number,title,labels,state,body --jq '{number, title, state, labels: [.labels[].name]}'
   ```
   Refuse if `state != OPEN`.

2. **Not locked, not blocked, not past implementation**
   - Refuse if labels include `status:in-progress` → say *"Issue #N is locked by another session. Check the latest 🔒 LOCKED comment."*
   - Refuse if labels include `status:blocked` → say *"Issue #N is blocked. Resolve dependencies first."*
   - Refuse if labels include `status:qa-pending` or `status:completed` → say *"Issue #N is past implementation."*

3. **Dependencies all completed**
   Parse the "Depends on" section from the issue body (lines listing `#M` references). For each `#M`:
   ```bash
   gh issue view "$M" --json state,labels --jq '{state, labels: [.labels[].name]}'
   ```
   Refuse if **any** dep is not closed OR does not carry `status:completed`. Name the failing dep.

## Procedure

4. **Sync the primary checkout's remote refs**
   ```bash
   cd /Users/federicoostanbazan/portfolio-federico-ostan-bazan
   git fetch origin
   ```

5. **Compute slug** from the issue title:
   - Lowercase, replace non-alphanumerics with `-`, collapse multiple `-`, trim leading/trailing `-`.
   - Cap at ~4 words / 40 chars.
   - Example: title "Per-project scoped chat widget" → slug `per-project-scoped-chat-widget`.

6. **Create the worktree off fresh `origin/main`** (NOT local main):
   ```bash
   BRANCH="feature/issue-${N}-${SLUG}"
   WORKTREE="../portfolio-issue-${N}"
   git worktree add -b "$BRANCH" "$WORKTREE" origin/main
   ```
   If the worktree path already exists, refuse and ask Fede whether to `git worktree remove --force` and retry.

7. **Copy env files from primary checkout** (see memory `feedback_worktree_env_copy`):
   ```bash
   cp .env.local "$WORKTREE/.env.local" 2>/dev/null || true
   cp -r .vercel "$WORKTREE/.vercel" 2>/dev/null || true
   ```

8. **Install dependencies** inside the worktree:
   ```bash
   cd "$WORKTREE"
   pnpm install
   ```

9. **Acquire the lock atomically** (CONTRIBUTING §2.3):
   ```bash
   gh issue edit "$N" --add-label "status:in-progress" --remove-label "status:available"
   gh issue comment "$N" --body "🔒 **LOCKED** by Claude instance — $(date -u +"%Y-%m-%dT%H:%M:%SZ") — branch \`${BRANCH}\` — worktree \`${WORKTREE}\`"
   ```

10. **Announce to Fede** (one short paragraph, no QA-block formatting yet):
    > Locked #N · worktree at `../portfolio-issue-N` · branch `feature/issue-N-<slug>`. Starting implementation now.

11. **Implement**. Follow the issue's "Implementation Plan" checklist exactly. Commit small and often using `<type>(<scope>): <summary> (#N)`. Do not expand scope; if you discover work outside the issue, open a follow-up issue and link it.

## When implementation is done

Hand off to the `qa-handoff` skill. Do not merge anything yourself.

## What this skill does NOT do

- Does not run typecheck/lint/build (that's `qa-handoff`).
- Does not push to remote (that's `qa-handoff`).
- Does not create the PR (that's `qa-handoff`).
- Does not merge (that's `ship-it`).
- Does not clean up the worktree (that's `ship-it` after merge).

## Failure modes & recovery

- **`git worktree add` fails because branch already exists locally**: run `git branch -D "$BRANCH"` (only if the branch is unmerged and stale) and retry. If unsure, ask Fede.
- **Worktree exists but is dirty / orphaned**: `git worktree remove --force "$WORKTREE"` then retry.
- **`pnpm install` fails**: surface the error, do not lock the issue. Leave labels unchanged so another retry is possible.
- **`gh issue edit` fails after worktree is created**: roll back — `git worktree remove "$WORKTREE"` — so a fresh attempt can re-acquire cleanly.

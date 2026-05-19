# CLAUDE.md — Rules for this repo

This file is loaded automatically by Claude Code. **Read it before doing anything.**

## 1. Issue-driven, parallel-worktree workflow

This repo is built one GitHub issue at a time. Multiple Claude Code sessions run in parallel — one issue per session — and each session uses its **own git worktree** so they never collide on `main`.

The full prose workflow lives in `CONTRIBUTING.md` at the repo root. Read it once. Then, in day-to-day work, use the three skills below — they encode CONTRIBUTING.md as executable procedures. **Do not improvise around them.**

| When | Skill | What it does |
|---|---|---|
| Start work on an issue | `.claude/skills/work-on-issue` (or `/work-on-issue N`) | Checks deps, locks the issue, creates a worktree off fresh `origin/main`, copies env, installs, starts coding |
| Implementation finished | `.claude/skills/qa-handoff` (or `/qa-handoff`) | Runs typecheck + lint + build, commits, opens PR, prints the **FEDE QA** block in chat |
| Fede replies `approved` | `.claude/skills/ship-it` (or `/ship-it`) | Squash-merges, deletes branch, flips labels, cascades unblocks, removes worktree, syncs primary checkout |

If Fede pastes a GitHub issue URL or says "work on it" / "pick up #N" → invoke `work-on-issue` **without asking** for confirmation.

## 2. Hard rules

1. **Never edit code on `main`.** All work happens in a worktree at `../portfolio-issue-N/` on branch `feature/issue-N-<slug>`.
2. **Never run `git checkout -b ...` on the primary checkout** to start issue work. Use `git worktree add` (handled by `work-on-issue`). Switching branches in the primary checkout breaks parallel sessions.
3. **Never click "Merge" / "Squash" / "Rebase" in the GitHub UI manually.** All merges go through `ship-it`. Branch protection enforces squash-only at the API level, but the skill is still the only entry point Claude uses.
4. **Never write commits or PRs that don't follow the convention**: `<type>(<scope>): <summary> (#N)`. The `(#N)` suffix and the `Closes #N` line in the PR body are load-bearing — they auto-close the issue on merge.
5. **Never present QA as a code diff.** Fede does not read code. QA is delivered as a copy-pasteable **FEDE QA** block: worktree path, `pnpm dev`, the URL to open, numbered manual checks with expected results.
6. **Never invent dependencies.** If an issue's "Depends on" section lists `#M`, check `gh issue view M` for `status:completed`. If any dep isn't completed, refuse and tell Fede which one is blocking.
7. **Never skip the CI gate.** `ship-it` must run `gh pr checks` first and refuse if any check fails.

## 3. Vocabulary glossary (plain English for Fede)

- **Squash-merge**: when a PR is merged with "squash", all the small commits on the feature branch are *combined into a single commit* on `main`. The PR title becomes that one commit's message. This keeps `main`'s history clean — one commit per issue, instead of dozens of in-progress commits. The other two GitHub options ("Merge commit" and "Rebase and merge") are disabled on this repo; you'll only see one button.
- **Branch protection**: a GitHub setting that prevents broken or unreviewed code from landing on `main`. On this repo it requires (a) a PR (no direct pushes to `main`), (b) CI green, (c) squash-merge only.
- **Worktree**: a second working directory tied to the same `.git`. Lets two Claude sessions edit different branches at the same time without stepping on each other. Lives at `../portfolio-issue-N/` next to the primary checkout.
- **Label cascade**: when an issue closes, other issues that depended on it may now be ready. The `ship-it` skill checks every open issue's "Depends on" list and flips it from `status:blocked` to `status:available` if all its deps are now done. This is what stops issues from rotting in `blocked` state.
- **`status:available`** = ready to pick up. **`status:in-progress`** = locked by a session right now. **`status:qa-pending`** = waiting on Fede to verify. **`status:completed`** = done and merged. **`status:blocked`** = at least one dep still open.

## 4. Useful repo commands

```bash
pnpm dev          # Next.js dev server (turbopack) — http://localhost:3000
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm build        # production build
pnpm format       # prettier --write .
pnpm db:seed      # seed local DB with sample data
```

## 5. One-time setup

Branch protection on `main` is configured via `.claude/scripts/setup-branch-protection.sh`. It is idempotent — safe to re-run if rules drift.

```bash
./.claude/scripts/setup-branch-protection.sh
```

## 6. When something doesn't fit a skill

If Fede asks for something that doesn't match the issue-workflow path (a quick docs typo, a manual `gh` operation, an exploratory question), do it directly — the skills are for issue work, not for everything. Use judgement.

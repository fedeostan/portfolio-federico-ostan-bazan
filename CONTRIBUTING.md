# Contributing — Issue-Driven Workflow (for Claude instances AND humans)

This repo is built **issue-by-issue**, with multiple Claude Code instances potentially working in parallel. Issues serve as both the spec and the coordination mechanism. **Read this file fully before touching any code.**

---

## TL;DR

1. Pick an issue with label `status:available`.
2. Check all "Depends on" issues are `status:completed`.
3. **Lock the issue**: add `status:in-progress` label + post a 🔒 LOCKED comment.
4. Branch: `feature/issue-NN-<kebab-slug>`.
5. Implement, commit frequently (`feat(scope): summary (#N)`).
6. Open PR (squash-merge target = `main`).
7. Mark `status:qa-pending` and request QA from Federico.
8. On approval: merge, post 🎉 COMPLETED summary, label `status:completed`, close issue.
9. Cascade: flip downstream-blocked issues to `status:available` if their deps are now done.

---

## 1. Labels reference

| Family | Label | Meaning |
|---|---|---|
| Status | `status:available` | Ready to pick up; all deps completed |
| Status | `status:blocked` | Has unresolved dependencies |
| Status | `status:in-progress` | Locked by an instance or human |
| Status | `status:qa-pending` | Implementation done; awaiting human QA |
| Status | `status:completed` | Closed after QA approval |
| Stream | `stream:foundation` | Repo, tooling, design system |
| Stream | `stream:hero` | Landing hero + chat input |
| Stream | `stream:backend` | Supabase, API routes, retrieval |
| Stream | `stream:nav` | Dock, dynamic island TOC, scroll spy |
| Stream | `stream:sections` | The 5 content sections |
| Stream | `stream:case-study` | `/case-studies/[slug]` template + scoped chat |
| Stream | `stream:contact` | Contact box, lead capture, deep links |
| Stream | `stream:polish` | Voice, URL ingest, perf, a11y, hardening |
| Priority | `prio:p0-critical` | Blocks launch |
| Priority | `prio:p1-important` | Needed for launch but unblocks later |
| Priority | `prio:p2-nice` | Post-launch acceptable |

A well-formed open issue has **exactly one** status label, **one** stream label, **one** priority label, and **one** milestone.

---

## 2. Picking up an issue (full procedure)

Every Claude instance (or human) MUST follow these steps in order. Do not skip any.

### Step 2.1 — Check the issue is available

```bash
gh issue view <N> --json labels,body,milestone --jq '{labels: [.labels[].name], milestone: .milestone.title}'
```

- If the labels include `status:in-progress` → **REFUSE**. Tell the user: *"Issue #N is locked by an existing instance. Check the most recent 🔒 LOCKED comment to coordinate."*
- If the labels include `status:blocked` → **REFUSE**. Tell the user: *"Issue #N is blocked. Resolve its dependencies first."*
- If the labels include `status:qa-pending` or `status:completed` → **REFUSE**. Tell the user: *"Issue #N is past the implementation stage."*

### Step 2.2 — Verify dependencies

Read the "Depends on" section of the issue body. For each referenced `#M`:

```bash
gh issue view <M> --json labels --jq '[.labels[].name]'
```

If any dependency does NOT have `status:completed` → **REFUSE**. Tell the user exactly which dependency and its current status. Do not begin work.

### Step 2.3 — Acquire the lock (atomic)

```bash
N=<issue-number>
SLUG=<kebab-slug-of-title>
gh issue edit "$N" --add-label "status:in-progress" --remove-label "status:available"
gh issue comment "$N" --body "🔒 **LOCKED** by Claude instance — $(date -u +"%Y-%m-%dT%H:%M:%SZ") — branch \`feature/issue-${N}-${SLUG}\`"
git checkout -b "feature/issue-${N}-${SLUG}" main
git pull --rebase origin main
```

### Step 2.4 — Implement

- Follow the Implementation Plan in the issue body exactly.
- Commit small and often. **Commit message format**: `<type>(<scope>): <summary> (#N)` — Conventional Commits, with the issue number in the subject.
- Examples:
  - `feat(hero): add HeroTitle component (#8)`
  - `chore(deps): install motion + lucide-react (#6)`
  - `fix(api): handle empty result from searchProjects (#12)`
- Keep PRs small; if the issue spec balloons, open a follow-up issue rather than expanding scope.

### Step 2.5 — Open the PR

```bash
git push -u origin "feature/issue-${N}-${SLUG}"
gh pr create \
  --base main \
  --head "feature/issue-${N}-${SLUG}" \
  --title "<type>(<scope>): <summary> (#${N})" \
  --body "Closes #${N}

## Summary
- <bullets>

## QA Checklist
$(gh issue view ${N} --json body --jq '.body' | sed -n '/## QA Checklist/,/## Done When/p' | sed '$d')

## Preview
<Vercel preview URL once available>
"
```

### Step 2.6 — Mark ready for QA

```bash
gh issue edit "$N" --remove-label "status:in-progress" --add-label "status:qa-pending"
gh issue comment "$N" --body "✅ **READY FOR QA**

**PR**: #$(gh pr list --head feature/issue-${N}-${SLUG} --json number --jq '.[0].number')

**Changes:**
- <short summary>

**Run the QA checklist from the issue body and reply with approval or feedback.**"
```

### Step 2.7 — On QA approval (Federico replies "approved" or similar)

1. Squash-merge the PR (this auto-closes the issue via "Closes #N" in the PR body).
2. Post the completion comment:

   ```bash
   gh issue comment "$N" --body "🎉 **COMPLETED**

   **What shipped:**
   - <bullet of actual outcomes>

   **PR**: #<pr-number>
   **Commit**: <sha>"
   ```

3. Add the completed label and remove qa-pending:

   ```bash
   gh issue edit "$N" --add-label "status:completed" --remove-label "status:qa-pending"
   ```

4. **Cascade**: list all open issues that listed `#N` as a dep:

   ```bash
   gh issue list --search "Depends on: #${N} in:body" --state open --json number,labels
   ```

   For each, re-evaluate its dep list. If ALL of its deps are now `status:completed`, flip it from `status:blocked` to `status:available`:

   ```bash
   gh issue edit <downstream-N> --remove-label "status:blocked" --add-label "status:available"
   ```

### Step 2.8 — If QA fails

Keep `status:qa-pending`. Address feedback in the same branch (push new commits). Re-request QA without re-labelling.

---

## 3. Branch & commit conventions

- **Default branch**: `main` (protected — PR + review required).
- **Feature branches**: `feature/issue-NN-<kebab-slug>` (NN is the issue number, slug ≤ 4 words).
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/), with `(#N)` suffix.
  - `feat(<scope>): <summary> (#N)`
  - `fix(<scope>): <summary> (#N)`
  - `chore(<scope>): <summary> (#N)`
  - `docs(<scope>): <summary> (#N)`
  - `refactor(<scope>): <summary> (#N)`
  - `test(<scope>): <summary> (#N)`
- **PRs**: squash-merge only. PR title becomes the merge commit.
- **One PR per issue**. Multi-issue PRs are not allowed.

---

## 4. Local dev expectations (once the stack is scaffolded)

```bash
pnpm install
pnpm dev          # Next.js dev server
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm format       # prettier --write
pnpm test         # if applicable
pnpm db:seed      # populate sample case studies (Issue #11+)
```

Required env vars in `.env.local` (template in `.env.example` once Issue #2 lands):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_GATEWAY_API_KEY=
GROQ_API_KEY=             # Issue #25
FIRECRAWL_API_KEY=        # Issue #26
```

---

## 5. The master plan

The full ordered roadmap (30 issues across 6 milestones) lives in the local plan file at `~/.claude/plans/first-prompt-we-will-golden-sonnet.md` (Federico's machine). The GitHub Issues are the canonical, executable form of that plan — if the plan and an issue disagree, **the issue wins** (issues evolve as work progresses; the plan is a frozen snapshot).

---

## 6. When in doubt

If something is unclear, **comment on the issue and pause**. Don't expand scope or invent solutions. The brief, the research docs in `docs/research/`, and the issue body together are the contract.

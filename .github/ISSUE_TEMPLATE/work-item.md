---
name: Work item
about: A self-contained piece of portfolio work (followed by Claude or human)
title: "<short imperative title>"
labels: ["status:available", "prio:p1-important"]
assignees: []
---

## Why
<1–3 sentences: what problem this solves / what value it adds>

## What (Deliverables)
- <concrete deliverable 1>
- <concrete deliverable 2>

## Depends on
- (none) — OR — #N, #M

## Files
- Create: `exact/path/to/new-file.ts`
- Modify: `exact/path/to/existing.ts`

## Implementation Plan
- [ ] Step 1: <one concrete action>
- [ ] Step 2: <next concrete action>

## QA Checklist (human-verifiable)
- [ ] <test 1 the human runs to verify>
- [ ] <test 2>
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] No ESLint errors (`pnpm lint`)

## Done When
<exact, observable criteria — e.g. "preview URL renders matching Figma frame X-YYY within 10%">

---

**Workflow note (read [CONTRIBUTING.md](../../CONTRIBUTING.md) before starting):**
Picking up this issue requires (1) all "Depends on" items to be `status:completed`, (2) no existing `status:in-progress` lock, (3) acquiring the lock via label + comment before any code change.

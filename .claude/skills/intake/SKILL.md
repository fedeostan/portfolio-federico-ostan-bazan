---
name: intake
description: Use when Fede invokes /intake, says "let's start intake", "intake mode", "dump a case study", or pastes a raw block describing a project. Captures dictation, generates the folder + brief.md + meta.yaml + case-study.ts, then tells Fede the exact path to drop images. Refuses outside the case-study worktree.
---

# Skill: intake

Capture raw dictation about a project, generate the full case-study scaffold, and tell Fede exactly where to drop images. **Rigid skill — follow every step in order.**

## When to trigger

- Fede invokes `/intake`
- Fede says "let's start intake", "intake mode", "dump a case study", "I want to dictate"
- Fede pastes a raw text block that's clearly describing a project after asking for white-glove processing

## Pre-flight (refuse if any fail)

1. **Must be in the case-study worktree**
   - `pwd` must end in a worktree path (e.g. `…/portfolio-issue-67`) — never the primary checkout on `main`.
   - If on `main`, refuse: *"Intake must run inside a case-studies worktree. Run `/work-on-issue 67` first (or `cd` into the existing worktree)."*

2. **Scaffolding present**
   - `content/case-studies/README.md` exists
   - `scripts/upload-assets.ts` exists
   - `lib/case-study/seed.ts` exports `SeedProject`
   - If any are missing, refuse and point to issue #67.

3. **Env vars present**
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must be readable from `.env.local`. If missing, refuse and tell Fede to copy `.env.local` from the primary checkout.

## Procedure (per project)

### Phase 1: Capture

Say one short line: *"Ready. Dump the raw text. Say 'next project' or 'that's all' when done."*

Accept any amount of text. Do not interrupt unless Fede asks a question. The dump becomes `brief.md` **verbatim** — no edits, no cleanup, no reformatting.

### Phase 2: Extract slug + meta

From the dump, infer:

| Field | How |
|---|---|
| `slug` | lowercase-kebab, ~3 words from the product/project name. "Aurora" → `aurora`. If the name is generic, append a 1-word client suffix (`aurora-northwind`). |
| `title` | product name as written |
| `client` | real company. Web-search for correct spelling and one-liner about the company. |
| `role` | Fede's role from the dump. Don't default — ask if absent. |
| `year` | recent. Ask only if absent. |
| `category` | `ai \| mobile \| desktop \| personal`. Keywords: mobile/iOS/Android → mobile · Mac/Windows/Tauri/Electron → desktop · LLM/agent/chatbot/AI-native → ai · else personal. |
| `published` | default `true` |
| `tech_stack` | list from the dump. Web-search to validate canonical spellings (e.g. "SwiftUI" not "swift UI"). |
| `nda` | `true` only if Fede flagged confidential. When true, anonymize the client downstream ("a European neobank"). |

**Collision check**: if `content/case-studies/<slug>/brief.md` already exists, ask Fede: overwrite or pick a different suffix?

### Phase 3: Scaffold the folder

```bash
mkdir -p content/case-studies/<slug>/images
```

Write `content/case-studies/<slug>/brief.md` = raw dump verbatim.
Write `content/case-studies/<slug>/meta.yaml` = extracted fields.

### Phase 4: Enrich + generate `case-study.ts`

1. Invoke the `direct-response-copy` skill to produce:
   - `summary` — punchy single sentence (~140 chars, problem → outcome)
   - `description` — ~300 chars, expands the summary, FTS-friendly (includes product noun, category nouns, tech stack words)
   - Section copy for: opening hook (`text`), approach (`image+text`), key decisions (`image+text` or `text`), outcomes (`metrics` then a closing `text`), optional `gallery` block
2. Use `WebSearch` to validate:
   - Client company exists and the description matches their actual industry / scale / product line
   - Product name is correctly attributed if shipped publicly
   - Tech stack spellings
3. Invent metrics within realistic ranges for the category:
   - Onboarding / conversion lift: typically 8–25%
   - D30 retention: 35–65% for consumer apps
   - Time-to-task reductions: 20–50%
   - NPS: 40–65 is strong for B2C
   - Adoption / scale: anchor to company size (don't claim 1M users for a 50-person startup)
4. Generate `content/case-studies/<slug>/case-study.ts` exporting a typed `SeedProject` default. Use 10-cadence ordering (10, 20, 30…) for sections and assets. Reference images **by filename only** (`file: "hero.png"`), never by URL.

### Phase 5: Image drop instructions

Print this exact block (substitute `<slug>`):

```
Drop images into:

  /Users/federicoostanbazan/portfolio-issue-67/content/case-studies/<slug>/images/

Required filenames (use these exactly):
  • hero.png       — full-width hero, ~1600×900
  • cover.png      — home grid card / social preview, ~1200×630
  • gallery-01.png — first gallery shot, ~1200×800

Optional:
  • gallery-02.png, gallery-03.png… — more gallery shots
  • process-01.png, process-02.png… — pairs with image+text sections

Extensions: .png .jpg .jpeg .webp .gif .svg .avif

Reply "images in <slug>" or "process <slug>" when ready.
```

Then open the folder for Fede:

```bash
open /Users/federicoostanbazan/portfolio-issue-67/content/case-studies/<slug>/images/
```

**Stop here.** Do not proceed without images.

### Phase 6: After images dropped

When Fede says "images in `<slug>`" / "process `<slug>`" / "ready":

1. Verify at least `hero` and `cover` exist:
   ```bash
   ls content/case-studies/<slug>/images/
   ```
   Refuse if `hero.*` or `cover.*` is missing — tell Fede which one.

2. Upload to Supabase Storage:
   ```bash
   pnpm assets:upload <slug>
   ```

3. Seed the DB:
   ```bash
   pnpm db:seed
   ```

4. Verify:
   - Start `pnpm dev` if not running
   - Open `http://localhost:3000/case-studies/<slug>` — confirm hero, sections, gallery render
   - Open `http://localhost:3000` — card appears in correct category section
   - Confirm AI brief mode can answer "tell me about `<slug>`" via the dock contact

5. Report back: 2-line summary + URLs to verify.

### Phase 7: Continue or finish

- Another dump? → loop to Phase 1.
- "That's all" / "done" → suggest `/qa-handoff`.

## What this skill does NOT do

- Does not create the worktree (that's `/work-on-issue`)
- Does not commit, push, or open a PR (that's `/qa-handoff`)
- Does not merge (that's `/ship-it`)
- Does not edit or generate images — Fede provides them
- Does not invent client companies — only metrics are invented; clients must be real

## Failure modes

- **Dump missing product name** → ask Fede directly: *"What's the product called?"*
- **`pnpm assets:upload` fails** → surface the error, do not run seed
- **`pnpm db:seed` fails** → log the error, delete the generated `case-study.ts` (not the brief/meta/images), tell Fede which field caused it
- **Image with unknown extension** → warn, skip it, continue with the others
- **NDA flagged but client name is in the dump** → anonymize in title/summary/description, use sector descriptor (e.g. "a European neobank"); keep the real name only in `meta.yaml` for Fede's reference

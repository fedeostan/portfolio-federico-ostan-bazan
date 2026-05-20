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
- Fede pastes a **file path to a markdown brief** (typical: `portfolio-cases/<slug>.md` at the repo root) — read the file as the dump

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

**Path-mode (preferred):** if Fede pastes a path to a markdown file (e.g. `portfolio-cases/<slug>.md`), read it directly. No chat dump needed.

**Dictation-mode:** otherwise, say one short line: *"Ready. Dump the raw text. Say 'next project' or 'that's all' when done."* Accept any amount of text.

Either way, the dump becomes `brief.md` **verbatim** — no edits, no cleanup, no reformatting. If the source had YAML frontmatter, it stays in brief.md as the source of truth; meta.yaml is derived from it but does not replace it.

### Phase 2: Extract slug + meta

**Prefer YAML frontmatter** if the source has one (the `portfolio-cases/*.md` briefs do). Map:
- frontmatter `title` → `title`
- frontmatter `role` (typically `"<role>, <client>"`) → split on the last `, ` into `role` and `client`
- frontmatter `period` (e.g. `2026-02 – present`) → first year token → `year`
- frontmatter `stack` (comma list) → `tech_stack` (canonicalize spellings via web search if unsure)
- product/project name → `slug` (filename of the markdown if it matches; otherwise kebab-cased title)

Otherwise infer from the dump:

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

Print this exact block (substitute `<slug>` and the correct worktree path). Aspect ratios come from the actual component CSS — these are **not** suggestions.

```
Drop images into:

  <worktree-path>/content/case-studies/<slug>/images/

Filenames + shapes (match exactly):

  • hero.png       2.5:1 ultra-wide panorama   2280×914   → CaseStudyHero band
  • cover.png      0.79:1 portrait (34:43)     680×860    → home grid card visual
  • process-01.png 0.79:1 portrait (34:43)     680×860    → pairs with "image+text" section, order 30
  • process-02.png 0.79:1 portrait (34:43)     680×860    → pairs with image+text, order 40

Optional:
  • gallery-01.png … gallery-NN.png           1.58:1 landscape   2280×1440   → unpaired gallery block

The cover, process-01, and process-02 are the SAME canvas shape — design one phone-frame template and swap screens.

Extensions: .png .jpg .jpeg .webp .gif .svg .avif

Reply "images in <slug>" or "process <slug>" when ready.
```

Then open the folder for Fede (use the actual worktree path):

```bash
open <worktree-path>/content/case-studies/<slug>/images/
```

**Stop here.** Do not proceed without images.

### Phase 6: After images dropped

When Fede says "images in `<slug>`" / "process `<slug>`" / "ready":

1. **Normalize filenames.** Common typos to auto-rename (do this silently, don't ask):
   - `galery-*` → `gallery-*` (single-`l`)
   - `heroe.*` → `hero.*`
   - `proces-*` → `process-*`
   - `cover-*` ambiguous with `cover.*` → ask Fede which is the card
   Also delete `.DS_Store` (Finder junk).

2. **Verify dimensions** with `file content/case-studies/<slug>/images/*.png` (or jpg/etc). Compare against the spec:
   - hero: 2.5:1 ± 5% — warn if off
   - cover / process-NN: 0.79:1 ± 5% — warn if off
   - gallery-NN: ~1.5:1 landscape — informational
   If hero or any process is wildly off-aspect, **stop and tell Fede** rather than uploading bad assets.

3. **Verify minimums.** `hero.png` AND `cover.png` must exist. Process and gallery files are optional — case-study.ts handles missing ones via warn-and-skip in the seeder. If hero or cover is missing, stop and tell Fede which one.

4. **Upload to Supabase Storage** (always `--force` — URLs are content-hashed, so it's safe):
   ```bash
   pnpm assets:upload <slug> --force
   ```

5. **Seed the DB**:
   ```bash
   pnpm db:seed
   ```

6. **Verify on localhost**:
   - If `pnpm dev` is not running, start it.
   - If it IS running and you just changed image content, **restart it** so Next/Image picks up the new URLs cleanly (it caches optimized variants by URL — content-hash query strings bust this, but a restart guarantees a clean slate).
   - `curl -sS http://localhost:3000/case-studies/<slug>` and grep for the project title, the new image hashes (`\?v=[a-f0-9]{10}`), and 2–3 distinctive content phrases.
   - `curl -sS http://localhost:3000/` and grep for the project title to confirm the home grid renders.
   - Optionally: spot-check FTS by writing a quick `tsx` script that queries `projects.search_tsv` for keywords from the brief.

7. **Report back**: a 2-line summary with the localhost URL and a one-sentence note on what to eyeball (hero composition, metrics formatting, gallery count). Ask Fede to hard-refresh (`⌘⇧R`) since browser caches predate the new hashes only on a first visit per session.

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

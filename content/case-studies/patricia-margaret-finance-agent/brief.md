---
title: "Patricia & Margaret: A Production-Grade Household Finance Agent on Telegram"
role: Solo builder — agent design, n8n workflow, Supabase schema, multimodal pipeline, multi-user architecture
period: 2026-04 → present (live, daily use)
status: shipped (Phases 0–3c) · in-flight (Phase 3d analysis, Phase 4 voice tuning)
team: Solo (one user: Federico/Patricia; one second user: Josephine/Margaret)
stack: n8n native AI Agent node (`@n8n/n8n-nodes-langchain.agent` v3.1) · OpenAI GPT-4o + GPT-4o-mini (multimodal) · Supabase PostgreSQL 17 (eu-central-1) · Telegram Bot API · Railway (shared self-hosted n8n)
sources:
  - n8n workflow `vLZbLN8gxa7dfNSa` (`[Patricia] Agent v2 - Core`, 41 nodes)
  - n8n workflow `4Ih23rmqceNmKthP` (`[Margaret] Agent v2 - Core`, 43 nodes)
  - 9 tool sub-workflows (`tool_list_categories`, `tool_get_category`, `tool_create_category`, `tool_log_expense`, `tool_get_recent_expenses`, `tool_remember`, `tool_set_monthly_plan`, `tool_delete_expenses`, `tool_edit_expense`, `tool_process_pdf_statement`)
  - Supabase project `zpmaurcspssqumnmrzib` (`personal-finance-agent`)
  - `~/n8n-agent/.claude/clients/fedeostan/projects/personal-finance-agent/CLAUDE.md` (260 lines, 33 documented gotchas)
  - `~/n8n-agent/.claude/clients/fedeostan/projects/personal-finance-agent/AGENT_DESIGN.md`
---

# Patricia & Margaret: A Production-Grade Household Finance Agent on Telegram

## Context

For the last two years I've been quietly running an experiment on myself: what does it look like when you take the agent design patterns from the *Building Effective Agents* literature and actually run them as production software for your own life? Not a demo. Not a portfolio piece. Software that handles real money, every day, with consequences if it's wrong.

The result is Patricia — a Spanish-speaking, 50-year-old "professional accountant" who lives in a Telegram chat with me and logs every expense I make against a three-bucket mental model (Essentials / Fun / Future You). She reads receipt photos. She parses my bank statements. She remembers that my pets are Bambi and Pochoclo, that I'm allergic to shrimp, and that "con Ana" means a shared expense. She refuses to do split-math and offers attribution instead.

Margaret is the same system, in English, for my partner Josephine. Both bots share a Supabase database. Neither can see the other's expenses. The whole thing runs on a shared Railway n8n instance and an OpenAI key, and it costs me a couple of dollars a month to operate.

This is the project I point at when I want to show that I can do agent work at the level of production discipline, not at the level of "I called an LLM in a Cursor tab." It's where I worked out — through 33 documented gotchas — what it actually takes to ship an agent that won't quietly corrupt user data when you weren't looking.

## The problem

I'd been keeping personal finance in spreadsheets for years. Spreadsheets are great until they aren't: they require you to *visit* them. The friction kills the practice. Every time I left a receipt unlogged on Sunday afternoon, the Monday-night reconciliation got longer, until eventually I stopped reconciling. Then the spreadsheet was a graveyard of last quarter's data.

The unfair advantage of a Telegram bot is that the conversation lives where I already am. The unfair advantage of an agent — over a parser-based bot, which I built first — is that I don't have to remember a syntax. "spent eight euros on coffee" works. So does the same sentence with a typo, in Spanish, with a photo of the receipt, on a phone, one-handed, walking out of the café.

The hard part — the part this case study is actually about — is what happens *behind* that conversational surface. An agent that controls a household financial ledger has to be:

- **Tenant-isolated.** Federico's expenses never leak into a query Josephine makes, and vice versa. Two bots, one database, zero cross-tenant reads or writes.
- **Multimodal.** Text, receipt photos, PDF bank statements — three different intake paths, one consistent conversation.
- **HITL on irreversibility.** Deleting expenses requires `confirm_nuke="YES"` in the SQL itself. Statement imports go through inline-button review. Date ambiguity (was that 8 PM "today" or "yesterday"?) gets a clarifying question.
- **Editable in place.** Voice, categories, budgets, persona — all editable in Supabase Studio without redeploying the workflow.
- **Production-honest about its mistakes.** 33 gotchas live in the project's CLAUDE.md because each one cost me a debugging session I'd rather not repeat.

## My role

Solo. Every architectural decision, every tool design, every gotcha. The only "team" is me, Patricia (who logs expenses), Margaret (who logs expenses for Josephine), and Josephine herself (who reports bugs).

I deliberately built this *outside* my employer's stack so that nothing about the codebase, the schema, or the prompts is constrained by anyone's product decisions but mine. It's a workshop, in the original sense of the word.

## Approach

### Agent + workflow hybrid

The first design decision worth naming: this is not "an agent" in the simplistic sense. The Agent node — `@n8n/n8n-nodes-langchain.agent` — is the conversational face. But the surrounding n8n workflow does heavy lifting the agent doesn't: routing callback queries, parsing PDFs, executing atomic CTE imports, resetting chat memory, building inline keyboards, escaping Markdown.

The mental model I use: **the agent is the brain; the workflow is the body**. The agent decides what to say and which tool to call. The workflow handles state mutations, side effects, and anything that needs a guarantee an LLM can't provide.

The core loop, simplified:

```
Telegram Trigger
    ↓
Is Callback?  ──[yes]──→ Answer CB Query → Route CB Type ──→ {reconcile | confirm | cancel}
    ↓ [no]
Prepare Input (detect PDF / photo / /reset)
    ↓
Route After Prepare ──[reset]──→ Clear Session
    ↓ [normal]
Fetch Context (current month + active users + plan + MTD spend + persona)
    ↓
Build Agent Text  ──(if PDF: inject file_id + tool instruction)
    ↓
Path Switch  ──[photo]──→ Download Photo → Patricia Agent
    ↓ [text/PDF]
Patricia Agent  ──(tools: 9 sub-workflows + chat memory)
    ↓
Reply  →  Build PDF Buttons (if response includes "(id N)")  →  Send Inline Keyboard
```

Patricia's workflow has 41 nodes. Margaret's has 43. Every node has a single responsibility. The cognitive cost of working on this thing month-over-month stays manageable because each branch is small.

### Voice as data, not code

Patricia's identity is stored in a `profile` table in Supabase, scoped by `user_slug`:

| Key | Purpose |
|-----|---------|
| `identity` | "Professional, patient, servant-hearted accountant" |
| `soul` | "Clear, kind, never lies. Takes your goals as my own." |
| `agents` | Operational rules (e.g. "refuse split-math, offer attribution instead") |
| `user_profile` | Facts about Federico (name, family, pets, allergies, preferences) |
| `memory` | Append-only notes — stable facts only, dated |

`Fetch Context` pulls all of them into the system prompt every turn. Margaret's rows are the same keys, scoped by `user_slug='josephine'`, in English, with different facts.

To tune Patricia's voice, I open Supabase Studio and edit the `soul` row. Next message, she sounds different. Same for categories (each has a `spec` field — YAML frontmatter + markdown — that the agent reads on demand via `get_category(slug)`). Same for budgets and the monthly plan.

This is the single most useful agent-design discipline I've internalized: **separate the agent's character from the agent's code**. The minute you put personality in the prompt template, every personality tweak is a deploy. The minute you put it in a table, it's a SQL update.

### Progressive disclosure for categories

The naive design would dump every category's full description into the system prompt. There are 20+ categories now, which would be thousands of tokens of context the agent rarely needs.

Instead, the system prompt contains a compact index:

```
# CATEGORIES
- coffee (essentials)
- groceries (essentials)
- pets (essentials)
- restaurants (fun)
- travel (fun)
- savings (future_you)
...
```

…about 100 tokens. When the agent needs to make a fine-grained categorization decision, it calls `get_category('pets')` and receives the full YAML+markdown spec on demand — merchant names, examples, override rules, the whole thing. This is the same pattern Claude Code uses for skills, and the same pattern Karpathy describes as "LLM Wiki Architecture." The context window stays small, the agent's reasoning stays focused, and tuning a category's behavior is a `spec` edit, not a prompt edit.

### Nine tools, scoped narrow, designed defensively

Patricia has nine tool sub-workflows. Each is its own n8n workflow, called via `toolWorkflow` nodes:

| Tool | Type | Purpose |
|------|------|---------|
| `list_categories` | Read | Compact catalogue (active only) |
| `get_category` | Read | Full `spec` for one category, on demand |
| `create_category` | Write | Idempotent (`ON CONFLICT DO UPDATE`) |
| `log_expense` | Write | Main intake. Resolves slug→id, supports `group_override`. Phase 3b extended with `external_ref`, `confidence`, `raw_input` |
| `get_recent_expenses` | Read | Grouped by category/group/scope/paid_by |
| `remember` | Write | Appends a dated line to `profile.memory` — scoped by `user_slug` |
| `set_monthly_plan` | Write | Polymorphic: `type ∈ {income, budget_group, savings_target}` |
| `delete_expenses` | **Destructive** | Requires `confirm_nuke="YES"` in the SQL itself |
| `edit_expense` | Write | Single-row UPDATE; sentinel `__KEEP__` per field; auto-promotes `source` to `edit_correction` |
| `process_pdf_statement` | Write | Sub-workflow: download → parse → insert `statements` + `statement_rows` |

A handful of design decisions I'd surface from that table:

**Tools are SQL, not prompts.** Each tool is a Postgres `executeQuery` call with `queryReplacement` parameter binding. The agent reasons about what to call; the tool enforces what gets written. This is a hard boundary I won't cross — the LLM is never inside a transaction.

**`set_monthly_plan` is polymorphic, not three tools.** I could have built `set_income`, `set_budget`, `set_savings_target`. I didn't, because three near-identical tools would double the tool-description surface in the prompt without adding capability. One tool with a `type` discriminator covers the three writes that all share `month` keying and a near-identical upsert pattern.

**Destructive tools require a literal string in the SQL.** `delete_expenses` with a full wipe doesn't trust the agent — it requires `confirm_nuke="YES"` enforced inside the SQL itself. Otherwise the query short-circuits to zero rows affected. The agent can't reason its way past this; the database refuses.

**Every `$fromAI()` parameter description acts as an implicit constraint.** Gotcha #29 — the agent once refused to log `income=0` for a sabbatical month because the parameter description said "net monthly income" with no mention of zero being valid. I now write parameter descriptions assuming the LLM will treat them as type constraints.

### Multimodal, the simple way (after I built it the hard way)

Phase 3b — receipt photo logging — is where I learned the most expensive lesson in this project.

My first design: a separate Vision sub-workflow. Photo arrives → save to a `pending_expenses` staging table → call OpenAI's chat completions endpoint with a multimodal `image_url` content part → parse the response → render inline keyboard buttons ("Confirm", "Edit", "Cancel") → handle the callback → atomic CTE insert. About 20 nodes per agent. Photo handling in n8n is fiddly: `item.binary.data.data` returns a *storage reference*, not the raw bytes, so you have to call `await this.helpers.getBinaryDataBuffer(0, 'data')` to get an actual Buffer to base64-encode (gotcha #23). My first version POSTed the literal string `"filesystem-v2"` to OpenAI as the image data. OpenAI returned `400: invalid_image_format`. Embarrassing.

After Josephine tried the inline-button flow and bounced off it, I scrapped the whole thing. The native AI Agent node has an option — `options.passthroughBinaryImages: true` (default!) — that, when paired with a multimodal-capable model (`gpt-4o-mini`), forwards the binary as a multimodal `image_url` content part automatically. No staging table. No callback. No buttons. The photo branch became three nodes: Switch → Download Photo → Agent.

The conversational confirmation the agent already does naturally ("I see a €12.50 charge at Starbucks — want me to log it as coffee?") replaced the inline-button UX entirely. And Patricia's voice was preserved across both text and photo paths, instead of being interrupted by deterministic button text.

The lesson, written into the project's CLAUDE.md verbatim: *when the input is "give the agent more context", check whether the Agent node already has a flag for it before wrapping it in a sub-workflow.* This is the kind of mistake you only make once, but you make it loudly enough that the second time you remember.

### PDF reconciliation — where the agent + workflow hybrid earns its keep

Phase 3c was the most complex feature: upload a bank statement PDF, get back an inline-button-driven reconciliation flow.

The pipeline:

1. User sends a PDF. `Prepare Input` detects `is_pdf=true`.
2. The agent receives the file_id and an instruction to call `process_pdf_statement`. The tool downloads the PDF, runs a separate sub-workflow that parses it row-by-row, inserts a `statements` row + N `statement_rows` (all `status='new'`).
3. The agent replies with a summary line that includes `(id N)`. `Build PDF Buttons` regex-extracts N and sends an inline keyboard: "Process N transactions" → `continuar:N` callback.
4. User taps the button. `Route CB Type` switches to the reconcile branch: `Get Stmt Rows` → `Build Categorize Prompt` → `Categorize with AI` (a deterministic HTTP call to OpenAI in JSON mode, *not* the conversational agent) → `Parse AI Categories` → `Update Row Categories` (sets each row to `status='matched'` or `status='skipped'`).
5. The agent posts a summary with two more buttons: `confirm_statement:N` / `cancel_statement:N`.
6. User confirms. `Import Expenses` runs an atomic CTE: INSERT rows into `expenses` + UPDATE `statement_rows` to `status='committed'` in one SQL call. No partial failures.

Two design points worth surfacing. First: I deliberately split the *categorization* step away from the conversational agent. Categorizing 30 statement rows is a deterministic, structured-output task — JSON mode + a tight prompt + temperature 0. Routing it through the conversational agent would have meant a slower, more expensive, harder-to-test path. The agent calls the tool; the tool calls a structured LLM HTTP node; the structured output flows back through a Code node parser. Each step is replaceable in isolation.

Second: the atomic CTE is the difference between a system that loses data and a system that doesn't. A naive design would loop through rows, inserting one at a time, marking each `committed` after success. The first network blip leaves half the statement imported and half marked `committed` and half `matched`. The CTE either commits all rows or none.

### Multi-user without leakage

Margaret was added in Epic 3 (2026-04-26). The simple approach — one workflow that routes by `telegram_user_id` — collapsed under the weight of language and persona differences. I chose duplication instead: two workflows, two bots, two `profile` row-sets, one shared database.

Tenant isolation is enforced at three layers:

1. **Schema.** `profile.user_slug` is a composite PK column. Every read in `Fetch Context` filters by `user_slug`. Cross-user persona reads are impossible.
2. **Tools.** Every destructive or write tool that touches a tenant-scoped table has a `caller_paid_by` parameter — hardcoded in the agent wrapper, never `$fromAI()`. Patricia's `tool_log_expense` wrapper hardcodes `caller_paid_by='federico'`; Margaret's hardcodes `caller_paid_by='josephine'`. The LLM cannot reason its way past this; the workflow definition controls it. Gotchas #22 and #25–28 are the receipts: every one of them was a real bug where the LLM had been given too much discretion over `paid_by` or `owner_slug`, and the result was silent cross-tenant data corruption.
3. **Filters.** `get_recent_expenses` defaults to the caller's own slug (`paid_by` defaults to `caller_paid_by`). The LLM can override this to `'__ALL__'` for legitimate household queries ("how much did we spend on groceries this month?"), but the default is always caller-scoped.

The rule I extracted, written into the CLAUDE.md verbatim: *any SQL tool that writes to a tenant-scoped table MUST expose its tenant key as an explicit workflow input, hardcoded in the agent wrapper — never left to LLM discretion and never hardcoded in the SQL itself.*

### Three memory layers

- **Working memory.** Postgres Chat Memory, 8-message window, cleared per `/reset` command.
- **Episodic memory.** A `decisions` table (advisory audit trail). Empty in MVP — Phase 4 wires it up when the advice branch ships.
- **Semantic memory.** The `profile` table (persona + preferences, loaded every turn) plus `profile.memory` (an append-only markdown document the agent itself can write to, via the `remember` tool, for stable personal facts).

The split is deliberate. Working memory rotates — old failure patterns shouldn't keep biasing future responses. Semantic memory persists — the fact that I have two dogs named Bambi and Pochoclo should survive a `/reset`. The agent itself can only write to the semantic layer through `remember`, which is scoped to the user_slug in the SQL. It can't write to working memory directly; it can only flush it via `/reset`, which is user-triggered.

## Key decisions

- **Two bots, one DB.** Routing by user inside a single workflow would have meant language switching, persona switching, and route-by-`telegram_user_id` on every node. Duplicating the workflow (Patricia/Margaret) doubled maintenance but eliminated cross-tenant risk and let each bot have its own voice.
- **Voice as data.** Persona, categories, budgets, plan — all rows in tables. Editing voice is a SQL update.
- **Progressive disclosure for categories.** 100-token index in the prompt + `get_category` on demand. Scales to hundreds of categories without prompt bloat.
- **Tools as SQL, not prompts.** The LLM never executes inside a transaction. Every write is a `queryReplacement`-bound Postgres call.
- **Destructive tools require literal confirmation in the SQL.** `confirm_nuke="YES"` lives in the WHERE clause, not in a prompt instruction.
- **Polymorphic write tools where the keying dimension is identical.** `set_monthly_plan` covers income/budget/target with a `type` discriminator.
- **Native multimodal over Vision sub-workflow.** The Agent node's `passthroughBinaryImages` handles photo intake in three nodes, not twenty. Worth more than its weight in gold.
- **Atomic CTE for statement import.** Either all rows commit or none. A loop of single INSERTs is a data-loss waiting to happen.
- **Sentinel values, not empty strings.** n8n's `queryReplacement` parser strips empty strings; use `__ALL__`, `__NONE__`, `__TODAY__`, `__DEFAULT__` for optional params and handle them in SQL.
- **`$fromAI()` parameter descriptions are constraints.** When in doubt, spell out that zero is valid.

## Outcome

Live, in daily use, since April 2026.

- **Phases shipped:** 0 through 3c (intake, agent + tool calling, progressive disclosure, long-term memory, dual-nature categories, budget setup, edit + delete tools, shared-vault scoping, Margaret/multi-user, receipt photos via native multimodal, date disambiguation, PDF statement reconciliation).
- **Operational cost:** under $5/month (OpenAI + Railway + Supabase Pro, all of which I'd be paying anyway).
- **Open issues:** Phase 3d (monthly retrospective tool) and Phase 4 (voice tuning — Patricia still leaks some "assistant filler" phrases that need to be tightened in the persona prompt).

What I'd point at as the strongest signal isn't a metric; it's the project's CLAUDE.md file. It documents 33 gotchas — each one a real bug, each one a real fix — across 260 lines. Anyone who works seriously with n8n + AI Agent + Postgres will read that file and know: this is a system that's been operated, not just built.

## Reflection

The hardest part wasn't any single piece of technology. It was the discipline of **not over-engineering each phase before the previous one was real**. The Phase 3b Vision sub-workflow is the canonical case: I built an entire staging-table + inline-button + atomic-CTE flow for receipt photos before I'd verified that the user actually wanted that UX. They didn't. Twenty nodes became three. The lesson rhymes with what I write in design reviews at RockWallet: *ship the minimum viable conversation; iterate on the UX from contact with users, not from your imagination of them.*

The second-hardest part was multi-user. Adding Margaret exposed every place I'd been sloppy about ownership — every tool that defaulted to `'federico'`, every filter that didn't include `user_slug`. Four consecutive gotchas (#25–#28) are about cross-tenant data leakage I had to fix after Margaret went live. The rule that came out of it — *tenant key as workflow input, never as LLM discretion* — now applies to every multi-tenant agent I build.

What I'd do differently: I'd have started multi-user from day one. I told myself "I'll add it later if needed" — and "later" turned into a multi-week migration with composite PKs and a half-dozen tool retrofits. If I'd designed the `profile` table with a composite `(user_slug, key)` PK from the beginning, Epic 3 would have been one weekend instead of one week.

What I'm proud of: it's a system that has earned my own trust. I trust Patricia with the household finances enough that I no longer keep a parallel spreadsheet. That sentence is the entire portfolio. Agents that earn that level of trust are rare, and they aren't built by accident — they're built one debugged gotcha at a time, with a discipline about tenant isolation, tool design, and HITL gates that prompts alone can't enforce.

## Links

- Workflow: `[Patricia] Agent v2 - Core` (`vLZbLN8gxa7dfNSa`, 41 nodes)
- Workflow: `[Margaret] Agent v2 - Core` (`4Ih23rmqceNmKthP`, 43 nodes)
- Sub-workflows: nine tools, plus `tool_process_pdf_statement` (`vAE0vFpGvDD9RD7y`)
- Supabase project: `zpmaurcspssqumnmrzib` (`personal-finance-agent`)
- Telegram bots: `@patriciaaccountant_bot`, `@MargothAccounting_bot`
- Reference: [[personal-shopper-agent]] for the patterns this project generalized
- Reference: [[ugc-lead-gen-pipeline]] for cost-aware tool waterfalls in a non-conversational pipeline
- Anthropic, *Building Effective Agents* — the canonical source for the agent-vs-workflow distinction this project relies on

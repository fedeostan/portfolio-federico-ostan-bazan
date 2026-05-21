import type { SeedProject } from "@/lib/case-study/seed";

const project: SeedProject = {
  slug: "patricia-margaret-finance-agent",
  title:
    "Patricia & Margaret: A Production-Grade Household Finance Agent on Telegram",
  client: "Personal project",
  role: "Solo builder — agent design, n8n workflow, Supabase schema, multimodal pipeline, multi-user architecture",
  year: 2026,
  category: "ai",
  published: true,
  summary:
    "Two Telegram bots, one Supabase database, zero cross-tenant leakage — a production-discipline LLM agent I trust with my own household finances daily.",
  description:
    "Patricia (Spanish) and Margaret (English) are two Telegram-native AI agents running on n8n that log every household expense, read receipt photos, reconcile bank-statement PDFs, and refuse to corrupt user data — built solo, operated daily, documented across 33 gotchas. Stack: n8n native AI Agent node (LangChain), OpenAI GPT-4o + GPT-4o-mini, Supabase Postgres, Telegram Bot API, Railway. Architecture: agent-as-brain, workflow-as-body — voice and categories live as editable rows, tools are SQL not prompts, destructive writes require literal confirmation strings, tenant keys are workflow inputs never LLM discretion.",
  tech_stack: [
    "n8n",
    "LangChain AI Agent node",
    "OpenAI GPT-4o",
    "OpenAI GPT-4o-mini",
    "Supabase",
    "PostgreSQL",
    "Telegram Bot API",
    "Railway",
  ],
  metrics: {
    "Phases shipped": "0 → 3c",
    "Gotchas documented": "33",
    "Operational cost": "<$5/mo",
  },
  og_image_file: "cover.png",
  sections: [
    {
      section_type: "text",
      heading: "The workshop I run on myself",
      content_md:
        "For two years I've been quietly running an experiment on myself: what does it look like when you take the agent-design patterns from the *Building Effective Agents* literature and actually operate them as production software for your own life? Not a demo. Not a portfolio piece. Software that handles real money, every day, with consequences if it's wrong.\n\nThe result is **Patricia** — a Spanish-speaking, 50-year-old *professional accountant* who lives in a Telegram chat with me and logs every expense I make against a three-bucket mental model (Essentials / Fun / Future You). She reads receipt photos. She parses my bank statements. She remembers that my pets are Bambi and Pochoclo, that I'm allergic to shrimp, and that *\"con Ana\"* means a shared expense. She refuses to do split-math and offers attribution instead.\n\n**Margaret** is the same system, in English, for my partner Josephine. Both bots share a Supabase database. Neither can see the other's expenses. The whole thing runs on a shared Railway n8n instance and an OpenAI key, and it costs me a couple of dollars a month to operate.\n\nThis is the project I point at when I want to show I can do agent work at the level of *production discipline*, not at the level of *I called an LLM in a Cursor tab.* It's where I worked out — through 33 documented gotchas — what it actually takes to ship an agent that won't quietly corrupt user data when you weren't looking.",
      order: 10,
    },
    {
      section_type: "text",
      heading: "Spreadsheets are great until they aren't",
      content_md:
        "I'd been keeping personal finance in spreadsheets for years. Spreadsheets are great until they aren't: they require you to *visit* them. The friction kills the practice. Every time I left a receipt unlogged on Sunday afternoon, the Monday-night reconciliation got longer, until eventually I stopped reconciling. Then the spreadsheet was a graveyard of last quarter's data.\n\nThe unfair advantage of a Telegram bot is that the conversation lives where I already am. The unfair advantage of an agent — over a parser-based bot, which I built first — is that I don't have to remember a syntax. *\"spent eight euros on coffee\"* works. So does the same sentence with a typo, in Spanish, with a photo of the receipt, on a phone, one-handed, walking out of the café.\n\nThe hard part — the part this case study is actually about — is what happens *behind* that conversational surface. An agent that controls a household financial ledger has to be **tenant-isolated**, **multimodal**, **HITL on irreversibility**, **editable in place** without redeploys, and **production-honest about its mistakes**. 33 gotchas live in the project's CLAUDE.md because each one cost me a debugging session I'd rather not repeat.",
      order: 20,
    },
    {
      section_type: "image+text",
      heading: "Agent is the brain, workflow is the body",
      content_md:
        "The first design decision worth naming: this is not *an agent* in the simplistic sense. The Agent node — `@n8n/n8n-nodes-langchain.agent` — is the conversational face. But the surrounding n8n workflow does heavy lifting the agent doesn't: routing callback queries, parsing PDFs, executing atomic CTE imports, resetting chat memory, building inline keyboards, escaping Markdown.\n\nThe mental model I use: **the agent is the brain; the workflow is the body.** The agent decides what to say and which tool to call. The workflow handles state mutations, side effects, and anything that needs a guarantee an LLM can't provide.\n\nPatricia's workflow has 41 nodes. Margaret's has 43. Every node has a single responsibility. The cognitive cost of working on this thing month-over-month stays manageable because each branch is small — Switch → Download Photo → Agent for receipts; Telegram Trigger → Is Callback? → Prepare Input → Fetch Context → Build Agent Text → Patricia Agent → Reply for the conversational path.",
      order: 30,
    },
    {
      section_type: "image+text",
      heading: "Voice as data, categories on demand",
      content_md:
        "Patricia's identity lives in a `profile` table in Supabase, scoped by `user_slug`: `identity`, `soul`, `agents` (operational rules), `user_profile` (facts about me — family, pets, allergies, preferences), `memory` (append-only dated notes). `Fetch Context` pulls all of them into the system prompt every turn. Margaret's rows are the same keys, scoped by `user_slug='josephine'`, in English, with different facts.\n\nTo tune Patricia's voice, I open Supabase Studio and edit the `soul` row. Next message, she sounds different. **The minute you put personality in the prompt template, every personality tweak is a deploy. The minute you put it in a table, it's a SQL update.**\n\nThe same discipline applies to categories. There are 20+ of them now — dumping each full description into the system prompt would be thousands of tokens of context the agent rarely needs. Instead, the system prompt contains a compact ~100-token index. When the agent needs a fine-grained decision, it calls `get_category('pets')` and receives the full YAML+markdown `spec` on demand. Same pattern Claude Code uses for skills; same pattern Karpathy calls *LLM Wiki Architecture.* Context stays small, reasoning stays focused, and tuning a category is a `spec` edit, not a prompt edit.",
      order: 40,
    },
    {
      section_type: "text",
      heading: "Nine tools, scoped narrow, designed defensively",
      content_md:
        "Patricia has nine tool sub-workflows. A few decisions I'd surface:\n\n- **Tools are SQL, not prompts.** Each tool is a Postgres `executeQuery` call with `queryReplacement` parameter binding. The agent reasons about *what* to call; the tool enforces *what gets written*. This is a hard boundary — the LLM is never inside a transaction.\n- **Polymorphic write tools where the keying dimension is identical.** `set_monthly_plan` covers income, budget, and savings target via a `type` discriminator. Three near-identical tools would double the tool-description surface in the prompt without adding capability.\n- **Destructive tools require a literal string in the SQL.** `delete_expenses` with a full wipe doesn't trust the agent — it requires `confirm_nuke=\"YES\"` enforced *inside the WHERE clause itself*. Otherwise the query short-circuits to zero rows affected. The agent can't reason its way past this; the database refuses.\n- **`$fromAI()` parameter descriptions are constraints.** Gotcha #29 — the agent once refused to log `income=0` for a sabbatical month because the parameter description said *\"net monthly income\"* with no mention of zero being valid. I now write parameter descriptions assuming the LLM will treat them as type constraints.",
      order: 50,
    },
    {
      section_type: "text",
      heading: "Multimodal, the simple way (after I built it the hard way)",
      content_md:
        "Phase 3b — receipt photo logging — is where I learned the most expensive lesson in this project.\n\nMy first design: a separate Vision sub-workflow. Photo arrives → save to a `pending_expenses` staging table → call OpenAI's chat completions with a multimodal `image_url` content part → parse the response → render inline keyboard buttons (\"Confirm\", \"Edit\", \"Cancel\") → handle the callback → atomic CTE insert. About 20 nodes per agent.\n\nPhoto handling in n8n is fiddly: `item.binary.data.data` returns a *storage reference*, not the raw bytes, so you have to call `await this.helpers.getBinaryDataBuffer(0, 'data')` to get an actual Buffer to base64-encode. My first version POSTed the literal string `\"filesystem-v2\"` to OpenAI as the image data. OpenAI returned `400: invalid_image_format`. Embarrassing.\n\nAfter Josephine tried the inline-button flow and bounced off it, I scrapped the whole thing. The native AI Agent node has an option — `options.passthroughBinaryImages: true` (default!) — that, paired with a multimodal-capable model, forwards the binary as a multimodal `image_url` content part automatically. Twenty nodes became three: Switch → Download Photo → Agent. The conversational confirmation (*\"I see a €12.50 charge at Starbucks — want me to log it as coffee?\"*) replaced the inline-button UX entirely, and Patricia's voice stayed continuous across text and photo paths.\n\nThe lesson, written into CLAUDE.md verbatim: *when the input is \"give the agent more context\", check whether the Agent node already has a flag for it before wrapping it in a sub-workflow.*",
      order: 60,
    },
    {
      section_type: "text",
      heading: "PDF reconciliation — where the hybrid earns its keep",
      content_md:
        "Phase 3c is the most complex feature: upload a bank statement PDF, get back an inline-button-driven reconciliation flow. The pipeline:\n\n1. User sends a PDF. `Prepare Input` detects `is_pdf=true`. Agent receives the file_id and an instruction to call `process_pdf_statement`. The tool downloads → parses row-by-row → inserts a `statements` row + N `statement_rows` (all `status='new'`).\n2. Agent replies with a summary including `(id N)`. `Build PDF Buttons` regex-extracts N and sends an inline keyboard: *\"Process N transactions\"* → `continuar:N` callback.\n3. User taps. `Route CB Type` switches to the reconcile branch: `Get Stmt Rows` → `Build Categorize Prompt` → `Categorize with AI` (a deterministic HTTP call in JSON mode, **not** the conversational agent) → `Update Row Categories`.\n4. Agent posts a summary with two buttons: `confirm_statement:N` / `cancel_statement:N`.\n5. User confirms. `Import Expenses` runs an **atomic CTE**: INSERT rows into `expenses` + UPDATE `statement_rows` to `status='committed'` in one SQL call. **No partial failures.**\n\nTwo design points. First: I deliberately split *categorization* away from the conversational agent. Categorizing 30 statement rows is a deterministic, structured-output task — JSON mode + tight prompt + temperature 0. Routing it through the conversational agent would have meant slower, more expensive, harder-to-test. The agent calls the tool; the tool calls a structured LLM HTTP node; output flows back through a Code-node parser. Each step is replaceable in isolation.\n\nSecond: the atomic CTE is the difference between a system that loses data and a system that doesn't. A loop of single INSERTs is a data-loss waiting to happen — the first network blip leaves half the statement imported and the row-statuses inconsistent. The CTE either commits all rows or none.",
      order: 70,
    },
    {
      section_type: "text",
      heading: "Two bots, one DB, zero cross-tenant reads",
      content_md:
        "Margaret was added in Epic 3 (2026-04-26). The simple approach — one workflow that routes by `telegram_user_id` — collapsed under the weight of language and persona differences. I chose duplication instead: two workflows, two bots, two `profile` row-sets, one shared database.\n\nTenant isolation is enforced at three layers:\n\n1. **Schema.** `profile.user_slug` is a composite PK column. Every read in `Fetch Context` filters by `user_slug`. Cross-user persona reads are impossible.\n2. **Tools.** Every destructive or write tool that touches a tenant-scoped table has a `caller_paid_by` parameter — **hardcoded in the agent wrapper, never `$fromAI()`**. Patricia's `log_expense` wrapper hardcodes `caller_paid_by='federico'`; Margaret's hardcodes `caller_paid_by='josephine'`. The LLM cannot reason its way past this; the workflow definition controls it.\n3. **Filters.** `get_recent_expenses` defaults to the caller's own slug. The LLM can override to `'__ALL__'` for legitimate household queries (*\"how much did we spend on groceries this month?\"*), but the default is always caller-scoped.\n\nGotchas #22 and #25–28 are the receipts: every one of them was a real bug where the LLM had been given too much discretion over `paid_by` or `owner_slug`, and the result was silent cross-tenant data corruption. The rule I extracted, verbatim from the project's CLAUDE.md: *any SQL tool that writes to a tenant-scoped table MUST expose its tenant key as an explicit workflow input, hardcoded in the agent wrapper — never left to LLM discretion and never hardcoded in the SQL itself.*",
      order: 80,
    },
    {
      section_type: "text",
      heading: "Key decisions",
      content_md:
        "- **Two bots, one DB.** Duplicating the workflow doubled maintenance but eliminated cross-tenant risk and let each bot have its own voice.\n- **Voice as data, not code.** Persona, categories, budgets, plan — all rows in tables. Editing voice is a SQL update.\n- **Progressive disclosure for categories.** ~100-token index in the prompt + `get_category` on demand. Scales to hundreds of categories without prompt bloat.\n- **Tools as SQL, not prompts.** The LLM never executes inside a transaction. Every write is a `queryReplacement`-bound Postgres call.\n- **Destructive tools require literal confirmation in the SQL.** `confirm_nuke=\"YES\"` lives in the WHERE clause, not in a prompt instruction.\n- **Polymorphic write tools where the keying dimension is identical.** `set_monthly_plan` covers income/budget/target with a `type` discriminator.\n- **Native multimodal over Vision sub-workflow.** The Agent node's `passthroughBinaryImages` handles photo intake in three nodes, not twenty.\n- **Atomic CTE for statement import.** Either all rows commit or none.\n- **Sentinel values, not empty strings.** Use `__ALL__`, `__NONE__`, `__TODAY__`, `__DEFAULT__` for optional params; handle them in SQL.\n- **Tenant key as workflow input, never LLM discretion.** Forever.",
      order: 90,
    },
    {
      section_type: "metrics",
      heading: "Operating in production",
      content_md: null,
      order: 100,
    },
    {
      section_type: "gallery",
      heading: "Inside the system",
      content_md: null,
      order: 110,
    },
    {
      section_type: "text",
      heading: "Reflection — discipline beats cleverness",
      content_md:
        "The hardest part wasn't any single piece of technology. It was the discipline of **not over-engineering each phase before the previous one was real**. The Phase 3b Vision sub-workflow is the canonical case: twenty nodes for a UX nobody wanted, replaced by three nodes once I let the Agent node do its job. The lesson rhymes with what I write in design reviews at RockWallet: *ship the minimum viable conversation; iterate on the UX from contact with users, not from your imagination of them.*\n\nThe second-hardest part was multi-user. Adding Margaret exposed every place I'd been sloppy about ownership — every tool that defaulted to `'federico'`, every filter that didn't include `user_slug`. Four consecutive gotchas (#25–#28) are about cross-tenant data leakage I had to fix after Margaret went live. The rule that came out of it — **tenant key as workflow input, never as LLM discretion** — now applies to every multi-tenant agent I build.\n\nWhat I'd do differently: start multi-user from day one. I told myself *\"I'll add it later if needed\"* — and *later* turned into a multi-week migration with composite PKs and a half-dozen tool retrofits.\n\nWhat I'm proud of: it's a system that has earned my own trust. I trust Patricia with the household finances enough that I no longer keep a parallel spreadsheet. That sentence is the entire portfolio. Agents that earn that level of trust are rare, and they aren't built by accident — they're built one debugged gotcha at a time, with a discipline about tenant isolation, tool design, and HITL gates that prompts alone can't enforce.",
      order: 120,
    },
  ],
  assets: [
    {
      type: "hero",
      file: "hero.png",
      alt_text:
        "Patricia and Margaret — two Telegram-native finance agents sharing one Supabase database, running on n8n with the AI Agent node as the brain and the workflow as the body",
      caption:
        "Two bots, one DB, zero cross-tenant reads — the system I trust with the household ledger.",
      order: 10,
    },
    {
      type: "screenshot",
      file: "process-01.png",
      alt_text:
        "Patricia's n8n workflow — 41 nodes routing Telegram messages through callback handling, PDF / photo / reset detection, context fetch, agent invocation, reply, and inline-keyboard composition",
      caption:
        "The agent is the brain; the workflow is the body. Forty-one nodes, each with a single responsibility.",
      order: 30,
    },
    {
      type: "screenshot",
      file: "process-02.png",
      alt_text:
        "Voice-as-data: Patricia's identity, soul, agent rules, user profile, and memory stored as editable rows in the Supabase profile table, scoped by user_slug — tuning her voice is a SQL update",
      caption:
        "Voice as data, not code — editing the `soul` row in Supabase changes how she sounds on the next message.",
      order: 40,
    },
    {
      type: "screenshot",
      file: "gallery-01.png",
      alt_text:
        "A Patricia conversation: text expense, receipt photo logged via native multimodal, Spanish persona acknowledging Bambi and Pochoclo, refusing split-math and offering attribution",
      caption:
        "The conversational surface — text, photos, and a persona that refuses split-math.",
      order: 110,
    },
    {
      type: "screenshot",
      file: "gallery-02.png",
      alt_text:
        "PDF statement reconciliation flow — Patricia parses the bank statement, calls a deterministic JSON-mode categorizer outside the conversational agent, renders inline-button confirm/cancel, commits everything via an atomic CTE",
      caption:
        "PDF reconciliation — deterministic categorization outside the agent, atomic CTE for the final commit.",
      order: 120,
    },
  ],
};

export default project;

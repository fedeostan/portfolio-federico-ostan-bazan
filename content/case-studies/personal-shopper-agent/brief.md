---
title: "Personal Shopper: A Multi-Agent State Machine for Psychological Product Discovery"
role: Solo builder — design, agent architecture, n8n workflow, Next.js client
period: 2026-Q1 (active, in private beta)
status: shipped (workflow live; product surface in iteration)
team: Solo
stack: n8n (native AI Agent node) · OpenAI GPT-4o + GPT-4o-mini · Perplexity API (llama-3.1-sonar-large-128k-online) · Supabase PostgreSQL · Next.js 15 · Tailwind · Vercel AI SDK
sources:
  - n8n workflow `xVkkSX6Lk9OBmY0r` ("Psychological Shopping Assistant")
  - Supabase project `fbavheqqqdoscxrmyaua`
  - `~/n8n-agent/.claude/clients/fedeostan/projects/shopping-assistant/ARCHITECTURE.md`
  - `~/n8n-agent/.claude/clients/fedeostan/projects/shopping-assistant/PERSONAS.md`
  - n8n blog: *Multi-Agent Systems Best Practices*
---

# Personal Shopper: A Multi-Agent State Machine for Psychological Product Discovery

## Context

Product discovery in commerce keeps converging on the same shape: a search box, a grid of results, a filter sidebar. The whole interaction assumes the shopper already knows what they want — or that they'll bounce around long enough to figure it out. That assumption is wrong for most people most of the time. The shopper who walks into a small store and says "what would you give me?" gets a different — and usually better — experience than the one who types a query into Amazon.

The Personal Shopper is my answer to that gap: a conversational agent that profiles users into a buyer persona through five short questions, then adapts every product recommendation to the way that specific user makes decisions. A `DEAL_HUNTER` and a `BRAND_LOYALIST` get different answers to the same question, presented in different language, ordered by different criteria — because they *are* different decision-makers.

It's also, on purpose, a vehicle for me to practice agent design patterns in a domain where the cost of being wrong is bounded (a missed sale, not a lost customer or a regulatory issue). Everything I learned here transferred directly to the work I'm doing on agent UX inside RockWallet and inside the Moussemango client roster.

## The problem

The single-agent shape of most chatbots — one prompt, one model, one tool surface, one personality — collapses under three pressures specific to shopping:

1. **State matters.** A new user, a partially-profiled user, and a fully-profiled user need three different conversations. Conflating them into one prompt produces an agent that's either over-eager (asks profiling questions to people who already passed them) or under-eager (recommends products to people who haven't even given an email).
2. **Personality is data, not text.** Hard-coding "be friendly to impulse shoppers, be detailed to analytical buyers" in the prompt makes the prompt a giant switch statement. The agent's behavior should be expressed *declaratively*, with persona-specific behavior loaded from a table at query time.
3. **Hallucination is a product failure, not a quality failure.** If the agent invents a product, a price, or a link, the user clicks and the trust is gone. The agent needs to be *physically incapable* of generating a recommendation without calling a search tool first.

Solving all three pushed me toward a multi-agent state machine: three specialized agents, persona-as-data, mandatory tool calls.

## My role

I designed, built, and operated everything. The agent architecture, the n8n workflow, the Supabase schema, the persona taxonomy, the Next.js client surface — all mine. There is no team. The case study would be longer if there were; I'd be relaying more decisions and fewer of my own.

The constraint that shaped most of the choices: **deliver this with one operator** (me) and an n8n instance I already pay for. No model fine-tuning, no vector DB, no custom RAG stack. Off-the-shelf primitives, composed thoughtfully.

## Approach

### Three agents, one state machine

Following Anthropic's *Building Effective Agents* and n8n's multi-agent guidance, I split the work across three specialized agents — each with its own model, memory, and tool surface — routed by user state:

```
Chat Trigger → Session Manager → Get User State → Route by State
                                                    │
                  ┌─────────────────────────────────┼─────────────────────────────────┐
                  ▼                                 ▼                                 ▼
            NEW (no email)                  ONBOARDING                          PROFILED
                  │                                 │                                 │
        Email Collector Agent           Profiling Agent (5 Qs)           Shopping Assistant Agent
        Model: GPT-4o-mini              Model: GPT-4o-mini                Model: GPT-4o
        Memory: 10-msg buffer           Memory: 15-msg buffer             Memory: 20-msg Postgres
        Tools: none                     Tools: none (parses to JSON)      Tools: Perplexity search,
                                                                                  preferences lookup
```

State lives in one place — `shopping_users.state` in Supabase (`NEW` → `ONBOARDING` → `PROFILED`). The router reads it on every turn. Each agent has exactly the context it needs to do its job and nothing else.

The single most important consequence of this design is that the **shopping agent never sees the profiling conversation**. The profiling agent never sees the product searches. Context windows stay small, prompts stay focused, and each agent can be tuned independently. When I extend the profiling flow from 5 to 7 questions next month, the shopping agent prompt doesn't change.

### Persona as data, not code

Six buyer personas live in the system: `IMPULSE_SHOPPER`, `ANALYTICAL_BUYER`, `DEAL_HUNTER`, `BRAND_LOYALIST`, `ETHICAL_SHOPPER`, `QUALITY_FOCUSED`. Each has a presentation strategy stored in the prompt, but the *classification* is a value in the `shopping_users.persona_type` column. When the Shopping Assistant agent loads context for a turn, it pulls:

```sql
SELECT email, persona_type, preferences, recent_searches, favorite_products
FROM shopping_users
WHERE session_id = $1;
```

…and injects the persona into the system prompt. The prompt has one persona-aware section that branches presentation, but the *data* that drives it is a string in a row. To re-personalize a user, you change a value in Supabase Studio. No redeploy.

This pattern — "voice as data" — is the single most useful agent-design discipline I've internalized in the last year. It's the same pattern I used later in the Patricia personal-finance agent (where the entire persona — identity, soul, operating rules — is a set of rows in a `profile` table). The minute you put the agent's character in code, you've made every personality change a deploy.

### Profiling: a structured five-question funnel

The Profiling Agent is the most "deterministic" of the three. It asks one question per message, in a fixed order:

| Step | Theme | What it reveals |
|------|-------|-----------------|
| 0 | Shopping speed | Impulse vs. deliberate |
| 1 | What matters most | Core values |
| 2 | Quality vs. price | Budget orientation |
| 3 | First thing looked at | Decision triggers |
| 4 | Ideal experience | Emotional drivers |

After step 4, the agent outputs a single line — `CLASSIFICATION_COMPLETE: [PERSONA_TYPE]` — that the workflow parses with a regex to update the database. That handoff (LLM as classifier, regex as parser, SQL as state mutation) is intentionally boring. LLMs are good at classification when you constrain the output space; the deterministic surrounding plumbing keeps the state machine honest.

### Tool discipline: the agent cannot hallucinate products

The Shopping Assistant agent has one job that matters: never invent a product. The system prompt is explicit ("MUST use search tools for every product request — never make up products or prices"), but prompts aren't safety; tools are. The agent's only path to a product mention is to call `search_products` against Perplexity's online model (`llama-3.1-sonar-large-128k-online`), which returns real-time, citation-backed results. Perplexity is configured via HTTP Header Auth — not n8n's dedicated Perplexity credential — because that's the cleanest path for a Bearer token.

If the agent returns text without having called the tool, that's a bug; I see it in n8n's execution log and tighten the prompt. The tool call is also where I attach `persona_type` as a parameter, so search results are pre-shaped by persona before the LLM frames them. A `DEAL_HUNTER` query for "running shoes" surfaces sale-priced options at the top of the result set; an `ETHICAL_SHOPPER` query surfaces certified B-Corp and recycled-material brands first.

### Model matching: cheap where it works, capable where it counts

`GPT-4o-mini` runs the Email Collector and Profiling agents. Their jobs are simple — extract one field, walk through five fixed questions — and a cheaper model handles them fine. `GPT-4o` runs the Shopping Assistant, where the reasoning required to interpret a persona, frame search results, and maintain conversational continuity benefits from the bigger model.

Splitting the workload this way isn't just a cost play; it's a design statement. Each agent is sized to its actual reasoning load. If the profiling step ever needs more nuance, I'll upgrade just that agent.

## Key decisions

- **Multi-agent over super-agent.** Single-agent designs collapse when state branches multiply. Three agents with explicit handoffs is the right shape for "the conversation has phases."
- **State as a column, not as conversation history.** I could have inferred user state from the chat history (look for an email earlier, look for profiling answers). I didn't — that's brittle and slow. State is a string in the DB. The agent doesn't have to reason about it; the router does.
- **Persona as data.** Six personas are stored in `PERSONAS.md` as design reference and in `shopping_users.persona_type` as runtime value. Changing presentation strategy is a prompt edit; changing a user's classification is a SQL update; neither is a deploy.
- **Mandatory tool calls.** No product recommendation may exit the agent without a Perplexity call backing it. This is enforced through prompt instruction and verified through execution log review. It's the difference between a demo and a product.
- **Postgres chat memory, capped at 20 messages.** Long enough to carry context across a normal shopping session, short enough that prompt cost stays predictable and old failure patterns get rotated out.
- **Two memory layers per agent.** Working memory (chat buffer) and semantic memory (`shopping_users.preferences` JSONB) are different concerns. The buffer rotates; preferences persist. Conflating them — as some single-agent designs do — produces an agent that forgets what you told it three sessions ago and remembers something you said five minutes ago.
- **Defer Universal Commerce Protocol integration.** The PRD reserves a slot for Google's UCP (direct-checkout) integration, but I intentionally shipped without it. The recommendation experience needs to be right before the checkout experience matters.

## Outcome

The workflow is live and running on Supabase project `fbavheqqqdoscxrmyaua`. The full state machine — onboarding → profiling → personalized recommendations — works end-to-end. Six personas are deployed, classification is deterministic, and the Shopping Assistant successfully refuses to invent products (verified by inspecting Perplexity HTTP calls in n8n's execution log).

What I'd point at as the strongest signal isn't the workflow itself but what it taught me: the patterns I formalized here (state-as-column, persona-as-data, mandatory tool calls, model-matching) became the spine of every agent I've built since. The Patricia personal-finance agent is essentially this case study generalized to a stateful financial domain. The UGC lead-gen pipeline is the same disciplines applied to a non-conversational pipeline. The Shopping Assistant is where I stopped writing chatbots and started building agents.

## Reflection

The hardest part wasn't the technology; it was the personality taxonomy. Six personas is a *design* decision, not a model decision. I iterated on the list — there were eight at one point — and pulled the count down because two of them (`SOCIAL_PROOF_DRIVEN` and `BRAND_LOYALIST`) collapsed into one signal in profiling. Removing personas is harder than adding them, because every persona-aware section of the system prompt becomes a row in a switch statement, and you have to confirm none of the existing behavior depended on the deleted branch. Lesson: keep persona-aware sections in one place in the prompt, not sprinkled.

The second lesson is about tools. The first version of the Shopping Assistant let the agent return product names without a Perplexity call, with a system-prompt instruction that said "please don't invent products." It invented products. The fix wasn't a better prompt; it was making the search tool the only path to a product mention. *Tools, not prompts, enforce behavior.* I now apply that rule to every agent I build.

What I'd do differently: I'd ship with the click-tracking and preference-learning loops from day one. Recommendation quality without feedback is guesswork. The hooks are designed (`recent_searches`, `favorite_products` JSONB columns are in the schema) but unused. Next iteration.

What I'm proud of: it's a small, focused, opinionated agent that does one thing well, with the architecture honest about its constraints. No vector DB it doesn't need. No fine-tune. No agent framework. Just disciplined composition of off-the-shelf primitives — which is, increasingly, what serious agent work looks like.

## Links

- n8n workflow ID: `xVkkSX6Lk9OBmY0r`
- Supabase project: `fbavheqqqdoscxrmyaua`
- Reference: [[patricia-margaret-finance-agent]] for the production maturation of these patterns
- Reference: [[ugc-lead-gen-pipeline]] for the same disciplines applied to a non-conversational pipeline
- Anthropic, *Building Effective Agents* — the canonical source for the multi-agent reasoning above

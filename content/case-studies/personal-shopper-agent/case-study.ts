import type { SeedProject } from '@/lib/case-study/seed'

const project: SeedProject = {
  slug: 'personal-shopper-agent',
  title: 'Personal Shopper: A Multi-Agent State Machine for Psychological Product Discovery',
  client: 'Personal project',
  role: 'Solo builder',
  year: 2026,
  category: 'ai',
  published: true,
  summary:
    "Three specialized agents routed by state turn a five-question funnel into one of six buyer personas, then frame Perplexity-backed product search in that persona's voice.",
  description:
    'Solo-built multi-agent state machine on n8n + OpenAI (GPT-4o + GPT-4o-mini) + Supabase + Next.js 15. NEW → ONBOARDING → PROFILED routed by a single column; six buyer personas live as data, not code; the shopping agent is physically incapable of returning a product without first calling Perplexity. Tools, not prompts, enforce behavior.',
  tech_stack: [
    'n8n',
    'OpenAI GPT-4o',
    'OpenAI GPT-4o-mini',
    'Perplexity API',
    'Supabase',
    'PostgreSQL',
    'Next.js 15',
    'Tailwind',
    'Vercel AI SDK',
  ],
  metrics: {
    'Specialized agents in the workflow': '3 (Email Collector · Profiling · Shopping Assistant)',
    'Buyer personas deployed': '6 (data-driven, not prompt-driven)',
    'Profiling questions before classification': '5 (deterministic funnel)',
    'Model split (cost where it works, capable where it counts)':
      'GPT-4o-mini · GPT-4o-mini · GPT-4o',
    'Hallucinated products since mandatory tool calls': '0 (verified in n8n execution log)',
    'Postgres chat memory cap': '20 messages per session',
  },
  og_image_file: 'cover.png',
  sections: [
    {
      section_type: 'text',
      heading: 'The shopper who asks "what would you give me?"',
      content_md:
        "Product discovery in commerce keeps converging on the same shape — search box, grid of results, filter sidebar. The interaction assumes the shopper already knows what they want, or that they'll bounce around long enough to figure it out. That assumption is wrong for most people most of the time.\n\nThe shopper who walks into a small store and says *\"what would you give me?\"* gets a different — and usually better — experience than the one who types a query into Amazon. The Personal Shopper is my answer to that gap: a conversational agent that profiles users into a buyer persona through five short questions, then adapts every product recommendation to the way that specific user makes decisions. A `DEAL_HUNTER` and a `BRAND_LOYALIST` get different answers to the same question, in different language, ordered by different criteria — because they *are* different decision-makers.\n\nIt's also, on purpose, a vehicle for me to practice agent design patterns in a domain where the cost of being wrong is bounded — a missed sale, not a lost customer or a regulatory issue. Everything I learned here transferred directly to the agent UX work I'm doing inside RockWallet and across the Moussemango client roster.",
      order: 10,
    },
    {
      section_type: 'text',
      heading: 'Why a single-agent chatbot collapses here',
      content_md:
        'The one-prompt-one-model-one-personality shape of most chatbots collapses under three pressures specific to shopping:\n\n1. **State matters.** A new user, a partially-profiled user, and a fully-profiled user need three different conversations. Conflating them into one prompt produces an agent that\'s either over-eager (asks profiling questions to someone who already passed them) or under-eager (recommends products to someone who hasn\'t even given an email).\n2. **Personality is data, not text.** Hard-coding *"be friendly to impulse shoppers, be detailed to analytical buyers"* into the prompt makes the prompt a giant switch statement. Behavior should be expressed *declaratively*, with persona-specific logic loaded from a table at query time.\n3. **Hallucination is a product failure, not a quality failure.** If the agent invents a product, a price, or a link, the user clicks and trust is gone. The agent needs to be *physically incapable* of generating a recommendation without calling a search tool first.\n\nSolving all three pushed me toward a multi-agent state machine: three specialized agents, persona-as-data, mandatory tool calls.',
      order: 20,
    },
    {
      section_type: 'image+text',
      heading: 'Three agents, one state machine',
      content_md:
        "Following Anthropic's *Building Effective Agents* and n8n's multi-agent guidance, I split the work across three specialized agents — each with its own model, memory, and tool surface — routed by user state:\n\n- **Email Collector** (`GPT-4o-mini`, 10-msg buffer, no tools) handles `NEW`.\n- **Profiling Agent** (`GPT-4o-mini`, 15-msg buffer, parses to JSON) handles `ONBOARDING`.\n- **Shopping Assistant** (`GPT-4o`, 20-msg Postgres memory, Perplexity + preferences lookup) handles `PROFILED`.\n\nState lives in one place — `shopping_users.state` in Supabase, transitioning `NEW` → `ONBOARDING` → `PROFILED`. The router reads it on every turn. Each agent gets exactly the context it needs and nothing else.\n\nThe single most important consequence of this design is that the **shopping agent never sees the profiling conversation**. The profiling agent never sees the product searches. Context windows stay small, prompts stay focused, and each agent can be tuned independently. When I extend the profiling flow from 5 to 7 questions next month, the shopping agent prompt doesn't change.",
      order: 30,
    },
    {
      section_type: 'image+text',
      heading: 'Persona as data, not code',
      content_md:
        "Six buyer personas live in the system: `IMPULSE_SHOPPER`, `ANALYTICAL_BUYER`, `DEAL_HUNTER`, `BRAND_LOYALIST`, `ETHICAL_SHOPPER`, `QUALITY_FOCUSED`. Each has a presentation strategy stored in the prompt, but the *classification* is a value in the `shopping_users.persona_type` column. To re-personalize a user, you change a value in Supabase Studio. No redeploy.\n\nThis pattern — *voice as data* — is the single most useful agent-design discipline I've internalized in the last year. It's the same pattern I used later in the Patricia personal-finance agent, where the entire persona (identity, soul, operating rules) is a set of rows in a `profile` table. The minute you put the agent's character in code, you've made every personality change a deploy.\n\nThe profiling flow itself is intentionally deterministic — five questions in a fixed order, then the agent outputs a single line (`CLASSIFICATION_COMPLETE: [PERSONA_TYPE]`) that the workflow parses with a regex and writes to the database. LLM as classifier, regex as parser, SQL as state mutation. Boring on purpose.",
      order: 40,
    },
    {
      section_type: 'text',
      heading: 'Tools, not prompts, enforce behavior',
      content_md:
        "The Shopping Assistant has one job that matters: never invent a product. The system prompt is explicit (*\"MUST use search tools for every product request — never make up products or prices\"*), but prompts aren't safety; tools are.\n\nThe agent's only path to a product mention is to call `search_products` against Perplexity's online model (`llama-3.1-sonar-large-128k-online`), which returns real-time, citation-backed results. Perplexity is configured via HTTP Header Auth — not n8n's dedicated Perplexity credential — because that's the cleanest path for a Bearer token. If the agent returns text without having called the tool, that's a bug; I see it in n8n's execution log and tighten the prompt.\n\nThe tool call is also where I attach `persona_type` as a parameter, so search results are pre-shaped *before* the LLM frames them. A `DEAL_HUNTER` query for *\"running shoes\"* surfaces sale-priced options at the top of the result set; an `ETHICAL_SHOPPER` query surfaces certified B-Corp and recycled-material brands first.\n\nModel matching follows the same logic. `GPT-4o-mini` runs Email Collector and Profiling — their jobs are simple (extract one field, walk through five fixed questions) and a cheaper model handles them fine. `GPT-4o` runs the Shopping Assistant, where interpreting a persona, framing search results, and maintaining conversational continuity benefits from the bigger model. Each agent is sized to its actual reasoning load.",
      order: 50,
    },
    {
      section_type: 'text',
      heading: 'Key decisions',
      content_md:
        "- **Multi-agent over super-agent.** Single-agent designs collapse when state branches multiply. Three agents with explicit handoffs is the right shape for *\"the conversation has phases.\"*\n- **State as a column, not as conversation history.** I could have inferred user state from the chat (look for an email earlier, look for profiling answers). I didn't — that's brittle and slow. State is a string in the DB; the agent doesn't reason about it; the router does.\n- **Persona as data.** Changing presentation strategy is a prompt edit. Changing a user's classification is a SQL update. Neither is a deploy.\n- **Mandatory tool calls.** No product recommendation may exit the agent without a Perplexity call backing it. The difference between a demo and a product.\n- **Postgres chat memory, capped at 20 messages.** Long enough to carry context across a normal session, short enough that prompt cost stays predictable and old failure patterns rotate out.\n- **Two memory layers per agent.** Working memory (chat buffer) and semantic memory (`shopping_users.preferences` JSONB) are different concerns. The buffer rotates; preferences persist. Conflating them produces an agent that forgets what you told it three sessions ago and remembers something you said five minutes ago.\n- **Defer Universal Commerce Protocol integration.** The PRD reserves a slot for Google's UCP (direct-checkout) integration, but I intentionally shipped without it. Recommendation quality needs to be right before checkout matters.",
      order: 60,
    },
    {
      section_type: 'metrics',
      heading: 'What shipped',
      content_md: null,
      order: 70,
    },
    {
      section_type: 'gallery',
      heading: 'Surface + state',
      content_md: null,
      order: 80,
    },
    {
      section_type: 'text',
      heading: 'Reflection — where I stopped writing chatbots',
      content_md:
        "The hardest part wasn't the technology; it was the personality taxonomy. Six personas is a *design* decision, not a model decision. I iterated — there were eight at one point — and pulled the count down because two of them (`SOCIAL_PROOF_DRIVEN` and `BRAND_LOYALIST`) collapsed into one signal in profiling. Removing personas is harder than adding them, because every persona-aware section of the system prompt becomes a row in a switch statement, and you have to confirm none of the existing behavior depended on the deleted branch. *Lesson: keep persona-aware sections in one place in the prompt, not sprinkled.*\n\nThe second lesson is about tools. The first version of the Shopping Assistant let the agent return product names without a Perplexity call, with a system-prompt instruction that said *\"please don't invent products.\"* It invented products. The fix wasn't a better prompt; it was making the search tool the only path to a product mention. **Tools, not prompts, enforce behavior.** I now apply that rule to every agent I build.\n\nWhat I'd do differently: ship with the click-tracking and preference-learning loops from day one. Recommendation quality without feedback is guesswork. The hooks are designed (`recent_searches`, `favorite_products` JSONB columns are in the schema) but unused. Next iteration.\n\nWhat I'm proud of: it's a small, focused, opinionated agent that does one thing well, with the architecture honest about its constraints. No vector DB it doesn't need. No fine-tune. No agent framework. Just disciplined composition of off-the-shelf primitives — which is, increasingly, what serious agent work looks like. The Shopping Assistant is where I stopped writing chatbots and started building agents.",
      order: 90,
    },
  ],
  assets: [
    {
      type: 'hero',
      file: 'hero.png',
      alt_text:
        'Personal Shopper — multi-agent state machine on n8n routing users from NEW to ONBOARDING to PROFILED, with persona-aware product search backed by Perplexity',
      caption:
        "Three specialized agents, one Supabase column for state, six buyer personas as data — the spine of every agent I've built since.",
      order: 10,
    },
    {
      type: 'screenshot',
      file: 'process-01.png',
      alt_text:
        'Three-agent state machine — Chat Trigger → Session Manager → state router → Email Collector (NEW) | Profiling Agent (ONBOARDING) | Shopping Assistant (PROFILED) — each with its own model, memory, and tool surface',
      caption:
        'Router reads state on every turn; each agent gets exactly the context it needs and nothing else. The shopping agent never sees the profiling conversation.',
      order: 30,
    },
    {
      type: 'screenshot',
      file: 'process-02.png',
      alt_text:
        'Persona as data — six buyer personas (IMPULSE_SHOPPER, ANALYTICAL_BUYER, DEAL_HUNTER, BRAND_LOYALIST, ETHICAL_SHOPPER, QUALITY_FOCUSED) stored as a column in shopping_users, loaded into the system prompt at query time',
      caption:
        "Changing presentation strategy is a prompt edit; changing a user's classification is a SQL update. Neither is a deploy.",
      order: 40,
    },
    {
      type: 'screenshot',
      file: 'gallery-01.png',
      alt_text:
        'Profiling funnel — five fixed questions revealing shopping speed, core values, budget orientation, decision triggers, and emotional drivers, ending in CLASSIFICATION_COMPLETE: [PERSONA_TYPE]',
      caption:
        'LLM as classifier, regex as parser, SQL as state mutation. The deterministic surrounding plumbing keeps the state machine honest.',
      order: 80,
    },
    {
      type: 'screenshot',
      file: 'gallery-02.png',
      alt_text:
        "Shopping Assistant turn — system prompt loads persona_type from Supabase, agent calls search_products against Perplexity's llama-3.1-sonar-large-128k-online, results are framed in the persona's voice with citations",
      caption:
        'The tool call is where persona_type rides through to Perplexity — search results are pre-shaped before the LLM frames them.',
      order: 90,
    },
  ],
}

export default project

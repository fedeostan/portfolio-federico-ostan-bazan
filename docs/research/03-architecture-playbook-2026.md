# The AI-Native Designer Portfolio: A 2026 Architecture Playbook

## TL;DR

- **Build it as Next.js 15 App Router on Vercel, with Vercel AI SDK v5 `useChat` + typed tool calls (NOT `streamUI`/RSC, which Vercel paused), Claude Sonnet 4.6 as the primary model with adaptive thinking exposed via `reasoningText`, Supabase Postgres with full-text search (no vector DB) as content + runtime DB, and Whisper-on-Groq for one-shot voice input.** This stack matches your existing skill set (Vercel AI SDK, Next.js, Supabase, Anthropic Agent SDK), maximizes the "AI craft is the portfolio" message, and runs at roughly $20–30/month at 500 visitors (dominated by Vercel Pro, not LLM tokens).
- **Reject the three most-tempting wrong turns**: (1) `streamUI` / AI SDK RSC — officially paused by Vercel because components don't re-hydrate across follow-ups, which is exactly your use case; (2) a vector DB for 20–50 case studies — pgvector is overkill at this scale, structured + full-text retrieval wins on latency, debuggability and grounding; (3) OpenAI Realtime API for one-shot voice — it locks you into OpenAI for the LLM step and at the May 7, 2026 gpt-realtime-2 rates (~$1.15 input / $4.61 output per hour of audio per Handy AI's Model Drop newsletter) is far more expensive than Whisper→text→Claude for no UX benefit when the output is rich React components rather than spoken audio.
- **Realistic build for a senior designer/design engineer with your background: 3–5 focused weekends (~45–60 hours) to ship a polished v1**, with the bulk of the time on case study content authoring, component design, and prompt/eval iteration — not plumbing. Real prior art (toukoum.fr, fastfol.io, nikolailehbrink/portfolio, medevs/smart-portfolio) shows this is now a well-trodden pattern.

---

## Key Findings

1. **AI SDK RSC (`streamUI`) is officially paused.** Vercel's own docs and GitHub discussion #3251 state: "Development of AI SDK RSC is paused. We recommend using AI SDK UI" — directly because of the re-hydration limitation you flagged. The supported 2026 pattern is `streamText` + tool calls rendered client-side from `message.parts` with typed `tool-${toolName}` parts. This is the same direction `assistant-ui`, CopilotKit, and LangGraph all converged on.
2. **For 20–50 case studies, vector search is the wrong default.** Encore's pgvector guide, multiple 2026 RAG benchmarks, and the most-cited prior-art portfolios (toukoum.fr on OpenAI, Lovely Mcinerney on Llama 3.3, Kehinde Onifade on Next.js + TypeScript knowledge file) all use **structured retrieval or BM25, not embeddings.** Hybrid (BM25 + dense + RRF) only starts to pay off in the hundreds-of-thousands-of-docs range; at 20–50 case studies with rich metadata, Postgres `tsvector` + structured filters + LLM-side ranking is faster, cheaper, and easier to debug.
3. **Claude Sonnet 4.6 is the right primary model for this use case.** It hit GA February 17, 2026 at $3/$15 per M tokens, ships **adaptive thinking by default** (no `budget_tokens` config), and on Artificial Analysis benchmarks delivers 1.24s TTFT and 45.3 tok/s on Anthropic's endpoint — fast enough for a chat hero. Crucially, the Vercel AI SDK exposes Anthropic's thinking summaries as `result.reasoningText` and streams them by default through `useChat` — which is exactly the "thinking visible in the UI" feature you want as part of your craft message.
4. **For one-shot voice → text + rich UI out, Whisper (via Groq, $0.04/hr) wins decisively over the Realtime API.** OpenAI's May 7, 2026 gpt-realtime-2 prices audio at $32/1M input + $64/1M output tokens (~$1.15/$4.61 per hour of conversation per Handy AI's Model Drop), couples you to OpenAI for the entire LLM, and was designed for speech-to-speech conversations — not for the "speak once, get a rich rendered UI" pattern. Browser Web Speech API is free but inconsistent (Safari quality is poor); Deepgram Nova-3/Flux is overkill for a portfolio.
5. **Prior art exists and is converging on a consistent stack.** The strongest concrete reference is **toukoum.fr** (Raphael Giraud, ~274 GitHub stars on the open-source repo) — Next.js + TypeScript + OpenAI + structured retrieval, no vector DB. The cleanest stack-match to your context is **nikolailehbrink/portfolio: Next.js + Vercel AI SDK + LlamaIndex.TS + MDX + OpenAI**. The "AI-native portfolio" pattern is no longer experimental in May 2026; it's a documented genre with shipped templates.
6. **Vercel is the correct deployment target for this specific app**, despite Cloudflare's substantial cost advantage at scale, because at 500 visitors/month the bandwidth/compute savings are negligible and the Next.js 15 App Router + AI SDK + Vercel AI Gateway integration is hours of headstart you can't easily recover on Cloudflare's OpenNext adapter.

---

## Details

### 1. Content storage / "RAG" approach

**Recommendation: Supabase Postgres as both source of truth and runtime DB. Schema with typed columns + a `tsvector` full-text column + GIN index. No pgvector. No Notion-as-runtime-DB. No Contentlayer.**

**Threshold reasoning.** Vector embeddings earn their cost when (a) you have semantic-paraphrase queries that BM25 misses, and (b) your corpus is large enough that LLM-based ranking over the full set is impractical. The Tiger Data (TimescaleDB) FTS-vs-vector guide and Encore's pgvector deep-dive both make the same point: for documentation-scale corpora under ~50k entries, pgvector adds latency (5–50ms search + 100–300ms embedding) for negligible recall benefit. At 20–50 case studies, you're in a regime where you can simply **send the full structured index (titles, roles, tech stack, metrics, 1-paragraph summary) into Claude's system prompt** — that's maybe 5–10k tokens, well within Sonnet 4.6's 1M context, and recall is by definition 100%. Claude then picks the relevant projects to render via tool calls.

**Why Supabase over Notion-as-runtime-DB.** Notion is excellent as an authoring layer, but at runtime its API is slow (often 500ms–2s per page fetch), images expire after 1 hour, and the block-based structure forces you to write recursive renderers. For a streaming generative-UI app where you want sub-second time-to-first-token, querying Postgres for typed rows and serializing them into the system prompt is dramatically faster. Multiple writeups on this exact pattern (Jignesh on jigz.dev, the nextjs-notion-starter-kit repo by transitive-bullshit) all end up syncing Notion → static JSON or static export to escape the latency. If you love Notion's UX for writing, use **Notion → build-time sync to Supabase** (a single nightly cron via a Vercel cron job or Notion webhook), not Notion at runtime.

**Why not Payload/Sanity/Contentlayer.** Payload and Sanity are excellent CMSes but introduce a hosting dependency or vendor lock-in for ~30 records that are unlikely to change daily. Contentlayer is essentially abandoned (last meaningful release in 2023). For a portfolio, **MDX in the repo or typed Postgres rows in Supabase** are both better choices than a heavyweight headless CMS.

**The retrieval implementation.** For the AI to ground confidently, expose three tools to Claude:
- `search_projects(query, filters)` — runs `to_tsquery` over title/summary/tech_stack with `ts_rank` ordering, returns top 5 with structured fields.
- `get_project_detail(slug)` — single typed row fetch for deep follow-ups ("tell me more about the Rockwallet KYC redesign").
- `list_projects_by_metric(metric, threshold)` — e.g., "show projects where I owned conversion."

This is BM25-style retrieval inside Postgres. Persist the `tsvector` column (Danielabaron's guide on tsvector performance is the canonical reference: computing tsvectors at query time forces sequential scans even on tiny tables). For Spanish + English, configure `to_tsvector('simple', ...)` and let Claude handle stemming via the model itself rather than fighting Postgres's per-language config.

**Hybrid option, only if you find a recall miss.** If after launch you observe Claude failing on paraphrased queries ("got any work for fintech compliance teams?" → not matching "KYC" or "AML"), add a `match_projects_semantic(embedding)` tool using pgvector as a fallback. Don't pre-build this — measure first.

### 2. Generative UI / streamed React components

**Recommendation: Vercel AI SDK v5 with `streamText` + tool calls + `useChat` on the client, rendering typed React components from `message.parts`. Wrap the UI shell with `assistant-ui` primitives for thread management.**

**Why not `streamUI`/RSC.** Beyond the official "paused" notice, the failure mode is precisely your use case: when a project card streamed in turn 1 needs to appear again in turn 3's "compare these two projects" answer, RSC payloads don't cleanly re-hydrate, and `createStreamableUI`'s `.done()` causes remounts. Vercel's own migration guide acknowledges this. Streaming structured tool calls (JSON) and rendering typed React components client-side gives you full control over re-hydration: the same `<ProjectCard slug="rockwallet-kyc" />` renders identically whether it appears in turn 1 or turn 7, with React's reconciliation doing the right thing automatically.

**Component contract.** Define tools whose outputs are component props, not arbitrary blobs:

```ts
const tools = {
  showProjectCard: {
    description: 'Render a project card for a specific case study',
    inputSchema: z.object({ slug: z.string(), highlight: z.enum(['metrics','process','outcome']).optional() }),
    execute: async ({ slug, highlight }) => fetchProject(slug, highlight),
  },
  showProjectGallery: { /* ... */ },
  showTechStackBadges: { /* ... */ },
  showMetricCallout: { /* ... */ },
  proposeFollowups: { /* ... */ },
};
```

In `useChat`, iterate `message.parts` and switch on `type === 'tool-showProjectCard'` with states `input-available` (skeleton), `output-available` (real card), `output-error` (graceful fallback). This is the pattern documented in Vercel's "Multi-Step & Generative UI" academy lesson and in assistant-ui's `makeAssistantToolUI` API.

**Why `assistant-ui` on top of AI SDK.** It is the most adopted React chat-UI primitive set — SaaStr reports "over 200,000 monthly downloads and adoption by companies like LangChain, Athena Intelligence, Stack AI, and Browser Use" — and is a Y Combinator W25 company. It ships shadcn-themed components and has a `useChatRuntime` adapter that connects directly to Vercel AI SDK. For a designer's portfolio you specifically want pixel-perfect control over the composer, message bubbles, scroll behavior, and inline component slots — that's exactly what its `Thread`, `Composer`, `Message` primitives give you. CopilotKit/AG-UI is excellent but oriented toward embedded copilots inside enterprise apps; you don't need its enterprise/protocol overhead.

**Showing the thinking.** Two complementary UI affordances:
- **Reasoning summary**: with Claude Sonnet 4.6's adaptive thinking, `result.reasoningText` streams by default via `useChat` (controllable with `sendReasoning`). Render it in a collapsed `<details>`-style accordion above the answer, slow-typing with a typewriter effect — this is the "AI craft visible" beat that maps to your portfolio narrative.
- **Tool-call timeline**: render the tool-call lifecycle (`input-streaming` → `output-available`) as a small badge row ("🔍 Searching projects… → 📋 Found 3 case studies → 🎨 Rendering…"). AI Elements (Vercel's official `components/ai-elements/` library on top of shadcn) ships `Reasoning` and `Tool` components designed for exactly this.

**Alternatives evaluated.** CopilotKit + AG-UI is the strongest competitor if you wanted cross-framework portability, but its value (multi-runtime, self-hosting, AG-UI protocol) is overkill for a personal site. Mastra is a good agent framework but you don't need agent orchestration — you need one streaming turn with tools. Hashbrown/Thesys/Crayon are interesting but immature. **Stick with Vercel AI SDK because you already know it and the rest of the ecosystem (AI Gateway, AI Elements, assistant-ui adapter) is the most mature.**

### 3. Voice input architecture

**Recommendation: Whisper (via Groq, gpt-4o-mini-transcribe, or OpenAI's gpt-realtime-whisper streaming variant) → text → Claude pipeline. Skip Realtime API. Skip browser Web Speech API for production.**

The decisive argument: **your output is not speech, it's a rendered UI with React components.** The OpenAI Realtime API is purpose-built for speech-in/speech-out latency optimization (Eesel and Mindstudio's writeups make this explicit), and locks you into OpenAI's models for the LLM step. That kills your ability to use Claude Sonnet 4.6 — your best model for both thinking display and design taste. There's no UX win to compensate.

**Concrete pricing math (April–May 2026, verified):**
- **Whisper on Groq** (whisper-large-v3-turbo): $0.04/hour ($0.000667/min). Per Groq's own launch blog the throughput is "216× real-time" (i.e., 1 hour of audio transcribes in roughly 16.7 seconds; CloudZero's April 2026 measurements corroborate at 228×). At 500 visitors × 50% voice × 15s avg = ~62 minutes/month = **~$0.04/month**.
- **OpenAI gpt-realtime-whisper** (newly released streaming model, May 7, 2026): $0.017/min per OpenAI's launch (confirmed by 9to5Mac and MarkTechPost) = ~$1.05/month at the same usage.
- **OpenAI gpt-4o-mini-transcribe**: ~$0.003/min = ~$0.19/month.
- **OpenAI Realtime API (gpt-realtime-2, May 7, 2026)**: $32/1M audio input + $64/1M audio output tokens — roughly $1.15/$4.61 per hour of conversation per Handy AI's Model Drop newsletter. Materially more expensive than Whisper→text, with no upside for "voice in, rich UI out."

**Recommended implementation.** Use the browser's MediaRecorder API to capture audio, POST to a `/api/transcribe` Edge route, call **Groq's Whisper-large-v3-turbo** (9× cheaper than OpenAI Whisper, comparable accuracy), then pipe the resulting text into the same chat pipeline as keyboard input. This keeps the Spanish/English duality clean (Whisper handles both natively, no language toggle needed) and is fully provider-agnostic — you can swap Groq for OpenAI Whisper if Groq has a regional outage.

**Web Speech API caveat.** It's free and works in Chrome/Edge, but Safari's implementation is poor and inconsistent, and on Argentine Spanish accents I've seen anecdotal WER doubling vs. Whisper. For a *portfolio*, where the voice demo itself is a craft signal, the $0.04/month cost is irrelevant; ship Whisper.

### 4. LLM provider choice

**Recommendation: Claude Sonnet 4.6 as primary, with Vercel AI Gateway configured for fallback to GPT-5.4 if Anthropic is down. Save Opus 4.7 for build-time content polish, not runtime.**

The decision rests on four criteria — visible thinking, tool-call/structured-output reliability, first-token latency, and your existing skill base.

- **Visible thinking**: Claude's adaptive thinking is the cleanest API for "show the model's reasoning live." Anthropic returns summarized thinking tokens that Vercel AI SDK exposes as `result.reasoningText`. GPT-5/o-series returns *summaries only and only when `reasoningSummary: 'auto'` is set* — and on `claude-opus-4-7` the default `display` is `omitted` (you must set `display: 'summarized'` or you'll get a long pause before output begins). Sonnet 4.6's default behavior is the sweet spot: visible reasoning without API gymnastics.
- **Tool calling for generative UI**: All three flagship families (Sonnet 4.6, GPT-5.4, Gemini 3.1) reliably handle structured tool calls with Zod schemas via Vercel AI SDK v5. Anthropic's own customer quotes for Sonnet 4.6 highlight "perfect design taste when building frontend pages and data reports" and "meaningfully better instruction-following and tool reliability than its predecessor."
- **First-token latency on Anthropic's endpoint** (Artificial Analysis): 1.24s TTFT, 45.3 tok/s. Google Vertex hosting of the same model is faster (1.01s TTFT). Latency-class probes from Digital Applied put Sonnet 4.6 standard at 0.85s P50 — acceptable for chat hero UX, though P95 of 1.6–2.4s means you must design for "thinking" UI affordances anyway.
- **Your skill base**: you've shipped with both Vercel AI SDK and the Anthropic Agent SDK. The Vercel AI SDK has first-class Anthropic provider support (`@ai-sdk/anthropic`), exposes `providerOptions.anthropic.thinking`, and routes through the AI Gateway with automatic fallback. The Anthropic Agent SDK is excellent for autonomous coding agents but is mismatched to a one-turn streaming RAG chat — its tool loop is more than you need. **Use Vercel AI SDK + `@ai-sdk/anthropic` directly, not Agent SDK.**

**When to escalate to Opus 4.7.** Don't, in the runtime path. Opus 4.7 is the strongest coding/SWE-bench model in the lineup — The Next Web (April 16, 2026) reports it "leads SWE-bench Pro at 64.3% — ahead of GPT-5.4 (57.7%) and Gemini 3.1 Pro (54.2%)," a 10.9-point jump from Opus 4.6's 53.4% (confirmed by Lushbinary and NerdLevelTech). Use it offline to draft case study copy and grade your prompts — but its TTFT is too slow for a chat hero, and at $5/$25 per M tokens it's ~5× the cost of Sonnet 4.6 for marginal user-facing benefit.

**Don't bother with Gemini 3.1 Pro for this use case** despite its lowest-cost positioning. Anthropic and OpenAI have the more mature React/typed-tool-call ecosystems via Vercel AI SDK and the design-taste edge matters more than 20% cost savings on ~$5/month of LLM spend.

### 5. Frontend framework & deployment

**Recommendation: Next.js 15 App Router on Vercel, with the streaming chat endpoint on Node runtime (not Edge), at the `iad1` region.**

**Framework**: Next.js 15 wins not because RSC is the killer feature (you're not using `streamUI`), but because (a) you already know it, (b) Vercel AI SDK and AI Elements are first-class on App Router with no friction, (c) `app/(chat)/route.ts` is the simplest streaming endpoint you can write, and (d) MDX-driven case study pages benefit from RSC's static rendering for SEO/share-link previews while the chat island stays fully client-driven via `useChat`. SvelteKit is excellent but cuts you off from AI Elements and assistant-ui; Remix is fine but lags AI SDK template support; Astro with islands is the closest contender but the streaming-chat pattern is less well-trodden there.

**Edge vs Node**: Run the streaming endpoint on **Node**, not Edge. The trade-off in May 2026 is well-documented: Vercel's Edge runtime has timeout/bundle limits, has run into compatibility issues with newer AI SDK features and `@anthropic-ai/sdk` heavy types, and the streaming TTFT difference at one-hop-from-Anthropic is sub-100ms — invisible inside the much larger LLM latency. The Mmntm "Vercel AI SDK guide" specifically flags memory leak reports in Node streaming and recommends Edge for streaming endpoints — but the AI SDK has shipped fixes since, and Node gives you `node:` APIs (Sharp for image processing, Supabase Node client) that Edge doesn't. Be pragmatic: ship Node, instrument with OpenTelemetry, switch to Edge only if you measure a real TTFT win.

**Deployment**: Vercel. The Cloudflare cost-advantage case is real for high-traffic SaaS — Digital Koncept and Oli Miah's writeups document 50% savings at scale and unlimited bandwidth on Cloudflare Workers Paid — but at 500 visitors/month you're inside Vercel's Hobby tier (or Pro at $20/month if you want commercial use, custom domains with analytics, and Speed Insights). The Cloudflare OpenNext adapter still has rough edges for App Router (the nickb.dev guide is candid about migration speed bumps), and Vercel AI Gateway's per-model routing + observability is included free with your Hobby/Pro plan. **Stay on Vercel; revisit only if you hit Pro overage charges**, which at this traffic you won't.

**Critical Vercel gotcha**: Hobby plan is **non-commercial only**. If you're using the portfolio to acquire clients, you need Pro ($20/month). Don't violate ToS on the most visible thing in your professional brand.

### 6. Prior art (verified examples)

| Site / Repo | Stack | Retrieval | Notes |
|---|---|---|---|
| **toukoum.fr** (Raphael Giraud, ~274★) | Next.js + TypeScript + OpenAI | Structured / no vector DB | "World's first AI portfolio" claim; spawned Fastfolio (4,000+ devs claimed). README: *"Static portfolios are dead. … a conversation tailored to your curiosity."* |
| **nikolailehbrink/portfolio** | Next.js + Vercel AI SDK + LlamaIndex.TS + OpenAI | LlamaIndex vector | Closest match to your spec; MDX-backed content. |
| **medevs/smart-portfolio** | Next.js 15 + LangChain + OpenAI + **Supabase pgvector** | Vector | One of the few that uses pgvector; useful reference if you ever need to add semantic fallback. |
| **scienmanas/Portfolio** | Next.js + Framer + AWS Lambda + RAG | Vector | AWS Lambda backend; less relevant for Vercel-native pattern. |
| **Lovely Mcinerney (lovelywisdom.com)** | GitHub Pages static + **Llama 3.3 on Cloudflare Workers AI** | Content-matching threshold | Aggressive cost engineering: "*capped conversations at 4 exchanges to limit how much anyone can push the system.*" |
| **Kehinde Onifade (kennyonifade.com)** | Next.js 14 App Router + OpenAI/Gemini/HF | TypeScript template literal | Pure system-prompt grounding; no DB. |
| **Hitanshu Khandelwal (hitanshukhandelwal.com)** | Next.js + OpenAI Agents SDK (gpt-4o-mini) | System prompt | Demonstrates Agents SDK is viable but minimal value-add over Chat Completions for this use case. |
| **Donji (product designer)** | Streamlit + LangChain + vector DB + OpenAI | Vector | Python stack; one of the earliest published examples (~2023) and a useful contrast point. |
| **ChatProfolio (Chia Zhe)** | Next.js + Prisma + Postgres + OpenAI | Structured | Multi-tenant productization; same pattern, different scale. |

**What doesn't exist (yet)**: a documented personal portfolio using **OpenAI Realtime API or Deepgram for voice-in / rich-UI-out**. This is a real gap as of May 2026, and shipping it would be a credible differentiation beat. Reference Anthropic's `claude-agent-sdk-demos` (the resume-generation demo uses WebSocket streaming) and OpenAI Agents SDK Realtime voice docs as your starting point.

**Brittany Chiang notably has NOT shipped an AI-chat portfolio.** Her current site (brittanychiang.com) is the traditional scrolling design that launched the entire genre of clones. Her recent essay "Welcome to the AI Parade" (Feb 2026, Medium) is ambivalent about AI in her own craft. This is your opening: nobody at her visibility has shipped this yet.

### 7. Full recommended architecture

**The full stack, opinionated:**

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **Next.js 15 App Router** | Your skill set; AI SDK/AI Elements/assistant-ui first-class. |
| Chat UI primitives | **assistant-ui** + AI Elements (`Reasoning`, `Tool`) on shadcn | Designer-grade control + Vercel-blessed components for reasoning/tool display. |
| AI orchestration | **Vercel AI SDK v5** (`streamText` + tool calls, `useChat` on client) | Not `streamUI`. Not Agent SDK. |
| Primary LLM | **Claude Sonnet 4.6** via `@ai-sdk/anthropic`, adaptive thinking on | Best design taste, clean reasoning API, fast enough, your existing skill. |
| Model fallback | **GPT-5.4 / 5.2 mini** via Vercel AI Gateway | One-line failover. |
| Content / RAG | **Supabase Postgres**, typed rows, `tsvector` + GIN FTS index | No vector DB until you measure a need. |
| Authoring | **Markdown/MDX in repo** *or* Notion → nightly cron → Supabase | Pick by writing-UX preference; both work. |
| Voice input | **Groq Whisper-large-v3-turbo** → text → main pipeline | $0.04/hr, 9× cheaper than OpenAI Whisper, comparable WER. |
| Deployment | **Vercel Pro ($20/mo)** | Hobby = non-commercial; you need Pro. |
| Runtime | **Node** (not Edge) | More compatible with AI SDK + Supabase + image libs. |
| Observability | Vercel AI Gateway + OpenTelemetry | Built into AI SDK; tracks per-message tool/reasoning/cost. |
| i18n (ES/EN) | Server-side `Accept-Language` detection → system prompt locale instruction | Cheaper than a full i18n framework; Claude handles bilingual naturally. |

**Estimated monthly cost at 500 visitors, ~250 chat sessions, ~3 turns each = ~750 LLM calls:**

| Item | Cost |
|---|---|
| Vercel Pro | $20.00 |
| Supabase Free tier (500MB DB, 5GB bandwidth) | $0.00 |
| Claude Sonnet 4.6 (~1.5M input tokens cached, ~250k output) | ~$5.50 |
| Groq Whisper for voice (~62 min) | ~$0.04 |
| Domain (optional) | ~$1.00 |
| **Total** | **~$26.50/month** |

That assumes ~2k input tokens per turn (system prompt + project index + history) with 90% prompt-cache hits via Anthropic prompt caching, and ~300 output tokens per turn. The dominant cost is Vercel Pro, not LLM tokens. If you self-host on a $5 Hetzner VPS with Coolify (per MakerKit's hosting guide), you can compress this to ~$10/month at the cost of significantly more ops work.

**Build time estimate** (you, senior product designer transitioning to design engineering, already know Vercel AI SDK + Next.js + Supabase):

| Phase | Hours |
|---|---|
| Schema design + Supabase setup + case study content for 20 projects | 12–18 |
| Chat endpoint (`streamText` + 4–5 tools) + system prompt + prompt evals | 8–10 |
| `useChat` client + assistant-ui integration + reasoning/tool affordances | 6–8 |
| Generative-UI components (ProjectCard, Gallery, MetricCallout, TechBadges, etc.) | 10–14 |
| Voice input (MediaRecorder + Groq endpoint) | 3–4 |
| i18n + Spanish prompt variants | 2–3 |
| Polish, accessibility, Vercel deploy, analytics | 4–6 |
| **Total** | **~45–60 hours** |

That's 3–5 focused weekends. The Toukoum repo and nikolailehbrink/portfolio are both worth cloning locally as references on day one — not to copy, but to validate that your tool-call → component pattern aligns with what's working in production for others.

---

## Recommendations

**Build sequence (decision-ready, in order):**

1. **Week 1 — Spike the riskiest part first.** Build a single-endpoint Next.js 15 app with `streamText` + one tool (`showProjectCard`) + Claude Sonnet 4.6 + reasoning streaming visible. Render the tool's output as a hand-built `<ProjectCard>` from hardcoded data. Validate that the streaming, re-hydration on follow-ups, and reasoning summary all feel right *before* you touch the database. Threshold to advance: re-asking about the same project in turn 3 renders the card identically and the reasoning summary feels like craft, not noise.

2. **Week 2 — Build the content pipeline.** Decide Markdown-in-repo vs Notion-via-sync based on a 30-min test of writing one case study in each. Stand up the Supabase schema (`projects` table with: slug, title, role, year, client, tech_stack[], metrics jsonb, summary, body, og_image, tsvector). Seed 5 of your real cases. Add `search_projects` and `get_project_detail` tools.

3. **Week 3 — Build the component set.** Design 4–6 reusable components (`ProjectCard`, `ProjectGallery`, `MetricCallout`, `TechStackBadges`, `Followups`, `Timeline`). Each is a typed React component whose props match a tool output schema. This is where your designer craft shows.

4. **Week 4 — Add voice + Spanish.** MediaRecorder → Groq Whisper → text pipeline. Spanish: add a system-prompt branch based on `Accept-Language` and the first user message. Test on Argentine accents specifically.

5. **Week 5 — Polish, deploy, ship.** Vercel Pro, custom domain, AI Gateway observability, Speed Insights, error boundaries on tool calls, fallback model.

**Benchmarks that would change the plan:**

- **If you measure recall misses on paraphrased queries** (e.g., visitor asks about a topic the case-study text doesn't mention by name), add pgvector + a `match_projects_semantic` tool as a *third* retrieval tool. Don't replace FTS — augment it.
- **If TTFT exceeds 2.5s consistently**, switch the primary model to Claude Haiku 4.5 (sub-700ms TTFT per Kunal Ganglani's 2026 benchmarks) for the first response, then escalate to Sonnet 4.6 on follow-ups. Or move to Google's Vertex hosting of Sonnet 4.6 (1.01s TTFT vs Anthropic's 1.24s).
- **If monthly LLM cost crosses $30**, audit prompt caching hit rates (Anthropic charges separately for cache writes); you likely have a stale prompt-cache breakpoint.
- **If voice usage is <5% of sessions after a month**, kill the feature. Don't sentimentally maintain UX that nobody uses.
- **If you find yourself wanting `streamUI`'s ergonomics back**, you've over-componentized. The right pattern is tool calls returning props, not the model "rendering" UI.

**What to push back on if asked:**

- **Don't use OpenAI Realtime API** for one-shot voice → rich UI. It's the wrong architecture and locks you out of Claude.
- **Don't add a vector DB on day one.** It's the most common premature-optimization for portfolios.
- **Don't try to use `streamUI` "while it still works"** — Vercel's pause notice is honest, and re-hydration is exactly your follow-up-message scenario.
- **Don't host on Cloudflare** purely on cost grounds at this scale; revisit if/when you have meaningful traffic.

---

## Caveats

1. **Model release cadence is fast.** Sonnet 4.8 is expected (per Polymarket/NxCode prediction-market data) in May 2026; Opus 4.8 mid-summer. Your Vercel AI SDK + AI Gateway routing layer protects you (model swap is a string change), but plan to re-evaluate the primary model every quarter. The architecture survives; the model name doesn't.
2. **Claude Opus 4.7's default `display: 'omitted'` for thinking is a footgun** if you ever escalate runtime traffic to it — you'll get a long silent pause. Set `display: 'summarized'` explicitly. Sonnet 4.6 doesn't have this issue.
3. **AI SDK RSC is "paused", not killed.** Vercel hinted at resuming once re-hydration is solved upstream. If you're reading this in 2027 and they've shipped fixes, re-evaluate — RSC genuinely is more elegant when it works.
4. **The 500-visitors/month cost figure is extrapolated from named per-token sources** (Gazania, CloudZero, Boei, Elfsight 2026 chatbot-cost writeups), not from a published portfolio-operator's actual bill. No portfolio operator I could find has published a real $/month figure at this exact scale. Your real costs will depend heavily on prompt size and cache hit rate; budget 2× the estimate for the first month while you tune.
5. **The "world's first AI portfolio" claim by toukoum.fr is self-asserted**; Donji's vector-DB chatbot portfolio predates it by ~18 months, and Streamlit-based examples like Lucy by Rishi exist. This is a pattern with multi-year prior art, not a 2026 invention. That's good news for you — the playbook is settled.
6. **Web Speech API on Safari for Spanish input is unreliable** — anecdotal, but a meaningful concern given your Argentine context and the fact that recruiters on iPhones are a primary visitor segment. Groq Whisper sidesteps this entirely.
7. **The Vercel Hobby plan's non-commercial restriction is enforced**. If your portfolio is even a soft sales tool, you need Pro. Several writeups (Oli Miah on Cloudflare, MakerKit) flag this as a common surprise.
8. **You will be tempted to over-build the agent layer.** Claude Sonnet 4.6 with 4–5 well-typed tools and a 1.5–3k-token system prompt outperforms 90% of "agentic" architectures for this use case. Resist the urge to add LangGraph, multi-agent orchestration, or MCP servers until you observe a specific failure mode that requires them.
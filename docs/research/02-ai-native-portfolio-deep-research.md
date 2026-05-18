# Best Stack for an AI-Native UX Portfolio

## Bottom line

If you want the best stack for **this exact product**, not the easiest demo, build it as a **retrieval-first AI portfolio** on **Next.js App Router** with **Vercel AI SDK 6** and **AI Gateway** for model orchestration and streaming, **AI Elements** plus **shadcn/ui** for the hero and chat UX, **Supabase Postgres** with **pgvector** and Postgres full-text search for retrieval, **Supabase Storage** for assets, **Firecrawl** for job-post URL and document extraction, and **OpenAI speech-to-text** for voice input. Keep your case studies as canonical **MDX** pages, then index structured excerpts and asset metadata into Postgres so the model writes from your evidence while users still land on normal, shareable case-study routes. citeturn21view0turn33view0turn20view12turn24view4turn19view10turn19view13turn20view0turn20view2turn20view4

The biggest mistake would be to make the homepage a **free-form chatbot first**. Your hero should act like a **briefing and matching engine**: the visitor types, pastes a job URL, uploads a job post, or speaks; the system turns that into a structured brief; retrieval finds the strongest evidence from your portfolio; the UI renders a polished recommendation plus project cards; only then does it open into a scoped follow-up chat. That flow maps directly onto AI SDK features like tool calling, multi-step execution, structured outputs, and generative UI, while Next.js App Router, Server Components, Route Handlers, and MDX give you the right split between dynamic AI behavior and conventional content pages. citeturn26view2turn33view2turn26view1turn24view2turn24view3turn24view4

If you want the blunt recommendation: **do not** let the model talk directly to your database, **do not** store your portfolio only as embeddings, and **do not** expose raw chain-of-thought as the “thinking process.” Use **typed tools**, **canonical case-study pages**, and a **designed reasoning layer** made of model reasoning summaries, retrieval traces, and project evidence. That is what will feel premium instead of gimmicky. The tooling already supports this pattern. citeturn21view1turn21view4turn25view0turn32view3turn32view0

## Product architecture

The clean architecture is a **two-surface system**. Surface one is the landing-page matcher. Surface two is the scoped case-study assistant.

A strong end-to-end flow looks like this:

1. The hero accepts **text, file, URL, or voice**.
2. A first model step converts that input into a structured `job_brief` object with fields like role title, seniority, product domain, core problems, collaboration needs, and desired outcomes.
3. Retrieval runs over your portfolio evidence store using **hybrid search**.
4. A reranker selects the most relevant project sections.
5. A final generation step returns a structured response such as `fit_summary`, `recommended_projects[]`, `follow_up_questions[]`, and `reasoning_summary`.
6. The UI renders rich project cards and visual previews from tool results.
7. Clicking a card opens the normal case-study route, where a second chat is restricted to that project alone. citeturn26view1turn19view10turn21view5turn21view1turn21view4

That first-turn parser should use **structured output**, not free text. OpenAI’s Structured Outputs guarantee adherence to your JSON Schema, and AI SDK supports structured generation with validation through `Output.object()`. If you combine tool calling with structured output inside AI SDK, note that the structured output generation counts as an extra step in the execution flow, which matters for your stopping conditions. citeturn20view6turn26view1turn26view0

For the visual transition from hero to case study, keep the homepage answer as a **generated recommendation layer**, not the canonical content layer. The cards should link into standard Next.js routes via `<Link>`, which gives you prefetching and client-side navigation. If you want a more cinematic transition, Next.js Intercepting Routes can load a case-study preview in the current layout while preserving a shareable URL. citeturn28view1turn24view1turn28view0

A practical route layout would look like this:

```text
app/
  page.tsx
  case-studies/[slug]/page.tsx
  api/chat/route.ts
  api/match/route.ts
  api/ingest-job/route.ts
  api/transcribe/route.ts

content/
  case-studies/*.mdx

lib/
  ai/
    models.ts
    prompts.ts
    tools.ts
    retrieval.ts
  db/
    schema.ts
    queries.ts
```

Use **Server Components** for the case-study pages and data-heavy shells, and **Client Components** only for the hero input, live chat, voice capture, and local UI state. That keeps the interaction responsive without shipping too much JavaScript. citeturn24view2

## Content and retrieval

Your **source of truth** should be your case studies in **MDX**, not a CMS-first or vector-first setup. MDX lets you write JSX directly inside markdown, embed React components in content, and works with Server Components in the App Router. That is perfect for a designer portfolio because your case studies are not plain articles; they contain galleries, process components, outcome callouts, and visual modules. citeturn26view3turn24view4

Then index that content into Postgres in a more structured way. For your use case, I would model four layers of information: `projects` for top-level metadata, `project_chunks` for retrievable evidence, `experience_claims` for concise supported claims the model can safely reuse, and `assets` for images or visual references tied to projects. This matters because the generated answer should not be built from a single giant markdown blob; it should be assembled from typed evidence that already knows which project it belongs to, which section it came from, and which visuals represent it.

For retrieval, use **Postgres hybrid search**: semantic search with **pgvector** plus keyword search with `tsvector`. Supabase’s own hybrid-search guide combines those two methods directly in Postgres. PostgreSQL full-text search also normalizes related words to the same lexeme, which helps with queries like “onboarding” vs. “onboarded” or “research” vs. “researching.” For a portfolio-sized corpus, this is more than enough. You do **not** need a separate vector database on day one. citeturn19view10turn19view11turn23view2

On indexing strategy, keep it simple. **pgvector uses exact nearest-neighbor search by default**, which gives perfect recall. HNSW and IVFFlat are available if you later want approximate search for speed; HNSW generally offers a better speed-recall tradeoff than IVFFlat but costs more memory and slower builds. Since your corpus is likely small, start exact, measure, and only add HNSW if you actually feel latency pressure. citeturn23view0turn23view1

After hybrid retrieval, rerank the top candidates before passing them to the generator. AI SDK now has a native `rerank` function, and Vercel’s AI SDK 6 docs explicitly frame reranking as a way to pass only the most relevant context to the model. In this product, search quality matters more than raw model power, because the answer must be materially grounded in your portfolio rather than sounding generally smart. citeturn21view5turn33view1

For asset storage, **Supabase Storage** is the best default because it already sits next to your Postgres data model, supports fine-grained access controls, and works with Postgres Row Level Security. Public buckets are CDN-friendly for portfolio screenshots and banners; private buckets are better for uploaded job posts if you choose to keep them temporarily. If your asset volume gets large, especially with heavy video or lots of global download traffic, **Cloudflare R2** becomes attractive because it is S3-compatible and has no egress fees. citeturn19view13turn23view4turn23view3turn29view1turn29view2

## Input, voice, and generative UI

Your desired hero is already close to what **AI Elements** is designed for. The library includes a **Prompt Input** component with file-attachment support, an **Attachments** component for rendering uploaded files, a **Speech Input** component for voice capture, and a **Reasoning** component for collapsible reasoning display during streaming. That means you do not need to design this interaction pattern from scratch unless you want to. citeturn25view3turn25view2turn25view1turn25view0

For uploads, the browser gives you the right primitives: the File API supports selection via `<input type="file">` or drag and drop, and the HTML Drag and Drop API supports file drop zones. The AI SDK `useChat` hook can already send file attachments with a message, but it only auto-converts `image/*` and `text/*` into multimodal parts. That is an important limitation: **PDFs and DOCX files need a manual parse path**, not just direct handoff from the hero. citeturn27view2turn27view3turn21view2

For URL and document ingestion, **Firecrawl** is a strong fit. Its API supports scraping a webpage into markdown or JSON, crawling whole sites, and parsing local or non-public documents like PDF, DOCX, XLSX, HTML, and more into clean, LLM-ready output while preserving reading order and tables. That is exactly what you need when a recruiter pastes a job URL or uploads a job description file. citeturn20view0turn20view2

For voice, do not rely on the browser’s Web Speech API alone. MDN marks `SpeechRecognition` as limited availability, while `MediaRecorder` is broadly available. AI Elements’ Speech Input component reflects that reality: it uses the Web Speech API in supported browsers and falls back to `MediaRecorder` plus an external transcription service in Firefox and Safari. Pair that fallback with OpenAI speech-to-text for request-based transcription, and use OpenAI realtime transcription only if you want a live transcript while the user is still speaking. citeturn27view0turn27view1turn25view1turn20view4turn20view5

For the generated answer, use **tools and typed UI parts**, not raw HTML from the model. AI SDK tool calling can drive generative UI, and AI SDK’s custom streaming data lets you send status updates, references, and other structured information alongside the text stream. That is how you should show “Matched against B2B onboarding work,” “Pulled strongest evidence from Project X,” and then render project cards with images and links. It will feel authored and premium instead of brittle. citeturn21view1turn21view4

## Model strategy and AI thinking

If I were choosing one default model for this product today, I would start with **Claude Sonnet 4.6**. Anthropic describes Sonnet 4.6 as the **best combination of speed and intelligence**, with a 1M-token context window, adaptive thinking support, and fast latency. That is a strong default when you need reasoning, polished text, and tool use without making the homepage feel slow. citeturn31view0turn21view6

If you want the highest-quality matching pass possible and cost is secondary, use **Claude Opus 4.7** for offline evaluation, premium deep dives, or “analyze my fit for this role” flows. Anthropic’s models overview calls Opus 4.7 its most capable generally available model for complex reasoning and agentic coding. I would not make it the default hero model because it is slower and more expensive than Sonnet, but it is a valid second-stage model if you decide to build an explicit “deep analysis” mode. citeturn31view1

If a visible “thinking process” is a hard product requirement, OpenAI reasoning models are attractive because AI Gateway supports **reasoning summaries** for them. Vercel documents that you can stream those summaries with `reasoningSummary`, while AI Gateway also normalizes reasoning output across providers. That means you can A/B test Claude vs. OpenAI without rewriting your UI plumbing. citeturn32view3turn32view0

That said, I would still **not** expose raw internal chain-of-thought as a novelty feature. The premium version of “thinking” here is a designed layer made of three things: a concise reasoning summary, a retrieval trace, and explicit evidence cards. AI Elements’ Reasoning component is useful for rendering model reasoning blocks, but your product should privilege **evidence-backed fit explanation** over theatrical thought dumps. citeturn25view0turn21view3turn21view4

One more caution if you are tempted to use Anthropic’s native agent stack directly: with Claude tool use and extended thinking, thinking blocks must be preserved and passed back unchanged across tool turns in multi-turn loops. That is workable, but it is another reason I would keep v1 orchestration on **Vercel AI SDK** unless you specifically need Anthropic-only features later. AI SDK 6 already gives you reusable agents, structured tool output, and provider flexibility. citeturn32view2turn33view0turn33view2

## Deployment, privacy, and operations

Run the app and its API routes on **Vercel**. Next.js Route Handlers are the natural place for `/api/match`, `/api/chat`, `/api/ingest-job`, and `/api/transcribe`, while AI Gateway gives you one endpoint for multiple providers plus budgets, usage monitoring, load balancing, and fallbacks. This is a better production posture than wiring a single provider directly into every route. citeturn24view3turn20view12

Because this is a **public AI endpoint**, assume it will be abused. Protect the AI routes with **Vercel rate limiting** and **BotID**. Vercel’s docs explicitly position the Rate Limiting SDK for backend request limits and BotID for blocking automated bots while letting real users through. An AI-native portfolio that goes even mildly viral will get scraped and hammered. If you do not harden the endpoints, your “portfolio” turns into a free inference proxy. citeturn20view13turn20view14

Also assume that some uploaded or pasted job posts contain sensitive information. AI Gateway now supports **Zero Data Retention** and provider-level controls to disallow prompt training, and Vercel says it can route only to providers with negotiated ZDR agreements. That matters here more than in a toy chatbot, because recruiters and hiring managers may paste proprietary descriptions or internal briefs. citeturn35view0

For image rendering, use `next/image` and Vercel image optimization against your remote asset host. Vercel’s image pipeline caches optimized variants close to users, and Next’s image component is the standard way to keep visual case studies fast without manual responsive-image plumbing. This matters for a designer portfolio more than for most software products. citeturn29view3turn12search2

If later you want a quick proof-of-concept instead of the full architecture, OpenAI’s hosted **file search** can search uploaded files through semantic and keyword search without you implementing execution code yourself. It is a valid prototype path, but I would not keep it as the final architecture for your portfolio because it gives you less control over metadata, project-card rendering, route-aware navigation, and evidence design than a custom Postgres-backed retrieval layer. citeturn30view0turn21view1

## Build sequence

Build this in the following order.

1. **Author the content layer first.** Write your best case studies in MDX, add structured frontmatter or JSON metadata, and attach high-quality assets with proper alt text and role tags. If the content is weak, the AI layer will just automate weakness. MDX is the right base because it supports JSX and Server Components for richer case-study layouts. citeturn26view3turn24view4

2. **Create the evidence store second.** Write an indexing script that reads the MDX, slices it into coherent sections, stores embeddings and `tsvector` search fields, and produces claim objects such as “led discovery,” “improved onboarding,” or “designed AI-assisted flows,” each tied to a real project and section. Use hybrid retrieval in Postgres and add reranking only after you have baseline results. citeturn19view10turn19view11turn21view5turn23view0

3. **Build the hero as a brief parser, not a chat terminal.** Use Prompt Input, file attachments, URL ingestion, and voice capture to collect input; normalize everything into a `job_brief`; then show an answer built from structured fields and project cards. The first interaction should feel like “understanding your need,” not “starting a generic conversation.” citeturn25view3turn20view0turn20view2turn20view4turn20view5

4. **Render cards and visual modules from tool results.** Let the model choose project IDs and supporting evidence, but let your React components decide how a project card, gallery strip, KPI badge, or case-study CTA looks. AI SDK tool calling and generative UI are the core mechanism for this. citeturn21view1turn21view4

5. **Add scoped follow-up chat inside each case study.** Once the user lands on `/case-studies/[slug]`, restrict retrieval to that project’s chunks and assets only. That prevents the chat from drifting across unrelated work and makes the answers feel much more trustworthy. Navigation via `<Link>` and optionally Intercepting Routes will keep that transition fast and polished. citeturn28view1turn28view0

6. **Only then add the visible reasoning layer.** Start with a concise reasoning summary and a retrieval trace such as “Matched on B2B onboarding,” “Selected projects with discovery, experimentation, and AI workflow experience,” and “Evidence pulled from three case studies.” If you later decide to stream model reasoning, AI Gateway and AI Elements already support it. citeturn32view3turn32view0turn25view0

7. **Before launch, harden for abuse and privacy.** Add rate limiting, BotID, and data-retention settings; then test the system on a real evaluation set of job descriptions and prompts. A good acceptance bar is simple: the top projects should be defensible, the answer should never invent experience you do not have, and every strong claim should be traceable back to a project and section. citeturn20view13turn20view14turn35view0

The strongest version of this portfolio is not “a chatbot on top of my work.” It is **an AI-guided matchmaker over a rigorously structured body of evidence**. If you build it that way, it will feel less like a gimmick and more like a productized demonstration of your UX thinking, your systems thinking, and your ability to design trustworthy AI interactions.
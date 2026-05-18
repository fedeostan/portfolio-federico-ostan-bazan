# AI-Powered UX Portfolio Stack for Federico Ostan

## Overview

This report proposes a practical, modern stack for an AI-driven UX portfolio where visitors interact through a conversational hero input and receive dynamic, project-grounded case study narratives powered by retrieval-augmented generation (RAG). The focus is on leveraging tools you already know (Vercel, Vercel AI SDK, Anthropic) plus a simple vector store (Supabase pgvector) to keep the system maintainable and fast to ship.

## High-Level Architecture

At a high level, the portfolio can be implemented as a Next.js app deployed on Vercel, using the Vercel AI SDK for streaming chat, Anthropic (via Edge-compatible SDK) as the primary LLM, and Supabase Postgres + pgvector as the database and vector store for project knowledge. The RAG layer retrieves your project content from Supabase and injects it into the LLM prompt so answers remain grounded in your work.[^1][^2][^3][^4]

Your hero section becomes a chat-like input that accepts text, URLs (job posts), and later voice, and then displays a generated, tailored narrative describing how you can help that specific visitor, with inline references to relevant projects. Navigation to full case studies is just normal Next.js routing, with optional follow-up Q&A on each case page using the same underlying RAG API.

## Recommended Core Stack

### Frontend and Hosting

- **Framework**: Next.js (App Router) on Vercel.
- **UI**: React components + Tailwind or your preferred design system.
- **Hosting**: Vercel, using Edge Runtime where possible for low latency.

Vercel provides first-class support for Next.js and tight integration with the AI SDK, including streaming chat and model routing.[^5][^6][^7][^1]

### AI Orchestration

- **AI client**: Vercel AI SDK (`ai`, `@ai-sdk/react`).
- **Chat hooks**: `useChat` or `useCompletion` on the client to power the hero input and case-study chat.[^6][^1]
- **Streaming**: Use `streamText` / `toUIMessageStreamResponse` in the API route to stream responses token-by-token to the UI.[^7][^6]

The Vercel AI SDK simplifies streaming chat and lets you swap models (Anthropic, OpenAI, etc.) without changing your frontend logic.[^1][^5][^6]

### LLM Provider

- **Primary model**: Anthropic Claude (e.g., Sonnet 3.5/4.x or the latest stable variant through an Edge-compatible SDK).
- **Runtime**: Vercel Edge Runtime using the official Anthropic Vertex SDK or a community provider that integrates Anthropic with the Vercel AI SDK.[^8][^9][^10][^11]

Anthropic provides a Vertex-compatible SDK that supports Vercel Edge Runtime, which avoids typical Node-only limitations and pairs well with the AI SDK.[^9][^10][^8]

### Data and RAG Layer

- **Database**: Supabase Postgres.
- **Vector search**: pgvector extension enabled in Supabase.
- **Storage**: Supabase Storage for project images/screens and media.

Supabase enables pgvector out-of-the-box, so you can store embeddings of project descriptions, case-study sections, and even alt-text for images. Guides for RAG with Supabase and pgvector show patterns for storing vectors, building a `match_documents` function, and running semantic search for RAG pipelines.[^2][^3][^12][^4][^13]

## Data Modeling for Your Projects

### Core Tables

A simple schema in Supabase could include:

- `projects`
  - `id`, `slug`, `title`, `short_summary`, `role`, `company`, `year`.
- `project_sections`
  - `id`, `project_id`, `section_type` (problem, process, outcome, metrics, etc.), `content_markdown`, `order`.
- `project_assets`
  - `id`, `project_id`, `type` (image, video, prototype_link), `url`, `alt_text`.
- `project_chunks`
  - `id`, `project_id`, `section_id`, `chunk_text`, `embedding vector(1536)`, `metadata` (JSON: tags, skills, role, outcomes).

This follows the common pattern used in Supabase RAG tutorials: a documents table (here `project_chunks`) with a `vector` column, optional metadata, and an index for fast similarity search.[^3][^4][^2]

### Embedding Pipeline

- Use an embedding model (OpenAI `text-embedding-3-small`, or an open-source model via Transformers.js if you prefer self-hosting) to generate embeddings for each `chunk_text`.[^4][^2][^3]
- Insert the embedding into `project_chunks.embedding` and maintain metadata for skills, industries, and UX focus (research, IA, interaction, visual design, etc.).[^2][^3]

Existing examples show how to enable pgvector in Supabase, create a table with an `embedding` vector column, and either generate vectors server-side or via a separate ingestion script.[^3][^4][^2]

## RAG Flow for the Hero Chat

### 1. Input Handling

Your hero input accepts:

- Raw text describing the visitor’s role, needs, or product.
- A pasted job description or a URL to a job post.

On submit:

1. If the input looks like a URL, fetch the page content on the server (basic scraping / readability) and normalize it as text.
2. Concatenate the user description + any job text into a single `query_text`.
3. Call the embedding function to convert `query_text` into a vector.

The Supabase examples and tutorials follow a similar pipeline: user question → embedding → semantic search over vectors.[^12][^4][^2][^3]

### 2. Semantic Search Over Projects

Use a Postgres function such as `match_project_chunks(query_embedding, match_count, match_threshold)` that:

- Accepts the query embedding.
- Runs a similarity search (`<=>` operator with cosine distance) over `project_chunks.embedding`.
- Returns the top N relevant chunks plus metadata (project id, section type, score).[^4][^2][^3]

This mirrors the `match_documents` pattern from Supabase RAG guides and provides a reusable endpoint for any RAG queries in your portfolio.[^2][^3][^4]

### 3. Prompt Construction

In your `/api/hero-chat` Edge route:

- Collect the top chunks grouped by project.
- Build a system prompt along the lines of:
  - "You are an AI assistant that speaks as Federico’s portfolio. You only use the provided project data to describe how Federico can help the user. Do not invent projects or experience."
- Inject structured context such as:
  - Project title, role, problem, outcomes, metrics, relevant sections.
  - Links (slugs) to the full case studies and key assets.

Supabase RAG examples show how to concatenate retrieved documents into a `context` string and pass that into the LLM prompt as the basis for the answer.[^12][^3][^2]

### 4. Streaming Answer and Visible "Thinking"

Use `streamText` in the Edge function and `useChat` on the client to stream the narrative.[^6][^7]

To "show the thinking process" without leaking raw prompts or messy logs, you can:

- Structure the assistant’s output into two channels:
  - A compact, user-facing narrative.
  - A separate optional "reasoning" stream: bullet points that explain which projects were selected and why.
- The AI SDK supports streaming messages and can be extended to show interim tool steps (community discussions show patterns for streaming tool sub-steps to the UI).[^14][^6]

You can present the reasoning above the main answer in a subtle timeline or "AI thinking" bar, but ensure that the content is still grounded only in retrieved chunks.

## UI Patterns and Interactions

### Hero Section Flow

1. Visitor lands on the site.
2. Sees a single prominent input (plus optional "paste job URL" affordance and a mic icon for voice in a later iteration).
3. Types their role and need (or pastes a job post) and submits.
4. The page scroll-locks to a chat-like view where:
   - The user’s prompt is shown.
   - The AI’s response streams in: a tailored intro paragraph + a list of 2–4 relevant projects, each with mini-cards containing title, short summary, skills, and a link.
   - Optional "reasoning" section shows a short explanation of why these projects were chosen.

The Vercel AI SDK chatbot template demonstrates how to quickly build a chat-like interface with streaming messages and model selection; you can adapt this for your hero.[^11][^5][^1][^6]

### Dynamic Case Study Pages

For each case study route (`/projects/[slug]`):

- Static content: your curated narrative, sections, images, and artifacts from Supabase.
- Embedded chat: a small "Ask about this project" widget powered by the same RAG API but scoped to that project’s chunks only.

The query for that widget includes the `project_id` so the RAG function only searches within that project, and the assistant prompt emphasizes being a "project explainer" rather than a global portfolio assistant.

### Voice Input (Later Iteration)

- Use the Web Speech API or a client-side speech-to-text service to turn spoken input into text, then feed it into the same hero API.
- Since the backend already accepts text, voice is an orthogonal layer.

## Implementation Stack Summary

| Layer | Recommended Choice | Rationale |
|------|---------------------|-----------|
| Framework | Next.js (App Router) | Native Vercel support, good DX, streaming-friendly.[^1][^5][^6] |
| Hosting | Vercel | Edge runtime, AI templates, fast deploys.[^1][^5] |
| AI orchestration | Vercel AI SDK | Unified interface for multiple LLMs, streaming hooks.[^1][^5][^6][^7] |
| LLM | Anthropic via Vertex / Edge SDK | Strong reasoning, Edge-compatible runtimes.[^8][^9][^10][^11] |
| DB | Supabase Postgres | Simple, managed Postgres with auth and storage.[^2][^3][^4][^13] |
| Vectors | pgvector on Supabase | Native vector search, well-documented RAG flows.[^2][^3][^4][^13] |
| Storage | Supabase Storage | Store UX images and media for projects.[^12] |
| Ingestion | Node/TypeScript script or Supabase Edge Functions | Follows standard Supabase RAG ingestion patterns.[^2][^3][^12] |

## Showing the AI Thinking Process

To reflect your interest in "showing the thinking":

- Define an internal reasoning format in the assistant prompt (e.g., JSON with `"projects_considered"`, `"selected_projects"`, `"match_reasons"`).
- Stream the model output and split it client-side into:
  - A visible reasoning UI (badges with match scores, tags explaining why a project matches a skill or requirement).
  - The main narrative text.

The AI SDK’s streaming mechanisms and ongoing community work on streaming tool sub-steps provide patterns for updating the UI with reasoning-like sub-messages while the main answer is being generated.[^14][^7][^6]

## Development Phases

### Phase 1 – Core MVP (1–2 weeks)

- Implement Next.js app with a simple hero chat using Vercel AI SDK and Anthropic (no RAG yet).
- Hardcode 3–5 projects into the prompt as context to validate UX and tone.
- Build static case study pages with standard navigation.

### Phase 2 – Supabase + RAG

- Set up Supabase, enable pgvector, and define project tables and `project_chunks`.
- Write an ingestion script to chunk your existing case studies and insert embeddings.
- Implement the RAG search function and wire it into the hero chat API.

Tutorials for building RAG chatbots with Supabase pgvector and Next.js provide direct reference code for these steps.[^13][^3][^12][^4][^2]

### Phase 3 – Reasoning UI and Project-Scoped Chat

- Add the "AI thinking" surface for the hero and project pages.
- Implement per-project chat widgets that reuse the RAG API with a project filter.

### Phase 4 – Extras

- Voice input on the hero.
- Analytics on which prompts and projects get the most attention.
- Admin UI for editing project content and re-ingesting chunks.

## Why This Stack Fits You

- It uses tools you already touched: Vercel, Vercel AI SDK, Anthropic, and modern TypeScript/Next.js patterns.[^5][^7][^11][^1][^6]
- Supabase with pgvector is a minimal, battle-tested way to get RAG without standing up extra infra, and there are multiple tutorials targeted exactly at Next.js + RAG setups.[^13][^3][^12][^4][^2]
- The architecture is modular enough to evolve: you can later plug in different models or try local embeddings, but your project DB and UX won’t change.

---

## References

1. [Building an AI Chatbot with Cohere, Next.js, and the Vercel AI SDK](https://vercel.com/kb/guide/cohere-nextjs-vercel-ai-sdk) - Building an AI Chatbot with Cohere, Next.js, and the Vercel AI SDK · Step 1: Install Dependencies · ...

2. [Building a RAG Chatbot with Supabase pgvector and Next.js - Noqta](https://noqta.tn/en/tutorials/building-a-rag-chatbot-with-supabase-pgvector-and-nextjs) - Learn to build an AI chatbot that answers questions using your own data. This tutorial covers vector...

3. [Supabase pgvector Guide — Semantic Search, RAG, and ...](https://dev.to/kanta13jp1/supabase-pgvector-guide-semantic-search-rag-and-recommendations-in-postgresql-2dpc) - pgvector adds vector types to PostgreSQL. Supabase enables it by default — meaning you can build sem...

4. [pgvector: Embeddings and vector similarity | Supabase Docs](https://supabase.com/docs/guides/database/extensions/pgvector) - pgvector: a Postgres extension for storing embeddings and performing vector similarity search.

5. [Next.js AI Chatbot Templates & Starters - Vercel](https://vercel.com/templates/next.js/chatbot) - Chatbot (formerly AI Chatbot) is a free, open-source template built with Next.js and the AI SDK that...

6. [Stream Text with Chat Prompt - Next.js - AI SDK](https://ai-sdk.dev/cookbook/next/stream-text-with-chat-prompt) - Stream the chat completion to the client in real-time. This allows the client to display the new mes...

7. [Real-time AI in Next.js: How to stream responses with the Vercel AI ...](https://blog.logrocket.com/nextjs-vercel-ai-sdk-streaming/) - In this tutorial, you'll learn how to stream AI-generated responses in a Next.js app using the Verce...

8. [nalaso/anthropic-vertex-ai: Vercel AI community package ...](https://github.com/nalaso/anthropic-vertex-ai) - nalaso/anthropic-vertex-ai is a community provider that uses Anthropic models through Vertex AI to p...

9. [How can I make my library compatible with the Vercel Edge ...](https://vercel.com/kb/guide/library-sdk-compatible-with-vercel-edge-runtime-and-functions) - This guide will help make your npm package or SDK compatible with the Edge Runtime, a lightweight su...

10. [anthropic-ai/vertex-sdk](https://www.npmjs.com/package/@anthropic-ai/vertex-sdk) - Vercel Edge Runtime. Jest 28 or greater with the "node" environment ( "jsdom" is not supported at th...

11. [AI SDK Computer Use](https://vercel.com/templates/next.js/ai-sdk-computer-use) - An open-source AI chatbot demonstrating computer use capabilities with Anthropic Claude Sonnet 4.5, ...

12. [Building a RAG with Supabase Vector & OpenAI - Rachit Khurana](https://blog.rachitkhurana.tech/building-a-rag-with-supabase-vector-openai) - In this blog, we'll explore how to build a RAG system for image descriptions using Supabase Vector a...

13. [Build a RAG App With Descope, Supabase & pgvector: Part 1](https://www.descope.com/blog/post/rag-descope-supabase-pgvector-1) - In this two-part series, you'll learn how to combine all these tools to build a secure and intellige...

14. [Streaming tool sub-steps when using NextJS, and useChat #3488](https://github.com/vercel/ai/discussions/3488) - I am basically wanting to stream sub-steps back to the ui while I am executing a tool call. For exam...

